const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'twin', 'triple', 'family', 'suite', 'deluxe', 'presidential']
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR', 'GBP']
  },
  description: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    enum: [
      'air_conditioning', 'wifi', 'tv', 'minibar', 'balcony', 'ocean_view', 'mountain_view',
      'city_view', 'garden_view', 'private_bathroom', 'shower', 'bathtub', 'hair_dryer',
      'towels', 'bedding', 'desk', 'wardrobe', 'safe', 'telephone', 'room_service',
      'daily_cleaning', 'laundry_service', 'breakfast_included', 'half_board', 'full_board'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms of this type is required'],
    min: [1, 'Must have at least 1 room']
  },
  availableRooms: {
    type: Number,
    required: [true, 'Available rooms count is required'],
    min: [0, 'Available rooms cannot be negative']
  }
}, {
  timestamps: true
});

// Virtual for occupancy rate
roomSchema.virtual('occupancyRate').get(function() {
  if (this.totalRooms === 0) return 0;
  return ((this.totalRooms - this.availableRooms) / this.totalRooms * 100).toFixed(1);
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hotel owner is required']
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    trim: true,
    minlength: [50, 'Description must be at least 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Hotel category is required'],
    enum: ['budget', 'standard', 'comfort', 'first_class', 'luxury', 'ultra_luxury']
  },
  starRating: {
    type: Number,
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5'],
    default: 3
  },
  location: {
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State/Province is required']
      },
      zipCode: String,
      country: {
        type: String,
        default: 'Sri Lanka'
      }
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required']
      }
    },
    nearbyAttractions: [{
      name: String,
      distance: Number, // in kilometers
      type: {
        type: String,
        enum: ['beach', 'mountain', 'city_center', 'airport', 'train_station', 'bus_station', 'shopping', 'restaurant', 'tourist_attraction']
      }
    }]
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+94|0)?[1-9][0-9]{8}$/, 'Please enter a valid Sri Lankan phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: String
  },
  amenities: [{
    type: String,
    enum: [
      'swimming_pool', 'spa', 'gym', 'restaurant', 'bar', 'cafe', 'conference_room',
      'business_center', 'parking', 'airport_shuttle', 'tour_desk', 'car_rental',
      'laundry_service', 'dry_cleaning', 'room_service', '24_hour_front_desk',
      'concierge', 'luggage_storage', 'currency_exchange', 'atm', 'gift_shop',
      'garden', 'terrace', 'rooftop', 'beach_access', 'mountain_view', 'city_view'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    category: {
      type: String,
      enum: ['exterior', 'lobby', 'room', 'amenity', 'surrounding', 'other'],
      default: 'other'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  rooms: [roomSchema],
  policies: {
    checkIn: {
      type: String,
      default: '14:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    cancellation: {
      type: String,
      required: [true, 'Cancellation policy is required']
    },
    children: {
      allowed: {
        type: Boolean,
        default: true
      },
      ageLimit: {
        type: Number,
        default: 12
      }
    },
    pets: {
      allowed: {
        type: Boolean,
        default: false
      },
      restrictions: String
    },
    smoking: {
      allowed: {
        type: Boolean,
        default: false
      },
      areas: [String]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  featured: {
    type: Boolean,
    default: false
  },
  seasonalRates: [{
    season: {
      type: String,
      enum: ['peak', 'shoulder', 'low']
    },
    startDate: Date,
    endDate: Date,
    multiplier: {
      type: Number,
      min: 0.5,
      max: 3.0
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
hotelSchema.index({ 'location.coordinates': '2dsphere' });
hotelSchema.index({ category: 1, starRating: 1 });
hotelSchema.index({ 'location.city': 1 });
hotelSchema.index({ owner: 1 });
hotelSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for average room price
hotelSchema.virtual('averageRoomPrice').get(function() {
  if (!this.rooms || this.rooms.length === 0) return 0;
  const totalPrice = this.rooms.reduce((sum, room) => sum + room.price, 0);
  return Math.round(totalPrice / this.rooms.length);
});

// Virtual for total rooms count
hotelSchema.virtual('totalRoomsCount').get(function() {
  if (!this.rooms || this.rooms.length === 0) return 0;
  return this.rooms.reduce((sum, room) => sum + room.totalRooms, 0);
});

// Virtual for available rooms count
hotelSchema.virtual('availableRoomsCount').get(function() {
  if (!this.rooms || this.rooms.length === 0) return 0;
  return this.rooms.reduce((sum, room) => sum + room.availableRooms, 0);
});

// Method to get public profile (without sensitive data)
hotelSchema.methods.getPublicProfile = function() {
  const hotelObject = this.toObject();
  delete hotelObject.owner;
  return hotelObject;
};

// Method to check room availability for specific dates
hotelSchema.methods.checkAvailability = function(checkIn, checkOut, guests = 1) {
  // This is a placeholder - in a real app, you'd check against actual bookings
  const availableRooms = this.rooms.filter(room => 
    room.isAvailable && room.availableRooms > 0 && room.capacity >= guests
  );
  return availableRooms.length > 0;
};

// Pre-save middleware to ensure only one primary image per category
hotelSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    // Ensure only one primary image overall
    let primaryCount = 0;
    this.images.forEach(image => {
      if (image.isPrimary) primaryCount++;
      if (primaryCount > 1) image.isPrimary = false;
    });
  }
  
  if (this.rooms && this.rooms.length > 0) {
    // Ensure only one primary image per room
    this.rooms.forEach(room => {
      if (room.images && room.images.length > 0) {
        let roomPrimaryCount = 0;
        room.images.forEach(image => {
          if (image.isPrimary) roomPrimaryCount++;
          if (roomPrimaryCount > 1) image.isPrimary = false;
        });
      }
    });
  }
  
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);
