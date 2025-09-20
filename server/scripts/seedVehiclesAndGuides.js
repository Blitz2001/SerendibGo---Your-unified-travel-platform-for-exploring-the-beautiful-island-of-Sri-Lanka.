const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Guide = require('../models/Guide');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

// Sample vehicle data
const sampleVehicles = [
  {
    type: 'car',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC-1234',
    capacity: 5,
    features: ['ac', 'gps', 'automatic'],
    amenities: ['Bluetooth', 'USB Charging', 'Backup Camera'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500',
        caption: 'Toyota Corolla 2020',
        isPrimary: true
      }
    ],
    location: {
      city: 'Colombo',
      address: '123 Main Street, Colombo 01'
    },
    pricing: {
      hourly: 1500,
      daily: 8000,
      weekly: 50000,
      monthly: 180000,
      currency: 'LKR'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 30
    },
    insurance: {
      hasInsurance: true,
      insuranceProvider: 'Ceylinco Insurance',
      policyNumber: 'INS001',
      expiryDate: new Date('2025-12-31')
    },
    description: 'Well-maintained Toyota Corolla perfect for city tours and airport transfers.',
    terms: 'Valid driving license required. Fuel not included. Return with same fuel level.',
    cancellationPolicy: 'moderate'
  },
  {
    type: 'van',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2019,
    licensePlate: 'XYZ-5678',
    capacity: 12,
    features: ['ac', 'gps', 'manual', 'luggage_rack'],
    amenities: ['Air Conditioning', 'Music System', 'Comfortable Seats'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=500',
        caption: 'Toyota Hiace Van',
        isPrimary: true
      }
    ],
    location: {
      city: 'Kandy',
      address: '456 Lake Road, Kandy'
    },
    pricing: {
      hourly: 2500,
      daily: 12000,
      weekly: 75000,
      monthly: 250000,
      currency: 'LKR'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 30
    },
    insurance: {
      hasInsurance: true,
      insuranceProvider: 'Allianz Insurance',
      policyNumber: 'INS002',
      expiryDate: new Date('2025-10-31')
    },
    description: 'Spacious van ideal for group tours and family trips.',
    terms: 'Valid driving license required. Driver available on request for additional fee.',
    cancellationPolicy: 'flexible'
  },
  {
    type: 'jeep',
    brand: 'Mahindra',
    model: 'Thar',
    year: 2021,
    licensePlate: 'DEF-9012',
    capacity: 4,
    features: ['4wd', 'manual', 'roof_rack'],
    amenities: ['4x4 Capability', 'Off-road Ready', 'Adventure Equipment'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        caption: 'Mahindra Thar Jeep',
        isPrimary: true
      }
    ],
    location: {
      city: 'Sigiriya',
      address: '789 Rock Road, Sigiriya'
    },
    pricing: {
      hourly: 2000,
      daily: 10000,
      weekly: 60000,
      monthly: 200000,
      currency: 'LKR'
    },
    availability: {
      isAvailable: true,
      minimumRental: 1,
      maximumRental: 30
    },
    insurance: {
      hasInsurance: true,
      insuranceProvider: 'Janashakthi Insurance',
      policyNumber: 'INS003',
      expiryDate: new Date('2025-08-31')
    },
    description: 'Rugged 4x4 jeep perfect for safari tours and adventure trips.',
    terms: 'Off-road driving experience required. Adventure equipment included.',
    cancellationPolicy: 'strict'
  }
];

