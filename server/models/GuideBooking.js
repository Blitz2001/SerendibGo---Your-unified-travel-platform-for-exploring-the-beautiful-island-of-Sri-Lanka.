const mongoose = require('mongoose');

const guideBookingSchema = new mongoose.Schema({
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: [true, 'Guide is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
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
    required: [true, 'End date is required']
  },
  participants: {
    type: Number,
    required: [true, 'Number of participants is required'],
    min: [1, 'At least 1 participant is required'],
    validate: {
      validator: function(value) {
        return value <= this.guide?.maxCapacity || 999;
      },
      message: 'Number of participants cannot exceed guide capacity'
    }
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
  tourType: {
    type: String,
    enum: ['cultural', 'adventure', 'nature', 'beach', 'wildlife', 'historical', 'religious', 'food', 'shopping', 'custom'],
    required: [true, 'Tour type is required']
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  meetingPoint: {
    type: String,
    trim: true,
    maxlength: [200, 'Meeting point cannot exceed 200 characters']
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

// Virtual for calculating duration in days
guideBookingSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for checking if booking can be cancelled
guideBookingSchema.virtual('canBeCancelled').get(function() {
  if (this.status !== 'confirmed') return false;
  
  const now = new Date();
  const startTime = new Date(this.startDate);
  const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);
  
  return hoursUntilStart > 24;
});

// Index for efficient queries
guideBookingSchema.index({ user: 1, createdAt: -1 });
guideBookingSchema.index({ guide: 1, status: 1 });
guideBookingSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('GuideBooking', guideBookingSchema);







