const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Authenticated users only)
const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!hotelId || !roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if hotel exists and is active
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found or inactive'
      });
    }

    // Find the specific room
    const room = hotel.rooms.find(r => r._id.toString() === roomId.toString());
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check room availability
    if (!room.isAvailable || room.availableRooms < 1) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }

    // Check if dates are available (basic check)
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

    // Check guest capacity
    const totalGuests = guests.adults + guests.children + guests.infants;
    if (totalGuests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${room.capacity} guests, but you're trying to book for ${totalGuests} guests`
      });
    }

    // Check for conflicting bookings (basic check)
    const conflictingBookings = await Booking.find({
      hotel: hotelId,
      room: roomId,
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Calculate total amount
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price * nights;

    // Create booking
    const booking = new Booking({
      hotel: hotelId,
      user: req.user.userId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalGuests,
      roomPrice: room.price,
      totalAmount,
      currency: room.currency,
      specialRequests,
      paymentMethod
    });

    await booking.save();

    // Update room availability
    const roomIndex = hotel.rooms.findIndex(r => r._id.toString() === roomId.toString());
    if (roomIndex !== -1) {
      hotel.rooms[roomIndex].availableRooms -= 1;
      if (hotel.rooms[roomIndex].availableRooms === 0) {
        hotel.rooms[roomIndex].isAvailable = false;
      }
      await hotel.save();
    }

    // Populate references for response
    await booking.populate([
      { path: 'hotel', select: 'name location images' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);

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
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private (Authenticated users only)
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user.userId, isActive: true };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('hotel', 'name location images starRating')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalCount = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalBookings: totalCount,
          bookingsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private (Booking owner or admin only)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'name location images starRating contact')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private (Booking owner or admin only)
const updateBooking = async (req, res) => {
  try {
    const { specialRequests, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own bookings.'
      });
    }

    // Only allow updates to certain fields
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    await booking.populate([
      { path: 'hotel', select: 'name location images starRating contact' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private (Booking owner or admin only)
const cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled. Must be cancelled at least 24 hours before check-in.'
      });
    }

    // Calculate refund
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;

    await booking.save();

         // Update room availability
     const hotel = await Hotel.findById(booking.hotel);
     if (hotel) {
       const roomIndex = hotel.rooms.findIndex(r => r._id.toString() === booking.room.toString());
       if (roomIndex !== -1) {
         hotel.rooms[roomIndex].availableRooms += 1;
         if (hotel.rooms[roomIndex].availableRooms > 0) {
           hotel.rooms[roomIndex].isAvailable = true;
         }
         await hotel.save();
       }
     }

    await booking.populate([
      { path: 'hotel', select: 'name location images starRating contact' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (admin/hotel owner only)
// @access  Private (Admin or hotel owner only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is admin or hotel owner
    if (req.user.role !== 'admin' && 
        booking.hotel.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and hotel owners can update booking status.'
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['checked_in', 'cancelled'],
      checked_in: ['checked_out'],
      checked_out: ['completed'],
      cancelled: [],
      completed: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${booking.status} to ${status}`
      });
    }

    // Update booking
    booking.status = status;
    if (notes) booking.notes = notes;

    await booking.save();

    await booking.populate([
      { path: 'hotel', select: 'name location images starRating contact' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/bookings/hotel/:hotelId
// @desc    Get bookings for a specific hotel (hotel owner or admin only)
// @access  Private (Hotel owner or admin only)
const getHotelBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, dateFrom, dateTo } = req.query;
    const { hotelId } = req.params;

    // Check if user owns the hotel or is admin
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (hotel.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view bookings for your own hotels.'
      });
    }

    const filter = { hotel: hotelId, isActive: true };
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.$or = [];
      if (dateFrom) filter.$or.push({ checkIn: { $gte: new Date(dateFrom) } });
      if (dateTo) filter.$or.push({ checkOut: { $lte: new Date(dateTo) } });
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalCount = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalBookings: totalCount,
          bookingsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get hotel bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/bookings/check-availability
// @desc    Check room availability for specific dates
// @access  Public
const checkAvailability = async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests = 1 } = req.query;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID, check-in, and check-out dates are required'
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found or inactive'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      hotel: hotelId,
      room: roomId,
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      success: true,
      data: {
        isAvailable,
        conflictingBookings: conflictingBookings.length,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/bookings/:id/modify
// @desc    Modify an existing booking
// @access  Private (Authenticated users only)
const modifyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      checkIn,
      checkOut,
      guests,
      specialRequests,
      reason
    } = req.body;

    // Find the booking
    const booking = await Booking.findById(id).populate('hotel');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own bookings.'
      });
    }

    // Check if booking can be modified
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify cancelled or completed bookings'
      });
    }

    // Check if modification is allowed (e.g., not within 24 hours of check-in)
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify booking within 24 hours of check-in'
      });
    }

    // Validate new dates if provided
    if (checkIn || checkOut) {
      const newCheckIn = checkIn ? new Date(checkIn) : new Date(booking.checkIn);
      const newCheckOut = checkOut ? new Date(checkOut) : new Date(booking.checkOut);

      if (newCheckIn <= now) {
        return res.status(400).json({
          success: false,
          message: 'New check-in date must be in the future'
        });
      }

      if (newCheckOut <= newCheckIn) {
        return res.status(400).json({
          success: false,
          message: 'New check-out date must be after check-in date'
        });
      }

      // Check for conflicting bookings with new dates
      const conflictingBookings = await Booking.find({
        _id: { $ne: id },
        hotel: booking.hotel._id,
        room: booking.room,
        status: { $in: ['pending', 'confirmed', 'checked_in'] },
        $or: [
          {
            checkIn: { $lt: newCheckOut },
            checkOut: { $gt: newCheckIn }
          }
        ]
      });

      if (conflictingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Room is not available for the new selected dates'
        });
      }
    }

    // Store original booking data for history
    const originalBooking = {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      specialRequests: booking.specialRequests,
      modifiedAt: new Date()
    };

    // Update booking
    if (checkIn) booking.checkIn = new Date(checkIn);
    if (checkOut) booking.checkOut = new Date(checkOut);
    if (guests) booking.guests = guests;
    if (specialRequests) booking.specialRequests = specialRequests;
    
    // Add modification history
    if (!booking.modificationHistory) {
      booking.modificationHistory = [];
    }
    booking.modificationHistory.push({
      ...originalBooking,
      reason: reason || 'Booking modification',
      modifiedBy: userId
    });

    // Recalculate total amount if dates changed
    if (checkIn || checkOut) {
      const nights = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
      const room = booking.hotel.rooms.find(r => r._id.toString() === booking.room.toString());
      if (room) {
        booking.totalAmount = room.pricePerNight * nights;
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking modified successfully',
      data: booking
    });

  } catch (error) {
    console.error('Modify booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while modifying booking'
    });
  }
};

// @route   GET /api/bookings/:id/modification-history
// @desc    Get booking modification history
// @access  Private (Authenticated users only)
const getBookingModificationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(id).select('modificationHistory user');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: booking.modificationHistory || []
    });

  } catch (error) {
    console.error('Get modification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modification history'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  updateBookingStatus,
  getHotelBookings,
  checkAvailability,
  modifyBooking,
  getBookingModificationHistory
};
