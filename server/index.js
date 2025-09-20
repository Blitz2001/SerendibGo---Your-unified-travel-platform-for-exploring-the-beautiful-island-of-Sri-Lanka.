const express = require('express');
const mongoose = require('mongoose'); // MongoDB local connection
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const reminderService = require('./services/reminderService');
require('dotenv').config({ path: '../env.local' });

// Import models to ensure schemas are registered
require('./models/User');
require('./models/Tour');
require('./models/TourBooking');
require('./models/VehicleBooking');
require('./models/GuideBooking');
require('./models/Hotel');
require('./models/Vehicle');
require('./models/Guide');
require('./models/Review');
require('./models/Booking');
require('./models/Payment');
require('./models/Message');
require('./models/VehicleRental');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const hotelRoutes = require('./routes/hotels');
const vehicleRoutes = require('./routes/vehicles');
const guideRoutes = require('./routes/guides');
const tourRoutes = require('./routes/tours');
const bookingRoutes = require('./routes/bookings');
const vehicleBookingRoutes = require('./routes/vehicleBookings');
const guideBookingRoutes = require('./routes/guideBookings');
const paymentRoutes = require('./routes/payments');
const supportRoutes = require('./routes/support');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const chatbotRoutes = require('./routes/chatbot');
const tripRequestRoutes = require('./routes/tripRequests');
const messageRoutes = require('./routes/messages');
const vehicleRentalRoutes = require('./routes/vehicleRentals');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SerendibGo Server is running with Local MongoDB',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'MongoDB Local',
    note: 'Full features enabled with local database'
  });
});

