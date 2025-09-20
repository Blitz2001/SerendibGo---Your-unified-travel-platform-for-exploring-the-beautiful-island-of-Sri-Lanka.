const mongoose = require('mongoose');

const vehicleRentalSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rentalType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true
  },
  dropoffLocation: {
    type: String,
    trim: true
  },
  driverRequired: {
    type: Boolean,
    default: false
  },
  insurance: {
    type: Boolean,
    default: false
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    driverCost: {
      type: Number,
      default: 0,
      min: 0
    },
    insuranceCost: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'digital_wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: {
      type: Number,
      min: 0
    }
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    reviewedAt: Date
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['license', 'insurance', 'contract', 'receipt', 'other']
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true
});

// Indexes for better query performance
vehicleRentalSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
vehicleRentalSchema.index({ renter: 1, createdAt: -1 });
vehicleRentalSchema.index({ owner: 1, createdAt: -1 });
vehicleRentalSchema.index({ status: 1 });
vehicleRentalSchema.index({ 'payment.status': 1 });

// Virtual for rental duration in days
vehicleRentalSchema.virtual('durationInDays').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for is active rental
vehicleRentalSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate >= now;
});

// Virtual for is upcoming rental
vehicleRentalSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.status === 'confirmed' && this.startDate > now;
});

// Virtual for is completed rental
vehicleRentalSchema.virtual('isCompleted').get(function() {
  const now = new Date();
  return this.status === 'completed' || (this.status === 'active' && this.endDate < now);
});

module.exports = mongoose.model('VehicleRental', vehicleRentalSchema);
