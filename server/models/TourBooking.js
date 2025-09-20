const mongoose = require('mongoose');

const tourBookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Tour is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  participants: {
    type: Number,
    required: [true, 'Number of participants is required'],
    min: [1, 'At least 1 participant is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR', 'GBP']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
    required: false
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancellationDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  guideNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Guide notes cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  reviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate end date based on tour duration and start date
tourBookingSchema.pre('save', function(next) {
  if (this.startDate && this.tour) {
    // This will be populated when we save the booking
    // We'll calculate it in the controller
    next();
  } else {
    next();
  }
});

// Virtual for calculating duration
tourBookingSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Ensure virtual fields are serialized
tourBookingSchema.set('toJSON', { virtuals: true });
tourBookingSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
tourBookingSchema.index({ user: 1, status: 1 });
tourBookingSchema.index({ tour: 1, startDate: 1 });
tourBookingSchema.index({ status: 1, startDate: 1 });

const TourBooking = mongoose.model('TourBooking', tourBookingSchema);

module.exports = TourBooking;
