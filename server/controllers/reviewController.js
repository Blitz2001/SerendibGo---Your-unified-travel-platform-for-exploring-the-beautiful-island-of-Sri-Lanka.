const Review = require('../models/Review');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Guide = require('../models/Guide');
const Vehicle = require('../models/Vehicle');
const TourBooking = require('../models/TourBooking');
const Booking = require('../models/Booking');
const GuideBooking = require('../models/GuideBooking');
const VehicleBooking = require('../models/VehicleBooking');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
const createReview = async (req, res) => {
  try {
    const { tourId, hotelId, guideId, vehicleId, rating, comment, images } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Determine the item being reviewed
    let itemType = '';
    let itemId = '';
    let itemModel = null;

    if (tourId) {
      itemType = 'tour';
      itemId = tourId;
      itemModel = await Tour.findById(tourId);
    } else if (hotelId) {
      itemType = 'hotel';
      itemId = hotelId;
      itemModel = await Hotel.findById(hotelId);
    } else if (guideId) {
      itemType = 'guide';
      itemId = guideId;
      itemModel = await Guide.findById(guideId);
    } else if (vehicleId) {
      itemType = 'vehicle';
      itemId = vehicleId;
      itemModel = await Vehicle.findById(vehicleId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Must specify one item to review (tour, hotel, guide, or vehicle)'
      });
    }

    if (!itemModel) {
      return res.status(404).json({
        success: false,
        message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} not found`
      });
    }

    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({
      user: userId,
      [itemType]: itemId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Check if user has a completed booking for this item
    let hasBooking = false;
    switch (itemType) {
      case 'tour':
        hasBooking = await TourBooking.findOne({
          user: userId,
          tour: itemId,
          status: 'completed'
        });
        break;
      case 'hotel':
        hasBooking = await Booking.findOne({
          user: userId,
          hotel: itemId,
          status: 'completed'
        });
        break;
      case 'guide':
        hasBooking = await GuideBooking.findOne({
          user: userId,
          guide: itemId,
          status: 'completed'
        });
        break;
      case 'vehicle':
        hasBooking = await VehicleBooking.findOne({
          user: userId,
          vehicle: itemId,
          status: 'completed'
        });
        break;
    }

    if (!hasBooking) {
      return res.status(400).json({
        success: false,
        message: 'You can only review items you have completed bookings for'
      });
    }

    // Create review
    const reviewData = {
      user: userId,
      rating,
      comment,
      isVerified: true // Verified because user has completed booking
    };

    if (tourId) reviewData.tour = tourId;
    if (hotelId) reviewData.hotel = hotelId;
    if (guideId) reviewData.guide = guideId;
    if (vehicleId) reviewData.vehicle = vehicleId;
    if (images && images.length > 0) reviewData.images = images;

    const review = new Review(reviewData);
    await review.save();

    // Populate user data for response
    await review.populate('user', 'name profile.profilePicture');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
};

// @route   GET /api/reviews
// @desc    Get reviews with filtering
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { 
      tourId, 
      hotelId, 
      guideId, 
      vehicleId, 
      rating, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (tourId) filter.tour = tourId;
    if (hotelId) filter.hotel = hotelId;
    if (guideId) filter.guide = guideId;
    if (vehicleId) filter.vehicle = vehicleId;
    if (rating) filter.rating = parseInt(rating);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('user', 'name profile.profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: filter },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        averageRating: avgRating.length > 0 ? avgRating[0].average : 0,
        totalReviews: avgRating.length > 0 ? avgRating[0].count : 0
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'name profile.profilePicture')
      .populate('tour', 'title')
      .populate('hotel', 'name')
      .populate('guide', 'name')
      .populate('vehicle', 'model brand');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review'
    });
  }
};

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own reviews.'
      });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
};

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own reviews.'
      });
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful/unhelpful
// @access  Private
const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has already marked this review
    const existingHelpful = review.helpful.find(h => h.user.toString() === userId.toString());
    
    if (existingHelpful) {
      // Update existing helpful vote
      existingHelpful.helpful = helpful;
    } else {
      // Add new helpful vote
      review.helpful.push({ user: userId, helpful });
    }

    await review.save();

    res.json({
      success: true,
      message: 'Review helpful status updated',
      data: {
        helpful: review.helpful.filter(h => h.helpful === true).length,
        notHelpful: review.helpful.filter(h => h.helpful === false).length
      }
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review helpful status'
    });
  }
};

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by user
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: userId })
      .populate('tour', 'title')
      .populate('hotel', 'name')
      .populate('guide', 'name')
      .populate('vehicle', 'model brand')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews'
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews
};
