const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['car', 'van', 'bus', 'jeep', 'motorcycle', 'bicycle', 'boat', 'helicopter']
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  features: [{
    type: String,
    enum: ['ac', 'wifi', 'gps', 'entertainment', 'wheelchair', 'child_seat', 'luggage_rack', 'roof_rack', '4wd', 'automatic', 'manual']
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  location: {
    city: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
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
    monthly: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    availableFrom: Date,
    availableTo: Date,
    blackoutDates: [Date],
    minimumRental: {
      type: Number,
      default: 1,
      min: 1
    },
    maximumRental: {
      type: Number,
      default: 30,
      min: 1
    }
  },
  insurance: {
    hasInsurance: {
      type: Boolean,
      default: false
    },
    insuranceProvider: String,
    policyNumber: String,
    expiryDate: Date
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['registration', 'insurance', 'permit', 'license', 'other']
    },
    expiryDate: Date
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive', 'suspended'],
    default: 'active'
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
      default: 0,
      min: 0
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  terms: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
vehicleSchema.index({ type: 1, location: 1 });
vehicleSchema.index({ owner: 1, status: 1 });
vehicleSchema.index({ 'availability.isAvailable': 1, 'availability.availableFrom': 1, 'availability.availableTo': 1 });
vehicleSchema.index({ rating: 1 });
vehicleSchema.index({ 'pricing.daily': 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
