const mongoose = require('mongoose');
require('dotenv').config({ path: '../env.local' });

// Import models
const User = require('../models/User');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Vehicle = require('../models/Vehicle');
const Guide = require('../models/Guide');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    profile: {
      phone: '+94712345678',
      address: {
        street: '123 Main Street',
        city: 'Colombo',
        state: 'Western Province',
        zipCode: '10000',
        country: 'Sri Lanka'
      },
      nationality: 'American',
      preferences: ['cultural', 'adventure']
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    profile: {
      phone: '+94723456789',
      address: {
        street: '456 Temple Road',
        city: 'Kandy',
        state: 'Central Province',
        zipCode: '20000',
        country: 'Sri Lanka'
      },
      nationality: 'British',
      preferences: ['nature', 'relaxation']
    }
  },
  {
    name: 'Admin User',
    email: 'admin@serendibgo.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      phone: '+94734567890',
      address: {
        street: '789 Admin Avenue',
        city: 'Colombo',
        state: 'Western Province',
        zipCode: '10000',
        country: 'Sri Lanka'
      },
      nationality: 'Sri Lankan'
    }
  },
  {
    name: 'Ravi Perera',
    email: 'ravi@serendibgo.com',
    password: 'guide123',
    role: 'guide',
    profile: {
      phone: '+94711234567',
      address: {
        street: '321 Guide Street',
        city: 'Colombo',
        state: 'Western Province',
        zipCode: '10000',
        country: 'Sri Lanka'
      },
      nationality: 'Sri Lankan',
      preferences: ['cultural', 'historical']
    }
  },
  {
    name: 'Priya Fernando',
    email: 'priya@serendibgo.com',
    password: 'guide123',
    role: 'guide',
    profile: {
      phone: '+94722345678',
      address: {
        street: '654 Nature Road',
        city: 'Kandy',
        state: 'Central Province',
        zipCode: '20000',
        country: 'Sri Lanka'
      },
      nationality: 'Sri Lankan',
      preferences: ['wildlife', 'adventure']
    }
  },
  {
    name: 'Kumar Rajapaksa',
    email: 'kumar@serendibgo.com',
    password: 'guide123',
    role: 'guide',
    profile: {
      phone: '+94733456789',
      address: {
        street: '987 Beach Avenue',
        city: 'Galle',
        state: 'Southern Province',
        zipCode: '80000',
        country: 'Sri Lanka'
      },
      nationality: 'Sri Lankan',
      preferences: ['beach', 'water_sports']
    }
  }
];

