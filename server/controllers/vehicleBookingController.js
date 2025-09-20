const VehicleBooking = require('../models/VehicleBooking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @route   POST /api/vehicle-bookings
// @desc    Create a new vehicle booking
// @access  Private (Authenticated users only)
const createVehicleBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      paymentMethod
    } = req.body;

    const userId = req.user.userId || req.user.id;

    // Validate required fields
    if (!vehicleId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, check-in, check-out, and guests are required'
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle is available
    if (!vehicle.availability?.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for booking'
      });
    }

    if (vehicle.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for booking'
      });
    }

    // Check if requested guests exceed vehicle capacity
    if (guests > vehicle.capacity) {
      return res.status(400).json({
        success: false,
        message: `Vehicle capacity is ${vehicle.capacity} passengers`
      });
    }

    // Check if dates are valid
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    if (checkInDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be in the future'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Calculate duration and total amount
    const duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = vehicle.pricing?.daily * duration;

    // Create vehicle booking
    const vehicleBooking = new VehicleBooking({
      vehicle: vehicleId,
      user: userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalAmount,
      currency: vehicle.pricing?.currency || 'LKR',
      specialRequests,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await vehicleBooking.save();

    // Populate vehicle details for response
    await vehicleBooking.populate('vehicle', 'brand model images location pricing');

    res.status(201).json({
      success: true,
      message: 'Vehicle booking created successfully',
      data: {
        _id: vehicleBooking._id,
        vehicle: vehicleBooking.vehicle,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        duration,
        totalAmount,
        currency: vehicleBooking.currency,
        status: vehicleBooking.status,
        paymentStatus: vehicleBooking.paymentStatus,
        specialRequests: vehicleBooking.specialRequests
      }
    });

  } catch (error) {
    console.error('Create vehicle booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating vehicle booking'
    });
  }
};

// @route   GET /api/vehicle-bookings/my
// @desc    Get user's vehicle bookings
// @access  Private (Authenticated users only)
const getMyVehicleBookings = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter
    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await VehicleBooking.find(filter)
      .populate('vehicle', 'brand model images location pricing capacity year')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VehicleBooking.countDocuments(filter);

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
    console.error('Get my vehicle bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle bookings'
    });
  }
};

// @route   GET /api/vehicle-bookings/:id
// @desc    Get vehicle booking by ID
// @access  Private (Authenticated users only)
const getVehicleBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const booking = await VehicleBooking.findById(id)
      .populate('vehicle', 'brand model images location pricing capacity year')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle booking not found'
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
    console.error('Get vehicle booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle booking'
    });
  }
};

// @route   PUT /api/vehicle-bookings/:id/cancel
// @desc    Cancel a vehicle booking
// @access  Private (Authenticated users only)
const cancelVehicleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.userId || req.user.id;

    const booking = await VehicleBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle booking not found'
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
      message: 'Vehicle booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel vehicle booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling vehicle booking'
    });
  }
};

// @route   PUT /api/vehicle-bookings/:id/status
// @desc    Update vehicle booking status (admin only)
// @access  Private (Admin only)
const updateVehicleBookingStatus = async (req, res) => {
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

    const booking = await VehicleBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle booking not found'
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: 'Vehicle booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update vehicle booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle booking status'
    });
  }
};

// Calculate booking statistics
const getVehicleBookingStats = (bookings) => {
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
  createVehicleBooking,
  getMyVehicleBookings,
  getVehicleBookingById,
  cancelVehicleBooking,
  updateVehicleBookingStatus,
  getVehicleBookingStats
};