// Sample guide data
const sampleGuides = [
  {
    profile: {
      bio: 'Experienced cultural guide with 8 years of experience in showcasing Sri Lanka\'s rich heritage and traditions.',
      experience: 8,
      specializations: ['cultural', 'historical', 'religious'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'Tamil', proficiency: 'conversational' }
      ],
      profileImage: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        caption: 'Cultural Guide'
      }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip', 'multi-day'],
      locations: [
        { city: 'Kandy', region: 'Central Province', country: 'Sri Lanka' },
        { city: 'Anuradhapura', region: 'North Central Province', country: 'Sri Lanka' },
        { city: 'Polonnaruwa', region: 'North Central Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 15 },
      duration: { min: 1, max: 7 }
    },
    pricing: {
      hourly: 2000,
      daily: 8000,
      weekly: 45000,
      currency: 'LKR',
      includes: ['transportation', 'entrance_fees', 'none']
    },
    availability: {
      isAvailable: true,
      schedule: [
        { day: 'monday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'tuesday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'wednesday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'thursday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'friday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'saturday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'sunday', startTime: '08:00', endTime: '18:00', isAvailable: true }
      ],
      advanceBooking: 1,
      maxBookingsPerDay: 2
    },
    rating: {
      average: 4.8,
      count: 45
    },
    statistics: {
      totalTours: 120,
      totalClients: 95,
      completionRate: 98,
      responseTime: 2
    },
    status: 'active',
    verification: {
      isVerified: true,
      verifiedAt: new Date('2024-01-15')
    }
  },
  {
    profile: {
      bio: 'Wildlife and nature specialist with expertise in national parks and conservation areas across Sri Lanka.',
      experience: 12,
      specializations: ['wildlife', 'nature', 'adventure', 'eco-tourism'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'German', proficiency: 'conversational' }
      ],
      profileImage: {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
        caption: 'Wildlife Guide'
      }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip', 'multi-day', 'luxury'],
      locations: [
        { city: 'Yala', region: 'Southern Province', country: 'Sri Lanka' },
        { city: 'Wilpattu', region: 'North Western Province', country: 'Sri Lanka' },
        { city: 'Udawalawe', region: 'Sabaragamuwa Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 8 },
      duration: { min: 1, max: 5 }
    },
    pricing: {
      hourly: 2500,
      daily: 10000,
      weekly: 60000,
      currency: 'LKR',
      includes: ['transportation', 'equipment', 'none']
    },
    availability: {
      isAvailable: true,
      schedule: [
        { day: 'monday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'tuesday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'wednesday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'thursday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'friday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'saturday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'sunday', startTime: '06:00', endTime: '20:00', isAvailable: true }
      ],
      advanceBooking: 2,
      maxBookingsPerDay: 1
    },
    rating: {
      average: 4.9,
      count: 78
    },
    statistics: {
      totalTours: 200,
      totalClients: 150,
      completionRate: 100,
      responseTime: 1
    },
    status: 'active',
    verification: {
      isVerified: true,
      verifiedAt: new Date('2024-01-10')
    }
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a sample user to assign as owner
    const sampleUser = await User.findOne({});
    if (!sampleUser) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    // Check if user already has vehicles/guides and skip if they do
    const existingVehicles = await Vehicle.find({ owner: sampleUser._id });
    const existingGuides = await Guide.find({ user: sampleUser._id });

    if (existingVehicles.length > 0) {
      console.log(`🚗 User already has ${existingVehicles.length} vehicles, skipping vehicle creation`);
    } else {
      // Seed vehicles
      const vehiclesWithOwner = sampleVehicles.map(vehicle => ({
        ...vehicle,
        owner: sampleUser._id
      }));
      
      const createdVehicles = await Vehicle.insertMany(vehiclesWithOwner);
      console.log(`🚗 Created ${createdVehicles.length} vehicles`);
    }

    if (existingGuides.length > 0) {
      console.log(`🧭 User already has ${existingGuides.length} guide profiles, skipping guide creation`);
    } else {
      // Seed guides
      const guidesWithUser = sampleGuides.map(guide => ({
        ...guide,
        user: sampleUser._id
      }));
      
      const createdGuides = await Guide.insertMany(guidesWithUser);
      console.log(`🧭 Created ${createdGuides.length} guides`);
    }

    // Get final counts
    const finalVehicles = await Vehicle.find({ owner: sampleUser._id });
    const finalGuides = await Guide.find({ user: sampleUser._id });

    console.log('✅ Seeding completed successfully!');
    console.log('\n📊 Final Data Status:');
    console.log(`   Vehicles: ${finalVehicles.length}`);
    console.log(`   Guides: ${finalGuides.length}`);
    
    // Display existing/created items
    if (finalVehicles.length > 0) {
      console.log('\n🚗 Vehicles:');
      finalVehicles.forEach(vehicle => {
        console.log(`   - ${vehicle.brand} ${vehicle.model} (${vehicle.type}) - LKR ${vehicle.pricing.daily}/day`);
      });
    }
    
    if (finalGuides.length > 0) {
      console.log('\n🧭 Guides:');
      finalGuides.forEach(guide => {
        console.log(`   - ${guide.profile.specializations.join(', ')} Guide - LKR ${guide.pricing.daily}/day`);
      });
    }

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;