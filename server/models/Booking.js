const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Room is required']
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
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least 1 adult is required'],
      max: [10, 'Maximum 10 adults allowed']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative'],
      max: [8, 'Maximum 8 children allowed']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Infant count cannot be negative'],
      max: [4, 'Maximum 4 infants allowed']
    }
  },
  totalGuests: {
    type: Number,
    required: true
  },
  roomPrice: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
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
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed'],
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
  cancellationDate: Date,
  refundAmount: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total guests before saving
bookingSchema.pre('save', function(next) {
  this.totalGuests = this.guests.adults + this.guests.children + this.guests.infants;
  
  // Calculate total amount based on nights and room price
  if (this.checkIn && this.checkOut && this.roomPrice) {
    const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
    this.totalAmount = this.roomPrice * nights;
  }
  
  next();
});

// Virtual for number of nights
bookingSchema.virtual('nights').get(function() {
  if (this.checkIn && this.checkOut) {
    return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for formatted dates
bookingSchema.virtual('formattedCheckIn').get(function() {
  return this.checkIn ? this.checkIn.toLocaleDateString() : '';
});

bookingSchema.virtual('formattedCheckOut').get(function() {
  return this.checkOut ? this.checkOut.toLocaleDateString() : '';
});

// Virtual for booking status display
bookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    cancelled: 'Cancelled',
    completed: 'Completed'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
bookingSchema.virtual('paymentStatusDisplay').get(function() {
  const paymentStatusMap = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded'
  };
  return paymentStatusMap[this.paymentStatus] || this.paymentStatus;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const checkInTime = new Date(this.checkIn);
  const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
  
  // Can cancel up to 24 hours before check-in
  return hoursUntilCheckIn > 24 && this.status === 'confirmed';
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (!this.canBeCancelled()) {
    return 0;
  }
  
  const now = new Date();
  const checkInTime = new Date(this.checkIn);
  const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
  
  // Full refund if cancelled more than 48 hours before check-in
  if (hoursUntilCheckIn > 48) {
    return this.totalAmount;
  }
  
  // 50% refund if cancelled between 24-48 hours before check-in
  return this.totalAmount * 0.5;
};

// Indexes for better query performance
bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
