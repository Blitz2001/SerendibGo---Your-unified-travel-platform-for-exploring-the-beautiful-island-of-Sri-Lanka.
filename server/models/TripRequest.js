const mongoose = require('mongoose');

const tripRequestSchema = new mongoose.Schema({
  // User who submitted the request
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Trip details
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Trip description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  
  // Travel dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Number of travelers
  travelers: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least 1 adult is required'],
      max: [20, 'Maximum 20 adults allowed']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative'],
      max: [10, 'Maximum 10 children allowed']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Infants count cannot be negative'],
      max: [5, 'Maximum 5 infants allowed']
    }
  },
  
  // Budget information
  budget: {
    minBudget: {
      type: Number,
      required: [true, 'Minimum budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    maxBudget: {
      type: Number,
      required: [true, 'Maximum budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'EUR', 'GBP']
    }
  },
  
  // Destinations and activities
  destinations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number, // days
      required: true,
      min: [1, 'Duration must be at least 1 day']
    },
    activities: [{
      type: String,
      trim: true
    }],
    accommodation: {
      type: String,
      enum: ['hotel', 'guesthouse', 'resort', 'homestay', 'any'],
      default: 'any'
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    }
  }],
  
  // Preferences
  preferences: {
    accommodation: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'any'],
      default: 'any'
    },
    transportation: {
      type: String,
      enum: ['public', 'private', 'mixed', 'any'],
      default: 'any'
    },
    mealPlan: {
      type: String,
      enum: ['bed-breakfast', 'half-board', 'full-board', 'any'],
      default: 'any'
    },
    specialRequirements: [{
      type: String,
      trim: true
    }],
    interests: [{
      type: String,
      enum: ['culture', 'nature', 'adventure', 'beach', 'history', 'food', 'photography', 'wildlife', 'spiritual', 'shopping']
    }]
  },
  
  // Contact information
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'whatsapp'],
      default: 'email'
    },
    timeZone: {
      type: String,
      default: 'Asia/Colombo'
    }
  },
  
  // Status and approval
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Staff assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Review and approval
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    reviewedAt: {
      type: Date,
      required: false
    },
    notes: {
      type: String,
      maxlength: [1000, 'Review notes cannot be more than 1000 characters']
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative']
    },
    approvedItinerary: {
      type: mongoose.Schema.Types.Mixed, // Store the approved itinerary details
      required: false
    }
  },
  
  // Communication log
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'internal_note'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipient: {
      type: String, // Can be email or phone number
      required: false
    }
  }],
  
  // Files and documents
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up and completion
  followUpDate: {
    type: Date,
    required: false
  },
  
  completedAt: {
    type: Date,
    required: false
  },
  
  // Additional metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'walk-in', 'referral'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Pre-save middleware to set priority based on various factors
tripRequestSchema.pre('save', function(next) {
  if (this.isNew || this.isModified(['startDate', 'budget', 'isUrgent'])) {
    const daysUntilTrip = Math.ceil((this.startDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (this.isUrgent || daysUntilTrip < 7) {
      this.priority = 'urgent';
    } else if (daysUntilTrip < 14) {
      this.priority = 'high';
    } else if (daysUntilTrip < 30) {
      this.priority = 'medium';
    } else {
      this.priority = 'low';
    }
  }
  next();
});

// Index for efficient queries
tripRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });
tripRequestSchema.index({ user: 1, createdAt: -1 });
tripRequestSchema.index({ assignedTo: 1, status: 1 });
tripRequestSchema.index({ startDate: 1, status: 1 });

// Virtual for total travelers
tripRequestSchema.virtual('totalTravelers').get(function() {
  return this.travelers.adults + this.travelers.children + this.travelers.infants;
});

// Virtual for trip duration
tripRequestSchema.virtual('tripDuration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Method to get public profile (without sensitive info)
tripRequestSchema.methods.getPublicProfile = function() {
  const obj = this.toObject();
  delete obj.communications;
  delete obj.attachments;
  return obj;
};

module.exports = mongoose.model('TripRequest', tripRequestSchema);
