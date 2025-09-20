const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentSessionId: {
    type: String,
    unique: true,
    sparse: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['tour', 'vehicle', 'guide', 'hotel']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'LKR'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'stripe',
    enum: ['stripe', 'payhere']
  },
  paymentId: {
    type: String,
    sparse: true
  },
  transactionId: {
    type: String,
    sparse: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1, bookingType: 1 });
paymentSchema.index({ status: 1 });
// orderId already has unique: true, so no need for separate index

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount?.toLocaleString()}`;
});

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && !this.refundedAt;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(userId, startDate, endDate) {
  const matchStage = { user: new mongoose.Types.ObjectId(userId) };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount
    };
    return acc;
  }, {});
};

// Pre-save middleware to validate amount
paymentSchema.pre('save', function(next) {
  if (this.amount < 0) {
    return next(new Error('Payment amount cannot be negative'));
  }
  next();
});

// Pre-save middleware to set refund amount if not provided
paymentSchema.pre('save', function(next) {
  if (this.status === 'refunded' && !this.refundAmount) {
    this.refundAmount = this.amount;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
