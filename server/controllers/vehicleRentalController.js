const VehicleRental = require('../models/VehicleRental');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
// const { sendEmail } = require('../utils/emailService'); // Temporarily disabled for testing

// Create a vehicle rental booking
const createRental = async (req, res) => {
  try {
    const {
      vehicleId,
      rentalType,
      startDate,
      endDate,
      startTime,
      endTime,
      duration,
      pickupLocation,
      dropoffLocation,
      driverRequired,
      insurance,
      specialRequests,
      paymentMethod
    } = req.body;

    const userId = req.user.userId || req.user.id;

    // Validate required fields
    if (!vehicleId || !rentalType || !startDate || !endDate || !duration || !pickupLocation) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, rental type, dates, duration, and pickup location are required'
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId).populate('owner', 'email name');
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
        message: 'Vehicle is not available for rental'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate dates
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

    // Calculate base amount and total amount based on rental type
    let baseAmount = 0;
    let totalAmount = 0;
    const currency = vehicle.pricing?.currency || 'LKR';

    switch (rentalType) {
      case 'hourly':
        baseAmount = vehicle.pricing?.hourly || 0;
        totalAmount = baseAmount * duration;
        break;
      case 'daily':
        baseAmount = vehicle.pricing?.daily || 0;
        totalAmount = baseAmount * duration;
        break;
      case 'weekly':
        baseAmount = vehicle.pricing?.weekly || 0;
        totalAmount = baseAmount * duration;
        break;
      case 'monthly':
        baseAmount = vehicle.pricing?.monthly || 0;
        totalAmount = baseAmount * duration;
        break;
      default:
        baseAmount = vehicle.pricing?.daily || 0;
        totalAmount = baseAmount * duration;
    }

    // Add driver fee if required
    if (driverRequired && vehicle.pricing?.driverFee) {
      totalAmount += vehicle.pricing.driverFee * duration;
    }

    // Add insurance fee if selected
    if (insurance && vehicle.pricing?.insuranceFee) {
      totalAmount += vehicle.pricing.insuranceFee * duration;
    }

    // Create new rental
    const newRental = new VehicleRental({
      vehicle: vehicleId,
      renter: userId,
      owner: vehicle.owner._id,
      startDate: startDateObj,
      endDate: endDateObj,
      duration: duration,
      rentalType,
      pickupLocation,
      dropoffLocation: dropoffLocation || pickupLocation,
      driverRequired: driverRequired || false,
      insurance: insurance || false,
      specialRequests: specialRequests || '',
      pricing: {
        basePrice: baseAmount,
        subtotal: baseAmount * duration,
        totalAmount: totalAmount,
        duration: duration,
        currency: currency
      },
      payment: {
        method: paymentMethod || 'credit_card',
        status: 'pending'
      },
      status: 'pending'
    });

    await newRental.save();

    // Email notifications temporarily disabled for testing
    console.log(`Vehicle rental created successfully for user ${user.name} - Email notifications disabled in development mode`);

    res.status(201).json({
      success: true,
      message: 'Vehicle rental created successfully',
      data: newRental
    });

  } catch (error) {
    console.error('Error creating vehicle rental:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle rental',
      error: error.message
    });
  }
};

// Get user's rentals
const getMyRentals = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = { renter: userId };
    if (status) {
      query.status = status;
    }

    const rentals = await VehicleRental.find(query)
      .populate('vehicle', 'brand model year type images pricing')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VehicleRental.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        rentals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRentals: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rentals',
      error: error.message
    });
  }
};

// Get single rental
const getRental = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const rental = await VehicleRental.findOne({
      _id: id,
      $or: [{ renter: userId }, { owner: userId }]
    })
      .populate('vehicle', 'brand model year type images pricing')
      .populate('renter', 'name email')
      .populate('owner', 'name email');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rental
    });

  } catch (error) {
    console.error('Error fetching rental:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental',
      error: error.message
    });
  }
};

// Update rental status
const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId || req.user.id;

    const rental = await VehicleRental.findOne({
      _id: id,
      owner: userId // Only owner can update status
    });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found or you are not authorized'
      });
    }

    rental.status = status;
    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental status updated successfully',
      data: rental
    });

  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rental status',
      error: error.message
    });
  }
};

// Cancel rental
const cancelRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId || req.user.id;

    const rental = await VehicleRental.findOne({
      _id: id,
      renter: userId // Only user can cancel their rental
    });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found or you are not authorized'
      });
    }

    if (rental.status === 'completed' || rental.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed or already cancelled rental'
      });
    }

    rental.status = 'cancelled';
    rental.cancellationReason = reason;
    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental cancelled successfully',
      data: rental
    });

  } catch (error) {
    console.error('Error cancelling rental:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel rental',
      error: error.message
    });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, rentalType } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, start date, and end date are required'
      });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Check for existing rentals in the same period
    const existingRentals = await VehicleRental.find({
      vehicle: vehicleId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: endDateObj },
          endDate: { $gte: startDateObj }
        }
      ]
    });

    const isAvailable = existingRentals.length === 0;

    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        conflictingRentals: existingRentals.length
      }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};

// Calculate cost
const calculateCost = async (req, res) => {
  try {
    const { vehicleId, rentalType, duration, driverRequired, insurance } = req.body;

    if (!vehicleId || !rentalType || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, rental type, and duration are required'
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    let baseAmount = 0;
    const currency = vehicle.pricing?.currency || 'LKR';

    switch (rentalType) {
      case 'hourly':
        baseAmount = (vehicle.pricing?.hourly || 0) * duration;
        break;
      case 'daily':
        baseAmount = (vehicle.pricing?.daily || 0) * duration;
        break;
      case 'weekly':
        baseAmount = (vehicle.pricing?.weekly || 0) * duration;
        break;
      case 'monthly':
        baseAmount = (vehicle.pricing?.monthly || 0) * duration;
        break;
      default:
        baseAmount = (vehicle.pricing?.daily || 0) * duration;
    }

    let totalAmount = baseAmount;

    if (driverRequired && vehicle.pricing?.driverFee) {
      totalAmount += vehicle.pricing.driverFee * duration;
    }

    if (insurance && vehicle.pricing?.insuranceFee) {
      totalAmount += vehicle.pricing.insuranceFee;
    }

    res.status(200).json({
      success: true,
      data: {
        baseAmount,
        totalAmount,
        currency,
        breakdown: {
          base: baseAmount,
          driverFee: driverRequired ? (vehicle.pricing?.driverFee || 0) * duration : 0,
          insuranceFee: insurance ? (vehicle.pricing?.insuranceFee || 0) : 0
        }
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error calculating cost:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to calculate cost',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createRental,
  getMyRentals,
  getRental,
  updateRentalStatus,
  cancelRental,
  checkAvailability,
  calculateCost
};