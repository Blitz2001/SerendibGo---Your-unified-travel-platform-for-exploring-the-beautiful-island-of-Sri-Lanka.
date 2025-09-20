const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  images: [{
    url: String,
    caption: String
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one review per user per item
reviewSchema.index({ user: 1, tour: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, guide: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, vehicle: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
