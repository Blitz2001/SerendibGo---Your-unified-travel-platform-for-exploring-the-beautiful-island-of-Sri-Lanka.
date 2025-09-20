const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile: {
    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    experience: {
      type: Number,
      min: 0,
      default: 0
    },
    education: [{
      degree: String,
      institution: String,
      year: Number,
      field: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      expiryDate: Date,
      credentialId: String
    }],
    specializations: [{
      type: String,
      enum: ['cultural', 'historical', 'wildlife', 'adventure', 'culinary', 'photography', 'nature', 'religious', 'archaeological', 'eco-tourism', 'medical', 'language']
    }],
    languages: [{
      language: {
        type: String,
        required: true
      },
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational'
      }
    }],
    profileImage: {
      url: String,
      caption: String
    },
    gallery: [{
      url: String,
      caption: String,
      category: String
    }]
  },
  services: {
    tourTypes: [{
      type: String,
      enum: ['private', 'group', 'custom', 'day-trip', 'multi-day', 'luxury', 'budget', 'family', 'couple', 'solo']
    }],
    locations: [{
      city: String,
      region: String,
      country: {
        type: String,
        default: 'Sri Lanka'
      },
      coordinates: {
        lat: Number,
        lng: Number
      }
    }],
    groupSize: {
      min: {
        type: Number,
        default: 1,
        min: 1
      },
      max: {
        type: Number,
        default: 20,
        min: 1
      }
    },
    duration: {
      min: {
        type: Number,
        default: 1,
        min: 1
      },
      max: {
        type: Number,
        default: 14,
        min: 1
      }
    }
  },
  pricing: {
    hourly: {
      type: Number,
      min: 0
    },
    daily: {
      type: Number,
      required: true,
      min: 0
    },
    weekly: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    includes: [{
      type: String,
      enum: ['transportation', 'meals', 'entrance_fees', 'equipment', 'insurance', 'accommodation', 'none']
    }],
    additionalCosts: [{
      description: String,
      amount: Number,
      currency: String
    }]
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String,
      endTime: String,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    availableFrom: Date,
    availableTo: Date,
    blackoutDates: [Date],
    advanceBooking: {
      type: Number,
      default: 1,
      min: 0
    },
    maxBookingsPerDay: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['license', 'certification', 'insurance', 'passport', 'visa', 'other']
    },
    expiryDate: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  statistics: {
    totalTours: {
      type: Number,
      default: 0,
      min: 0
    },
    totalClients: {
      type: Number,
      default: 0,
      min: 0
    },
    completionRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    responseTime: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String
  },
  preferences: {
    communicationMethod: [{
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'messenger', 'in-app']
    }],
    responseTime: {
      type: String,
      enum: ['within_1_hour', 'within_4_hours', 'within_24_hours', 'next_day']
    },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
guideSchema.index({ 'services.specializations': 1 });
guideSchema.index({ 'services.locations.city': 1 });
guideSchema.index({ 'pricing.daily': 1 });
guideSchema.index({ rating: 1 });
guideSchema.index({ status: 1, 'availability.isAvailable': 1 });
guideSchema.index({ 'services.languages.language': 1 });

module.exports = mongoose.model('Guide', guideSchema);
