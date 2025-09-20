const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Tour description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Tour location is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Tour duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [30, 'Duration cannot exceed 30 days']
  },
  price: {
    type: Number,
    required: [true, 'Tour price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Must allow at least 1 participant']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Tour category is required'],
    enum: ['cultural', 'adventure', 'beach', 'wildlife', 'historical', 'religious', 'nature', 'city', 'rural']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'expert'],
    default: 'moderate'
  },
  inclusions: [{
    type: String,
    trim: true
  }],
  exclusions: [{
    type: String,
    trim: true
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: String,
    description: String,
    activities: [String],
    meals: {
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false }
    },
    accommodation: String
  }],
  images: [{
    url: String,
    caption: String,
    isMain: { type: Boolean, default: false }
  }],
  availability: [{
    date: {
      type: Date,
      required: true
    },
    availableSlots: {
      type: Number,
      required: true,
      min: 0
    },
    price: Number // Special pricing for specific dates
  }],
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tour guide is required']
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
      default: 0
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  highlights: [String],
  requirements: [String], // What tourists need to bring/prepare
  cancellationPolicy: {
    type: String,
    default: 'Free cancellation up to 24 hours before tour start'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for checking if tour is available
tourSchema.virtual('isAvailable').get(function() {
  return this.currentParticipants < this.maxParticipants;
});

// Virtual for calculating available slots
tourSchema.virtual('availableSlots').get(function() {
  return this.maxParticipants - this.currentParticipants;
});

// Index for search functionality
tourSchema.index({ title: 'text', description: 'text', location: 'text' });
tourSchema.index({ category: 1, location: 1, price: 1 });
tourSchema.index({ guide: 1, isActive: 1 });

module.exports = mongoose.model('Tour', tourSchema);
