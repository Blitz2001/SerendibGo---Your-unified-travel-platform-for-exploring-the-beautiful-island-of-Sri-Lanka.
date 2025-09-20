const mongoose = require('mongoose');

const vehicleBookingSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Check-in date must be in the future'
    }
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    validate: {
      validator: function(value) {
        return value <= this.vehicle?.capacity || 999;
      },
      message: 'Number of guests cannot exceed vehicle capacity'
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
vehicleBookingSchema.virtual('duration').get(function() {
  if (!this.checkIn || !this.checkOut) return 0;
  return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

// Virtual for checking if booking can be cancelled
vehicleBookingSchema.virtual('canBeCancelled').get(function() {
  if (this.status !== 'confirmed') return false;
  
  const now = new Date();
  const checkInTime = new Date(this.checkIn);
  const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
  
  return hoursUntilCheckIn > 24;
});

// Index for efficient queries
vehicleBookingSchema.index({ user: 1, createdAt: -1 });
vehicleBookingSchema.index({ vehicle: 1, status: 1 });
vehicleBookingSchema.index({ checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('VehicleBooking', vehicleBookingSchema);

