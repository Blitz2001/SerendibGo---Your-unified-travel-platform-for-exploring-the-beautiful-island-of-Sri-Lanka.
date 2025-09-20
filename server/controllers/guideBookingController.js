const GuideBooking = require('../models/GuideBooking');
const Guide = require('../models/Guide');
const User = require('../models/User');

// @route   POST /api/guide-bookings
// @desc    Create a new guide booking
// @access  Private (Authenticated users only)
const createGuideBooking = async (req, res) => {
  try {
    const {
      guideId,
      startDate,
      endDate,
      participants,
      tourType,
      specialRequests,
      meetingPoint,
      paymentMethod
    } = req.body;

    const userId = req.user.userId || req.user.id;

    // Validate required fields
    if (!guideId || !startDate || !endDate || !participants || !tourType) {
      return res.status(400).json({
        success: false,
        message: 'Guide ID, start date, end date, participants, and tour type are required'
      });
    }

    // Check if guide exists and is available
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Check if guide is available
    if (!guide.availability?.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Guide is not available for booking'
      });
    }

    // Check if requested participants exceed guide capacity
    const maxCapacity = guide.services?.groupSize?.max || 20;
    if (participants > maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Guide capacity is ${maxCapacity} participants`
      });
    }

    // Check if dates are valid
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const now = new Date();

    if (startDateObj <= now) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be in the future'
      });
    }

    if (endDateObj <= startDateObj) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Calculate duration and total amount
    const duration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
    const dailyRate = guide.pricing?.daily || 15000; // Default to 15000 LKR
    const totalAmount = dailyRate * duration;

    // Create guide booking
    const guideBooking = new GuideBooking({
      guide: guideId,
      user: userId,
      startDate: startDateObj,
      endDate: endDateObj,
      participants,
      tourType,
      totalAmount,
      currency: guide.pricing?.currency || 'LKR',
      specialRequests,
      meetingPoint,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await guideBooking.save();

    // Populate guide details for response
    await guideBooking.populate('guide', 'name location specialties rating');

    res.status(201).json({
      success: true,
      message: 'Guide booking created successfully',
      data: {
        _id: guideBooking._id,
        guide: guideBooking.guide,
        startDate: startDateObj,
        endDate: endDateObj,
        participants,
        tourType,
        duration,
        totalAmount,
        currency: guideBooking.currency,
        status: guideBooking.status,
        paymentStatus: guideBooking.paymentStatus,
        specialRequests: guideBooking.specialRequests,
        meetingPoint: guideBooking.meetingPoint
      }
    });

  } catch (error) {
    console.error('Create guide booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating guide booking'
    });
  }
};

// @route   GET /api/guide-bookings/my
// @desc    Get user's guide bookings
// @access  Private (Authenticated users only)
const getMyGuideBookings = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter
    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await GuideBooking.find(filter)
      .populate('guide', 'name location specialties rating images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GuideBooking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total,
          hasNextPage: skip + bookings.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my guide bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching guide bookings'
    });
  }
};

// @route   GET /api/guide-bookings/:id
// @desc    Get guide booking by ID
// @access  Private (Authenticated users only)
const getGuideBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const booking = await GuideBooking.findById(id)
      .populate('guide', 'name location specialties rating images maxCapacity')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Guide booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get guide booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching guide booking'
    });
  }
};

// @route   PUT /api/guide-bookings/:id/cancel
// @desc    Cancel a guide booking
// @access  Private (Authenticated users only)
const cancelGuideBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.userId || req.user.id;

    const booking = await GuideBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Guide booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = new Date();

    await booking.save();

    res.json({
      success: true,
      message: 'Guide booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel guide booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling guide booking'
    });
  }
};

// @route   PUT /api/guide-bookings/:id/status
// @desc    Update guide booking status (admin only)
// @access  Private (Admin only)
const updateGuideBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const booking = await GuideBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Guide booking not found'
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: 'Guide booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update guide booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating guide booking status'
    });
  }
};

// Calculate booking statistics
const getGuideBookingStats = (bookings) => {
  if (!bookings || !Array.isArray(bookings)) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0
    };
  }

  const stats = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0
  };

  bookings.forEach(booking => {
    if (booking && booking.status) {
      stats[booking.status]++;
    }
    if (booking && booking.totalAmount) {
      stats.totalAmount += booking.totalAmount;
    }
  });

  return stats;
};

module.exports = {
  createGuideBooking,
  getMyGuideBookings,
  getGuideBookingById,
  cancelGuideBooking,
  updateGuideBookingStatus,
  getGuideBookingStats
};