const sampleTours = [
  {
    title: 'Cultural Heritage Tour - Kandy',
    description: 'Explore the ancient temples and cultural sites of Kandy, the last capital of the Sinhala kings. Visit the Temple of the Tooth, Royal Botanical Gardens, and experience traditional dance performances.',
    location: 'Kandy',
    duration: 2,
    price: 15000,
    currency: 'LKR',
    category: 'cultural',
    difficulty: 'easy',
    maxParticipants: 15,
    maxGroupSize: 15,
    rating: { average: 4.5, count: 12 },
    images: [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', caption: 'Temple of the Tooth' },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', caption: 'Royal Botanical Gardens' }
    ],
    highlights: ['Temple of the Tooth', 'Royal Botanical Gardens', 'Traditional Dance', 'Tea Plantations'],
    included: ['Hotel accommodation', 'Meals', 'Transport', 'Guide', 'Entrance fees'],
    excluded: ['Personal expenses', 'Tips', 'Optional activities'],
    itinerary: [
      { day: 1, title: 'Arrival & Temple Visit', description: 'Check-in, visit Temple of the Tooth, evening cultural show' },
      { day: 2, title: 'Gardens & Tea Tour', description: 'Royal Botanical Gardens, tea plantation visit, return to Colombo' }
    ]
  },
  {
    title: 'Adventure Safari - Yala National Park',
    description: 'Experience wildlife safari in Yala National Park, home to leopards, elephants, and diverse bird species. Perfect for nature lovers and photography enthusiasts.',
    location: 'Yala',
    duration: 1,
    price: 8000,
    currency: 'LKR',
    category: 'wildlife',
    difficulty: 'moderate',
    maxParticipants: 8,
    maxGroupSize: 8,
    rating: { average: 4.8, count: 25 },
    images: [
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', caption: 'Wildlife Safari' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', caption: 'Elephant Herd' }
    ],
    highlights: ['Leopard spotting', 'Elephant herds', 'Bird watching', 'Safari experience'],
    included: ['Safari jeep', 'Expert guide', 'Park entrance', 'Refreshments'],
    excluded: ['Accommodation', 'Meals', 'Transport to park'],
    itinerary: [
      { day: 1, title: 'Full Day Safari', description: 'Early morning safari, lunch break, afternoon safari, return to hotel' }
    ]
  },
  {
    title: 'Beach Paradise - Mirissa',
    description: 'Relax on pristine beaches, go whale watching, and enjoy water sports in beautiful Mirissa. Perfect for beach lovers and adventure seekers.',
    location: 'Mirissa',
    duration: 3,
    price: 12000,
    currency: 'LKR',
    category: 'beach',
    difficulty: 'easy',
    maxParticipants: 12,
    maxGroupSize: 12,
    rating: { average: 4.6, count: 18 },
    images: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', caption: 'Mirissa Beach' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', caption: 'Whale Watching' }
    ],
    highlights: ['Whale watching', 'Beach relaxation', 'Water sports', 'Sunset views'],
    included: ['Beachfront accommodation', 'Whale watching tour', 'Water sports equipment', 'Beach transfers'],
    excluded: ['Meals', 'Personal expenses', 'Optional activities'],
    itinerary: [
      { day: 1, title: 'Arrival & Beach Time', description: 'Check-in, beach relaxation, sunset viewing' },
      { day: 2, title: 'Whale Watching', description: 'Early morning whale watching, afternoon beach activities' },
      { day: 3, title: 'Water Sports', description: 'Water sports, beach time, return to Colombo' }
    ]
  },
  {
    title: 'Hill Country Trek - Ella',
    description: 'Trek through the beautiful hill country of Ella, visit tea plantations, and enjoy stunning mountain views. Perfect for adventure and nature lovers.',
    location: 'Ella',
    duration: 2,
    price: 18000,
    currency: 'LKR',
    category: 'adventure',
    difficulty: 'moderate',
    maxParticipants: 10,
    maxGroupSize: 10,
    rating: { average: 4.7, count: 20 },
    images: [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', caption: 'Ella Rock' },
      { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', caption: 'Tea Plantations' }
    ],
    highlights: ['Ella Rock trek', 'Tea plantations', 'Mountain views', 'Local villages'],
    included: ['Accommodation', 'Meals', 'Guide', 'Equipment', 'Transport'],
    excluded: ['Personal expenses', 'Tips', 'Optional activities'],
    itinerary: [
      { day: 1, title: 'Arrival & Short Trek', description: 'Check-in, short trek to viewpoint, local dinner' },
      { day: 2, title: 'Ella Rock Trek', description: 'Full day trek to Ella Rock, return to Colombo' }
    ]
  }
];

const sampleHotels = [
  {
    name: 'Colombo Grand Hotel',
    description: 'Luxury 5-star hotel in the heart of Colombo with stunning ocean views and world-class amenities. Experience unparalleled comfort and service in Sri Lanka\'s capital city.',
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
        totalRooms: 15,
        availableRooms: 10,
        amenities: ['ocean_view', 'balcony', 'minibar', 'room_service']
      },
      {
        name: 'Executive Suite',
        type: 'suite',
        description: 'Luxury suite with separate living area and premium services',
        price: 45000,
        currency: 'LKR',
        capacity: 4,
        totalRooms: 8,
        availableRooms: 5,
        amenities: ['ocean_view', 'balcony', 'minibar', 'room_service']
      }
    ],
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation up to 24 hours before arrival',
      pets: { allowed: false },
      smoking: { allowed: false }
    },
    contact: {
      phone: '+94112345678',
      email: 'info@colombogrand.com',
      website: 'https://colombogrand.com'
    },
    rating: { average: 4.8, count: 156 },
    isActive: true
  },
  {
    name: 'Kandy Heritage Inn',
    description: 'Charming boutique hotel in the cultural capital, offering authentic Sri Lankan hospitality and traditional experiences in the heart of Kandy.',
    location: {
      address: {
        street: '456 Temple Road',
        city: 'Kandy',
        state: 'Central Province',
        zipCode: '20000',
        country: 'Sri Lanka'
      },
      coordinates: { 
        latitude: 7.2906, 
        longitude: 80.6337 
      }
    },
    starRating: 4,
    category: 'comfort',
    amenities: ['garden', 'restaurant', 'concierge'],
    images: [
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500', caption: 'Heritage Building', category: 'exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', caption: 'Garden View', category: 'surrounding' }
    ],
    rooms: [
      {
        name: 'Heritage Room',
        type: 'double',
        description: 'Traditional room with colonial charm and modern comfort',
        price: 18000,
        currency: 'LKR',
        capacity: 2,
        totalRooms: 12,
        availableRooms: 8,
        amenities: ['garden_view', 'air_conditioning', 'private_bathroom']
      },
      {
        name: 'Family Suite',
        type: 'family',
        description: 'Spacious suite perfect for families with cultural activities',
        price: 28000,
        currency: 'LKR',
        capacity: 4,
        totalRooms: 5,
        availableRooms: 3,
        amenities: ['garden_view', 'air_conditioning', 'private_bathroom', 'balcony']
      }
    ],
    policies: {
      checkIn: '13:00',
      checkOut: '10:00',
      cancellation: 'Free cancellation up to 48 hours before arrival',
      pets: { allowed: false },
      smoking: { allowed: false }
    },
    contact: {
      phone: '+94812345678',
      email: 'info@kandyheritage.com',
      website: 'https://kandyheritage.com'
    },
    rating: { average: 4.6, count: 89 },
    isActive: true
  },
  {
    name: 'Galle Beach Resort',
    description: 'Beachfront resort offering the perfect blend of luxury and nature in the historic city of Galle. Experience pristine beaches and colonial charm.',
    location: {
      address: {
        street: '789 Beach Road',
        city: 'Galle',
        state: 'Southern Province',
        zipCode: '80000',
        country: 'Sri Lanka'
      },
      coordinates: { 
        latitude: 6.0535, 
        longitude: 80.2210 
      }
    },
    starRating: 4,
    category: 'first_class',
    amenities: ['beach_access', 'swimming_pool', 'spa', 'restaurant', 'bar'],
    images: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', caption: 'Beachfront View', category: 'exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500', caption: 'Resort Pool', category: 'amenity' }
    ],
    rooms: [
      {
        name: 'Beach View Room',
        type: 'double',
        description: 'Room with direct beach access and stunning ocean views',
        price: 22000,
        currency: 'LKR',
        capacity: 2,
        totalRooms: 18,
        availableRooms: 12,
        amenities: ['ocean_view', 'balcony', 'minibar', 'air_conditioning']
      },
      {
        name: 'Ocean Villa',
        type: 'suite',
        description: 'Private villa with exclusive beach access and luxury amenities',
        price: 55000,
        currency: 'LKR',
        capacity: 4,
        totalRooms: 6,
        availableRooms: 4,
        amenities: ['ocean_view', 'balcony', 'minibar', 'air_conditioning', 'room_service']
      }
    ],
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation up to 72 hours before arrival',
      pets: { allowed: false },
      smoking: { allowed: false }
    },
    contact: {
      phone: '+94912345678',
      email: 'info@gallebeach.com',
      website: 'https://gallebeach.com'
    },
    rating: { average: 4.7, count: 134 },
    isActive: true
  }
];