// Demo data endpoint
app.get('/api/demo/tours', (req, res) => {
  res.json({
    success: true,
    message: 'Demo tours data (Local MongoDB)',
    data: {
      tours: [
        {
          id: 'demo-1',
          title: 'Cultural Heritage Tour - Kandy',
          description: 'Explore the ancient temples and cultural sites of Kandy, the last capital of the Sinhala kings.',
          location: 'Kandy',
          duration: 2,
          price: 15000,
          category: 'cultural',
          difficulty: 'easy',
          rating: { average: 4.5, count: 12 },
          images: [
            { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', caption: 'Temple of the Tooth' }
          ]
        },
        {
          id: 'demo-2',
          title: 'Adventure Safari - Yala National Park',
          description: 'Experience wildlife safari in Yala National Park, home to leopards, elephants, and diverse bird species.',
          location: 'Yala',
          duration: 1,
          price: 8000,
          category: 'wildlife',
          difficulty: 'moderate',
          rating: { average: 4.8, count: 25 },
          images: [
            { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', caption: 'Wildlife Safari' }
          ]
        },
        {
          id: 'demo-3',
          title: 'Beach Paradise - Mirissa',
          description: 'Relax on pristine beaches, go whale watching, and enjoy water sports in beautiful Mirissa.',
          location: 'Mirissa',
          duration: 3,
          price: 12000,
          category: 'beach',
          difficulty: 'easy',
          rating: { average: 4.6, count: 18 },
          images: [
            { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', caption: 'Mirissa Beach' }
          ]
        }
      ]
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SerendibGo API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'SerendibGo API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Temporary endpoint to populate sample data (only in development)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/populate-sample-data', async (req, res) => {
  try {
    const Hotel = require('./models/Hotel');
    const Vehicle = require('./models/Vehicle');
    const User = require('./models/User');

    // First, create a user to be the owner
    let ownerUser = await User.findOne({ role: 'admin' });
    if (!ownerUser) {
      // Try to find a hotel_owner user instead
      ownerUser = await User.findOne({ role: 'hotel_owner' });
      if (!ownerUser) {
        return res.status(400).json({
          success: false,
          message: 'No admin or hotel owner user found. Please create a user first.'
        });
      }
    }

    // Sample hotel data
    const sampleHotel = {
      name: 'Colombo Grand Hotel',
      owner: ownerUser._id,
      description: 'Luxury 5-star hotel in the heart of Colombo with stunning ocean views and world-class amenities.',
      location: {
        address: {
          street: '123 Marine Drive',
          city: 'Colombo',
          state: 'Western Province',
          zipCode: '10000',
          country: 'Sri Lanka'
        },
        coordinates: {
          latitude: 6.9271,
          longitude: 79.8612
        }
      },
      starRating: 5,
      category: 'luxury',
      amenities: ['swimming_pool', 'spa', 'gym', 'restaurant', 'bar', 'concierge', 'room_service'],
      images: [
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500', caption: 'Hotel Exterior', category: 'exterior', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500', caption: 'Luxury Room', category: 'room' }
      ],
      rooms: [
        {
          name: 'Deluxe Ocean View Room',
          type: 'deluxe',
          description: 'Spacious room with ocean view and modern amenities',
          price: 25000,
          currency: 'LKR',
          capacity: 2,
          totalRooms: 10,
          availableRooms: 8,
          amenities: ['air_conditioning', 'wifi', 'tv', 'minibar', 'balcony', 'ocean_view', 'private_bathroom', 'shower', 'bathtub', 'hair_dryer', 'towels', 'bedding', 'desk', 'wardrobe', 'safe', 'telephone', 'room_service'],
          images: [
            { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500', caption: 'Deluxe Room', isPrimary: true }
          ]
        },
        {
          name: 'Executive Suite',
          type: 'suite',
          description: 'Luxury suite with separate living area and premium services',
          price: 45000,
          currency: 'LKR',
          capacity: 4,
          totalRooms: 5,
          availableRooms: 3,
          amenities: ['air_conditioning', 'wifi', 'tv', 'minibar', 'balcony', 'ocean_view', 'private_bathroom', 'shower', 'bathtub', 'hair_dryer', 'towels', 'bedding', 'desk', 'wardrobe', 'safe', 'telephone', 'room_service'],
          images: [
            { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500', caption: 'Executive Suite', isPrimary: true }
          ]
        }
      ],
      policies: {
        checkIn: '14:00',
        checkOut: '11:00',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        pets: {
          allowed: false
        },
        smoking: {
          allowed: false
        }
      },
      contact: {
        phone: '+94112345678',
        email: 'info@colombogrand.com',
        website: 'https://colombogrand.com'
      },
      rating: { average: 4.8, count: 156 },
      isActive: true,
      isVerified: true
    };

    // Sample vehicle data
    const sampleVehicle = {
      owner: ownerUser._id,
      type: 'van',
      brand: 'Toyota',
      model: 'Hiace',
      year: 2022,
      licensePlate: 'WP-ABC-1234',
      capacity: 12,
      features: ['ac', 'wifi', 'gps', 'entertainment', 'luggage_rack'],
      amenities: ['Comfortable seating', 'USB charging ports', 'Luggage space', 'Air conditioning'],
      images: [
        { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Toyota Hiace Van', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Interior View' }
      ],
      location: {
        city: 'Colombo',
        address: '123 Transport Hub, Colombo',
        coordinates: {
          lat: 6.9271,
          lng: 79.8612
        }
      },
      pricing: {
        hourly: 3000,
        daily: 15000,
        weekly: 90000,
        monthly: 300000,
        currency: 'LKR'
      },
      availability: {
        isAvailable: true,
        minimumRental: 1,
        maximumRental: 30
      },
      description: 'Comfortable 12-seater van perfect for group tours and airport transfers.',
      terms: 'Valid driving license required. Minimum age 25. Security deposit may apply.',
      cancellationPolicy: 'flexible',
      status: 'active',
      rating: { average: 4.6, count: 45 }
    };

    // Clear existing data and create new
    await Hotel.deleteMany({});
    await Vehicle.deleteMany({});

    const createdHotel = await Hotel.create(sampleHotel);
    const createdVehicle = await Vehicle.create(sampleVehicle);

    res.json({
      success: true,
      message: 'Sample data populated successfully',
      data: {
        hotel: createdHotel,
        vehicle: createdVehicle
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error populating sample data:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error populating sample data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
  });
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicle-bookings', vehicleBookingRoutes);
app.use('/api/guide-bookings', guideBookingRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/vehicle-rentals', vehicleRentalRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  logger.info('MongoDB Connected Successfully!');
  
  // Start server
  app.listen(PORT, () => {
      logger.info(`SerendibGo Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/health`,
        database: process.env.MONGODB_URI.includes('localhost') ? 'Local' : 'Atlas'
      });

      // Start reminder service
      if (process.env.NODE_ENV !== 'test') {
        reminderService.start();
      }
  });
})
.catch((error) => {
  logger.error('MongoDB connection error', { error: error.message });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
