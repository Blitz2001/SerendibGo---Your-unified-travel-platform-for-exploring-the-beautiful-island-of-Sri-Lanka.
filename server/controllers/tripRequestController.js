const TripRequest = require('../models/TripRequest');
const User = require('../models/User');

// @route   POST /api/trip-requests
// @desc    Create a new trip request
// @access  Private (Authenticated users)
const createTripRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      travelers,
      budget,
      destinations,
      preferences,
      contactInfo,
      tags,
      source
    } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !travelers || !budget || !destinations) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, startDate, endDate, travelers, budget, destinations'
      });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }
    
    if (endDateObj <= startDateObj) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate budget
    if (budget.minBudget > budget.maxBudget) {
      return res.status(400).json({
        success: false,
        message: 'Minimum budget cannot be greater than maximum budget'
      });
    }

    // Validate travelers
    if (travelers.adults < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least 1 adult traveler is required'
      });
    }

    // Create trip request
    const tripRequest = new TripRequest({
      user: req.user.userId,
      title,
      description,
      startDate: startDateObj,
      endDate: endDateObj,
      travelers,
      budget,
      destinations,
      preferences: preferences || {},
      contactInfo: {
        ...contactInfo,
        email: req.user.email, // Use authenticated user's email
        phone: contactInfo.phone || req.user.phone
      },
      tags: tags || [],
      source: source || 'website'
    });

    await tripRequest.save();
    await tripRequest.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Trip request submitted successfully! Our team will review it and get back to you soon.',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Create trip request error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/my
// @desc    Get user's trip requests
// @access  Private (Authenticated users)
const getMyTripRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const tripRequests = await TripRequest.find(filter)
      .populate('assignedTo', 'name email')
      .populate('review.reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await TripRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tripRequests: tripRequests.map(tr => tr.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRequests: totalCount,
          requestsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my trip requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/:id
// @desc    Get trip request by ID
// @access  Private (User or Admin)
const getTripRequestById = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('review.reviewedBy', 'name email')
      .populate('communications.sentBy', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Check if user can access this trip request
    if (req.user.role !== 'admin' && tripRequest.user._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own trip requests.'
      });
    }

    res.json({
      success: true,
      data: {
        tripRequest
      }
    });

  } catch (error) {
    console.error('Get trip request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/admin/all
// @desc    Get all trip requests (Admin only)
// @access  Private (Admin only)
const getAllTripRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tripRequests = await TripRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('review.reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await TripRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tripRequests: tripRequests.map(tr => tr.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRequests: totalCount,
          requestsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all trip requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/trip-requests/:id/status
// @desc    Update trip request status (Admin only)
// @access  Private (Admin only)
const updateTripRequestStatus = async (req, res) => {
  try {
    const { status, notes, estimatedCost, approvedItinerary } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Update status and review information
    tripRequest.status = status;
    tripRequest.review.reviewedBy = req.user.userId;
    tripRequest.review.reviewedAt = new Date();
    
    if (notes) tripRequest.review.notes = notes;
    if (estimatedCost) tripRequest.review.estimatedCost = estimatedCost;
    if (approvedItinerary) tripRequest.review.approvedItinerary = approvedItinerary;

    await tripRequest.save();
    await tripRequest.populate('user', 'name email phone');
    await tripRequest.populate('review.reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Trip request status updated successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update trip request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating trip request status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/trip-requests/:id/assign
// @desc    Assign trip request to staff member (Admin only)
// @access  Private (Admin only)
const assignTripRequest = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Verify assigned user exists and is staff
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || !['admin', 'staff'].includes(assignedUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff member for assignment'
      });
    }

    tripRequest.assignedTo = assignedTo;
    await tripRequest.save();
    await tripRequest.populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Trip request assigned successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Assign trip request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/trip-requests/:id/communication
// @desc    Add communication log (Admin only)
// @access  Private (Admin only)
const addCommunication = async (req, res) => {
  try {
    const { type, message, recipient } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    tripRequest.communications.push({
      type,
      message,
      recipient,
      sentBy: req.user.userId
    });

    await tripRequest.save();
    await tripRequest.populate('communications.sentBy', 'name email');

    res.json({
      success: true,
      message: 'Communication log added successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding communication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/stats/overview
// @desc    Get trip request statistics (Admin only)
// @access  Private (Admin only)
const getTripRequestStats = async (req, res) => {
  try {
    const stats = await TripRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await TripRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await TripRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        priorityStats: priorityStats,
        monthlyStats: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get trip request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createTripRequest,
  getMyTripRequests,
  getTripRequestById,
  getAllTripRequests,
  updateTripRequestStatus,
  assignTripRequest,
  addCommunication,
  getTripRequestStats
};
