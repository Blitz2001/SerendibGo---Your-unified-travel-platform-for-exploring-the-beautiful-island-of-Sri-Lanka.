const Tour = require('../models/Tour');
const TourBooking = require('../models/TourBooking');
const User = require('../models/User');

// @route   POST /api/tours/:id/book
// @desc    Book a tour
// @access  Private (Authenticated users only)
const bookTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { participants, startDate, specialRequests } = req.body;

    // Validate required fields
    if (!participants || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Participants and start date are required'
      });
    }

    // Check if tour exists and is active
    const tour = await Tour.findById(id);
    if (!tour || !tour.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found or inactive'
      });
    }

    // Check if tour is available
    if (!tour.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Tour is not available for booking'
      });
    }

    // Check if requested participants exceed available slots
    if (participants > tour.availableSlots) {
      return res.status(400).json({
        success: false,
        message: `Only ${tour.availableSlots} slots available for this tour`
      });
    }

    // Update tour participants
    tour.currentParticipants += participants;
    await tour.save();

    // Calculate end date based on tour duration
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + tour.duration);

    // Calculate total amount
    const totalAmount = tour.price * participants;

    // Create tour booking
    const tourBooking = new TourBooking({
      tour: tour._id,
      user: req.user.userId,
      participants,
      startDate: startDateObj,
      endDate: endDateObj,
      totalAmount,
      currency: tour.currency,
      specialRequests,
      status: 'confirmed', // TEMPORARILY: Set to confirmed (payment disabled)
      paymentStatus: 'paid' // TEMPORARILY: Mark as paid (payment disabled)
    });

    await tourBooking.save();

    // Populate tour details for response
    await tourBooking.populate('tour', 'title location images');

    res.status(201).json({
      success: true,
      message: 'Tour booked successfully! Payment integration will be added later.',
      data: {
        _id: tourBooking._id,
        tour: tourBooking.tour,
        participants,
        startDate: startDateObj,
        endDate: endDateObj,
        totalAmount,
        currency: tour.currency,
        status: tourBooking.status,
        paymentStatus: tourBooking.paymentStatus,
        specialRequests,
        requiresPayment: false // TEMPORARILY: Payment disabled
      }
    });

  } catch (error) {
    console.error('Book tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking tour'
    });
  }
};

// @route   GET /api/tours/:id/availability
// @desc    Check tour availability
// @access  Public
const checkTourAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const tour = await Tour.findById(id);
    if (!tour || !tour.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found or inactive'
      });
    }

    res.json({
      success: true,
      data: {
        tourId: tour._id,
        title: tour.title,
        maxParticipants: tour.maxParticipants,
        currentParticipants: tour.currentParticipants,
        availableSlots: tour.availableSlots,
        isAvailable: tour.isAvailable,
        price: tour.price,
        currency: tour.currency
      }
    });

  } catch (error) {
    console.error('Check tour availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking tour availability'
    });
  }
};

// @route   PUT /api/tours/:id/reset-availability
// @desc    Reset tour availability (for testing/admin purposes)
// @access  Private (Admin only)
const resetTourAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Reset participants to 0
    tour.currentParticipants = 0;
    await tour.save();

    res.json({
      success: true,
      message: 'Tour availability reset successfully',
      data: {
        tourId: tour._id,
        title: tour.title,
        maxParticipants: tour.maxParticipants,
        currentParticipants: tour.currentParticipants,
        availableSlots: tour.availableSlots,
        isAvailable: tour.isAvailable
      }
    });

  } catch (error) {
    console.error('Reset tour availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting tour availability'
    });
  }
};

// @route   GET /api/tours/bookings/my
// @desc    Get user's tour bookings
// @access  Private (Authenticated users only)
const getMyTourBookings = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const bookings = await TourBooking.find({ user: userId })
      .populate('tour', 'title location images price currency duration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('Get my tour bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tour bookings'
    });
  }
};

module.exports = {
  bookTour,
  checkTourAvailability,
  resetTourAvailability,
  getMyTourBookings
};
