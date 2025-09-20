const mongoose = require('mongoose');
require('dotenv').config({ path: '../env.local' });

// Import models
const Hotel = require('../models/Hotel');
const Vehicle = require('../models/Vehicle');

// Sample data
const sampleHotel = {
  name: 'Colombo Grand Hotel',
  description: 'Luxury 5-star hotel in the heart of Colombo with stunning ocean views and world-class amenities.',
  location: {
    address: '123 Marine Drive',
    city: 'Colombo',
    state: 'Western Province',
    zipCode: '10000',
    country: 'Sri Lanka',
    coordinates: { lat: 6.9271, lng: 79.8612 }
  },
  starRating: 5,
  category: 'luxury',
  amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar', 'concierge', 'room_service'],
  images: [
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500', caption: 'Hotel Exterior' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500', caption: 'Luxury Room' }
  ],
  rooms: [
    {
      type: 'Deluxe Ocean View',
      description: 'Spacious room with ocean view and modern amenities',
      price: 25000,
      currency: 'LKR',
      capacity: 2,
      available: 10,
      amenities: ['ocean_view', 'balcony', 'minibar', 'room_service']
    },
    {
      type: 'Executive Suite',
      description: 'Luxury suite with separate living area and premium services',
      price: 45000,
      currency: 'LKR',
      capacity: 4,
      available: 5,
      amenities: ['ocean_view', 'balcony', 'minibar', 'room_service', 'concierge']
    }
  ],
  policies: {
    checkIn: '14:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 24 hours before arrival',
    pets: false,
    smoking: false
  },
  contact: {
    phone: '+94112345678',
    email: 'info@colombogrand.com',
    website: 'https://colombogrand.com'
  },
  rating: { average: 4.8, count: 156 },
  isActive: true
};

const sampleVehicle = {
  name: 'Toyota Hiace Van',
  description: 'Comfortable 12-seater van perfect for group tours and airport transfers.',
  type: 'van',
  category: 'passenger',
  brand: 'Toyota',
  model: 'Hiace',
  year: 2022,
  transmission: 'automatic',
  fuelType: 'diesel',
  seats: 12,
  features: ['ac', 'wifi', 'usb_charging', 'comfortable_seating', 'luggage_space'],
  images: [
    { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Toyota Hiace Van' },
    { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Interior View' }
  ],
  pricing: {
    hourly: 3000,
    daily: 15000,
    weekly: 90000,
    currency: 'LKR'
  },
  location: {
    city: 'Colombo',
    state: 'Western Province',
    country: 'Sri Lanka'
  },
  availability: {
    isAvailable: true,
    advanceBooking: 3
  },
  rating: { average: 4.6, count: 45 },
  isActive: true
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Clear existing data
    await Hotel.deleteMany({});
    await Vehicle.deleteMany({});
    console.log('🗑️  Cleared existing hotels and vehicles');

    // Create sample hotel
    const createdHotel = await Hotel.create(sampleHotel);
    console.log(`🏨 Created hotel: ${createdHotel.name}`);

    // Create sample vehicle
    const createdVehicle = await Vehicle.create(sampleVehicle);
    console.log(`🚗 Created vehicle: ${createdVehicle.name}`);

    console.log('✅ Sample data added successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Hotels: 1`);
    console.log(`- Vehicles: 1`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('💡 Make sure MongoDB is running and MONGODB_URI is set correctly');
  process.exit(1);
});