const sampleVehicles = [
  {
    description: 'Comfortable 12-seater van perfect for group tours and airport transfers.',
    type: 'van',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2022,
    licensePlate: 'ABC-1234',
    capacity: 12,
    features: ['ac', 'wifi', 'gps', 'entertainment', 'luggage_rack'],
    images: [
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Toyota Hiace Van', isPrimary: true },
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
      address: '123 Vehicle Depot, Colombo'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 7
    },
    rating: { average: 4.6, count: 45 },
    status: 'active'
  },
  {
    description: 'Compact and fuel-efficient car ideal for city tours and short trips.',
    type: 'car',
    brand: 'Suzuki',
    model: 'Swift',
    year: 2023,
    licensePlate: 'DEF-5678',
    capacity: 5,
    features: ['ac', 'gps', 'entertainment'],
    images: [
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Suzuki Swift', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Interior' }
    ],
    pricing: {
      hourly: 1500,
      daily: 8000,
      weekly: 45000,
      currency: 'LKR'
    },
    location: {
      city: 'Colombo',
      address: '456 Car Rental, Colombo'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 14
    },
    rating: { average: 4.4, count: 32 },
    status: 'active'
  },
  {
    description: 'Premium 4x4 vehicle perfect for adventure tours and off-road experiences.',
    type: 'jeep',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2021,
    licensePlate: 'GHI-9012',
    capacity: 7,
    features: ['ac', '4wd', 'gps', 'entertainment'],
    images: [
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Land Cruiser 4x4', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Luxury Interior' }
    ],
    pricing: {
      hourly: 5000,
      daily: 25000,
      weekly: 150000,
      currency: 'LKR'
    },
    location: {
      city: 'Kandy',
      address: '789 Adventure Tours, Kandy'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 7
    },
    rating: { average: 4.9, count: 28 },
    status: 'active'
  },
  {
    description: 'Reliable and economical scooter perfect for solo travelers and short city trips.',
    type: 'motorcycle',
    brand: 'Honda',
    model: 'Activa',
    year: 2023,
    licensePlate: 'JKL-3456',
    capacity: 2,
    features: ['ac'],
    images: [
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Honda Activa Scooter', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', caption: 'Side View' }
    ],
    pricing: {
      hourly: 500,
      daily: 2500,
      weekly: 15000,
      currency: 'LKR'
    },
    location: {
      city: 'Galle',
      address: '321 Scooter Rental, Galle'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 30
    },
    rating: { average: 4.3, count: 67 },
    status: 'active'
  }
];

