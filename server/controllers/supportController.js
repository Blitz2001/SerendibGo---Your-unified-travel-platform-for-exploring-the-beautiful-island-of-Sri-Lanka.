const SupportRequest = require('../models/SupportRequest');
const User = require('../models/User');
const Tour = require('../models/Tour');
const TourBooking = require('../models/TourBooking');
const VehicleBooking = require('../models/VehicleBooking');
const GuideBooking = require('../models/GuideBooking');

// @route   POST /api/support/contact
// @desc    Create a new support request
// @access  Public
const createSupportRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      category,
      relatedBookingId,
      relatedBookingType,
      relatedTourId
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if user is authenticated
    let userId = null;
    if (req.user && req.user.userId) {
      userId = req.user.userId;
    }

    // Validate related booking if provided
    let relatedBooking = null;
    if (relatedBookingId && relatedBookingType) {
      let BookingModel;
      switch (relatedBookingType) {
        case 'TourBooking':
          BookingModel = TourBooking;
          break;
        case 'VehicleBooking':
          BookingModel = VehicleBooking;
          break;
        case 'GuideBooking':
          BookingModel = GuideBooking;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid booking type'
          });
      }

      relatedBooking = await BookingModel.findById(relatedBookingId);
      if (!relatedBooking) {
        return res.status(404).json({
          success: false,
          message: 'Related booking not found'
        });
      }

      // If user is authenticated, verify they own the booking
      if (userId && relatedBooking.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only create support requests for your own bookings'
        });
      }
    }

    // Validate related tour if provided
    let relatedTour = null;
    if (relatedTourId) {
      relatedTour = await Tour.findById(relatedTourId);
      if (!relatedTour) {
        return res.status(404).json({
          success: false,
          message: 'Related tour not found'
        });
      }
    }

    // Create support request
    const supportRequest = new SupportRequest({
      user: userId,
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'general_inquiry',
      relatedBooking: relatedBookingId,
      relatedBookingType,
      relatedTour: relatedTourId,
      source: 'website',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await supportRequest.save();

    // Populate related data for response
    await supportRequest.populate([
      { path: 'user', select: 'name email' },
      { path: 'relatedBooking', select: 'status totalAmount' },
      { path: 'relatedTour', select: 'title location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. We will get back to you within 24 hours.',
      data: {
        requestId: supportRequest._id,
        status: supportRequest.status,
        priority: supportRequest.priority,
        category: supportRequest.category,
        submittedAt: supportRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Create support request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/support/my-requests
// @desc    Get user's support requests
// @access  Private
const getMySupportRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, category } = req.query;

    // Build query
    const query = { user: userId };
    if (status) query.status = status;
    if (category) query.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get support requests
    const supportRequests = await SupportRequest.find(query)
      .populate('relatedBooking', 'status totalAmount')
      .populate('relatedTour', 'title location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await SupportRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests: supportRequests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my support requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @route   GET /api/support/requests/:id
// @desc    Get support request details
// @access  Private
const getSupportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const supportRequest = await SupportRequest.findById(id)
      .populate('user', 'name email')
      .populate('relatedBooking', 'status totalAmount')
      .populate('relatedTour', 'title location')
      .populate('responses.respondedBy', 'name email');

    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    // Check if user owns this request or is admin
    if (supportRequest.user && supportRequest.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: supportRequest
    });

  } catch (error) {
    console.error('Get support request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @route   POST /api/support/requests/:id/respond
// @desc    Add response to support request (Admin only)
// @access  Private (Admin)
const addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const supportRequest = await SupportRequest.findById(id);
    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    // Add response
    await supportRequest.addResponse(message, userId, 'admin_response');

    // Populate response data
    await supportRequest.populate('responses.respondedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: {
        requestId: supportRequest._id,
        status: supportRequest.status,
        responseCount: supportRequest.responseCount
      }
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @route   PUT /api/support/requests/:id/status
// @desc    Update support request status (Admin only)
// @access  Private (Admin)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const supportRequest = await SupportRequest.findById(id);
    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    supportRequest.status = status;
    
    if (status === 'resolved') {
      supportRequest.resolvedAt = new Date();
    }

    await supportRequest.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: {
        requestId: supportRequest._id,
        status: supportRequest.status,
        resolvedAt: supportRequest.resolvedAt
      }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @route   GET /api/support/categories
// @desc    Get support request categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = [
      {
        value: 'general_inquiry',
        label: 'General Inquiry',
        description: 'General questions about our services'
      },
      {
        value: 'booking_help',
        label: 'Booking Help',
        description: 'Help with making or modifying bookings'
      },
      {
        value: 'payment_issue',
        label: 'Payment Issue',
        description: 'Problems with payments or refunds'
      },
      {
        value: 'technical_support',
        label: 'Technical Support',
        description: 'Website or app technical issues'
      },
      {
        value: 'cancellation_request',
        label: 'Cancellation Request',
        description: 'Request to cancel a booking'
      },
      {
        value: 'feedback',
        label: 'Feedback',
        description: 'Share your experience with us'
      },
      {
        value: 'complaint',
        label: 'Complaint',
        description: 'Report an issue or complaint'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Something else not listed above'
      }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createSupportRequest,
  getMySupportRequests,
  getSupportRequest,
  addResponse,
  updateStatus,
  getCategories
};
