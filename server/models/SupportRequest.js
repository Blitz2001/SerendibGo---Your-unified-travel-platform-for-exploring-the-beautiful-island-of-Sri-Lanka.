const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  // User information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous support requests
  },
  
  // Contact information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    trim: true,
    required: false
  },
  
  // Request details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Request categorization
  category: {
    type: String,
    required: true,
    enum: [
      'general_inquiry',
      'booking_help',
      'payment_issue',
      'technical_support',
      'cancellation_request',
      'feedback',
      'complaint',
      'other'
    ],
    default: 'general_inquiry'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Related booking/tour information
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedBookingType',
    required: false
  },
  
  relatedBookingType: {
    type: String,
    enum: ['TourBooking', 'VehicleBooking', 'GuideBooking'],
    required: false
  },
  
  relatedTour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: false
  },
  
  // Response tracking
  responses: [{
    message: {
      type: String,
      required: true
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // System responses don't need a user
    },
    responseType: {
      type: String,
      enum: ['admin_response', 'system_response', 'auto_reply'],
      default: 'admin_response'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'email', 'phone', 'admin_panel'],
    default: 'website'
  },
  
  ipAddress: {
    type: String,
    required: false
  },
  
  userAgent: {
    type: String,
    required: false
  },
  
  // Timestamps
  lastResponseAt: {
    type: Date,
    required: false
  },
  
  resolvedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
supportRequestSchema.index({ status: 1, createdAt: -1 });
supportRequestSchema.index({ category: 1, priority: 1 });
supportRequestSchema.index({ user: 1, createdAt: -1 });
supportRequestSchema.index({ email: 1, createdAt: -1 });

// Virtual for response count
supportRequestSchema.virtual('responseCount').get(function() {
  return this.responses ? this.responses.length : 0;
});

// Virtual for isResolved
supportRequestSchema.virtual('isResolved').get(function() {
  return this.status === 'resolved' || this.status === 'closed';
});

// Pre-save middleware
supportRequestSchema.pre('save', function(next) {
  // Auto-set priority based on category
  if (this.category === 'payment_issue' || this.category === 'complaint') {
    this.priority = 'high';
  } else if (this.category === 'technical_support') {
    this.priority = 'medium';
  } else {
    this.priority = 'low';
  }
  
  next();
});

// Instance methods
supportRequestSchema.methods.addResponse = function(message, respondedBy, responseType = 'admin_response') {
  this.responses.push({
    message,
    respondedBy,
    responseType,
    createdAt: new Date()
  });
  
  this.lastResponseAt = new Date();
  
  // Auto-update status if admin responds
  if (responseType === 'admin_response') {
    this.status = 'in_progress';
  }
  
  return this.save();
};

supportRequestSchema.methods.markAsResolved = function() {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return this.save();
};

supportRequestSchema.methods.markAsClosed = function() {
  this.status = 'closed';
  return this.save();
};

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