const sampleGuides = [
  {
    user: null, // Will be set after creating users
    profile: {
      bio: 'Experienced guide with deep knowledge of Sri Lankan culture and history.',
      experience: 8,
      specializations: ['cultural', 'historical', 'religious'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'Tamil', proficiency: 'conversational' }
      ],
      profileImage: { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', caption: 'Ravi Perera' }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip', 'multi-day'],
      locations: [
        { city: 'Colombo', region: 'Central Province', country: 'Sri Lanka' },
        { city: 'Kandy', region: 'Central Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 15 },
      duration: { min: 1, max: 7 }
    },
    pricing: {
      hourly: 2000,
      daily: 15000,
      weekly: 90000,
      currency: 'LKR',
      includes: ['transportation', 'entrance_fees', 'none']
    },
    availability: {
      isAvailable: true,
      advanceBooking: 2
    },
    rating: { average: 4.8, count: 45 },
    status: 'active'
  },
  {
    user: null, // Will be set after creating users
    profile: {
      bio: 'Nature enthusiast and wildlife expert, perfect for adventure tours.',
      experience: 5,
      specializations: ['wildlife', 'adventure', 'nature'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' }
      ],
      profileImage: { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', caption: 'Priya Fernando' }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip'],
      locations: [
        { city: 'Kandy', region: 'Central Province', country: 'Sri Lanka' },
        { city: 'Yala', region: 'Southern Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 10 },
      duration: { min: 1, max: 5 }
    },
    pricing: {
      hourly: 1800,
      daily: 12000,
      weekly: 70000,
      currency: 'LKR',
      includes: ['transportation', 'equipment', 'none']
    },
    availability: {
      isAvailable: true,
      advanceBooking: 1
    },
    rating: { average: 4.6, count: 32 },
    status: 'active'
  },
  {
    user: null, // Will be set after creating users
    profile: {
      bio: 'Coastal expert with extensive knowledge of beach activities and water sports.',
      experience: 6,
      specializations: ['adventure', 'nature', 'eco-tourism'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'Hindi', proficiency: 'conversational' }
      ],
      profileImage: { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', caption: 'Kumar Rajapaksa' }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip'],
      locations: [
        { city: 'Galle', region: 'Southern Province', country: 'Sri Lanka' },
        { city: 'Mirissa', region: 'Southern Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 12 },
      duration: { min: 1, max: 3 }
    },
    pricing: {
      hourly: 1900,
      daily: 14000,
      weekly: 80000,
      currency: 'LKR',
      includes: ['transportation', 'equipment', 'none']
    },
    availability: {
      isAvailable: true,
      advanceBooking: 1
    },
    rating: { average: 4.7, count: 28 },
    status: 'active'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
// Clear existing data
    await User.deleteMany({});
    await Tour.deleteMany({});
    await Hotel.deleteMany({});
    await Vehicle.deleteMany({});
    await Guide.deleteMany({});
    
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`👥 Created ${createdUsers.length} users`);
    
    // Get guide users (last 3 users)
    const guideUsers = createdUsers.slice(-3);
    
    // Create guides with user references
    const guidesWithUsers = sampleGuides.map((guide, index) => ({
      ...guide,
      user: guideUsers[index]._id
    }));
    const createdGuides = await Guide.create(guidesWithUsers);
    console.log(`👨‍💼 Created ${createdGuides.length} guides`);
    
    // Create tours with guide references
    const toursWithGuides = sampleTours.map((tour, index) => ({
      ...tour,
      guide: createdGuides[index % createdGuides.length]._id
    }));
    const createdTours = await Tour.create(toursWithGuides);
    console.log(`🗺️  Created ${createdTours.length} tours`);

    // Create hotels with owner references (assign to admin user)
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const hotelsWithOwners = sampleHotels.map(hotel => ({
      ...hotel,
      owner: adminUser._id
    }));
    const createdHotels = await Hotel.create(hotelsWithOwners);
    console.log(`🏨  Created ${createdHotels.length} hotels`);

    // Create vehicles with owner references (assign to admin user)
    const vehiclesWithOwners = sampleVehicles.map(vehicle => ({
      ...vehicle,
      owner: adminUser._id
    }));
    const createdVehicles = await Vehicle.create(vehiclesWithOwners);
    console.log(`🚗  Created ${createdVehicles.length} vehicles`);
    
    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Tours: ${createdTours.length}`);
    console.log(`- Guides: ${createdGuides.length}`);
    console.log(`- Hotels: ${createdHotels.length}`);
    console.log(`- Vehicles: ${createdVehicles.length}`);
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('Tourist: john@example.com / password123');
    console.log('Guide: ravi@serendibgo.com / guide123');
    console.log('Admin: admin@serendibgo.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
