const express = require('express');
const Tour = require('../models/Tour');
const { authMiddleware, requireGuide, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const tourController = require('../controllers/tourController');

const router = express.Router();

// @route   GET /api/tours
// @desc    Get all tours with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      location,
      category,
      minPrice,
      maxPrice,
      duration,
      difficulty,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only filter by isActive if showAll is not requested (for admin content management)
    if (!req.query.showAll) {
      filter.isActive = true;
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (duration) {
      filter.duration = { $lte: Number(duration) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const tours = await Tour.find(filter)
      .populate('guide', 'name email profile.profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Add virtual properties to each tour
    const toursWithVirtuals = tours.map(tour => {
      const tourObj = tour.toObject();
      tourObj.isAvailable = tour.isAvailable;
      tourObj.availableSlots = tour.availableSlots;
      return tourObj;
    });

    // Get total count for pagination
    const total = await Tour.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tours: toursWithVirtuals,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalTours: total,
          hasNextPage: skip + tours.length < total,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tours'
    });
  }
});

// @route   GET /api/tours/:id
// @desc    Get single tour by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('guide', 'name email profile.profilePicture profile.phone')
      .populate('reviews');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Add virtual properties to the tour object
    const tourWithVirtuals = tour.toObject();
    tourWithVirtuals.isAvailable = tour.isAvailable;
    tourWithVirtuals.availableSlots = tour.availableSlots;

    res.json({
      success: true,
      data: { tour: tourWithVirtuals }
    });

  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tour'
    });
  }
});

// @route   POST /api/tours
// @desc    Create a new tour
// @access  Private (Guide only)
router.post('/', [
  authMiddleware,
  requireGuide,
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('duration').isInt({ min: 1, max: 30 }).withMessage('Duration must be between 1 and 30 days'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Maximum participants must be at least 1'),
  body('category').isIn(['cultural', 'adventure', 'beach', 'wildlife', 'historical', 'religious', 'nature', 'city', 'rural']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['easy', 'moderate', 'challenging', 'expert']).withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Create tour with guide ID from authenticated user
    const tourData = {
      ...req.body,
      guide: req.user.userId
    };

    const tour = new Tour(tourData);
    await tour.save();

    // Populate guide info
    await tour.populate('guide', 'name email profile.profilePicture');

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: { tour }
    });

  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tour'
    });
  }
});

// @route   PUT /api/tours/:id
// @desc    Update a tour
// @access  Private (Guide who owns the tour or Admin)
router.put('/:id', [
  authMiddleware,
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Check if user can update this tour
    if (tour.guide.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own tours.'
      });
    }

    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('guide', 'name email profile.profilePicture');

    res.json({
      success: true,
      message: 'Tour updated successfully',
      data: { tour: updatedTour }
    });

  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tour'
    });
  }
});

// @route   DELETE /api/tours/:id
// @desc    Delete a tour
// @access  Private (Guide who owns the tour or Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Check if user can delete this tour
    if (tour.guide.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own tours.'
      });
    }

    // Soft delete - just mark as inactive
    tour.isActive = false;
    await tour.save();

    res.json({
      success: true,
      message: 'Tour deleted successfully'
    });

  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tour'
    });
  }
});



// @route   POST /api/tours/:id/book
// @desc    Book a tour
// @access  Private (Authenticated users only)
router.post('/:id/book', authMiddleware, tourController.bookTour);

// @route   GET /api/tours/:id/availability
// @desc    Check tour availability
// @access  Public
router.get('/:id/availability', tourController.checkTourAvailability);

// @route   GET /api/tours/bookings/my
// @desc    Get user's tour bookings
// @access  Private (Authenticated users only)
router.get('/bookings/my', authMiddleware, tourController.getMyTourBookings);

// @route   PUT /api/tours/:id/reset-availability
// @desc    Reset tour availability (for testing/admin purposes)
// @access  Private (Admin only)
router.put('/:id/reset-availability', authMiddleware, tourController.resetTourAvailability);

module.exports = router;
