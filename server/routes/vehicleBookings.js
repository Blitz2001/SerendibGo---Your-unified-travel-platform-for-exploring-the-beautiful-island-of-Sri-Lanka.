const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const vehicleBookingController = require('../controllers/vehicleBookingController');

const router = express.Router();

// @route   POST /api/vehicle-bookings
// @desc    Create a new vehicle booking
// @access  Private (Authenticated users only)
router.post('/', authMiddleware, vehicleBookingController.createVehicleBooking);

// @route   GET /api/vehicle-bookings/my
// @desc    Get user's vehicle bookings
// @access  Private (Authenticated users only)
router.get('/my', authMiddleware, vehicleBookingController.getMyVehicleBookings);

// @route   GET /api/vehicle-bookings/:id
// @desc    Get vehicle booking by ID
// @access  Private (Authenticated users only)
router.get('/:id', authMiddleware, vehicleBookingController.getVehicleBookingById);

// @route   PUT /api/vehicle-bookings/:id/cancel
// @desc    Cancel a vehicle booking
// @access  Private (Authenticated users only)
router.put('/:id/cancel', authMiddleware, vehicleBookingController.cancelVehicleBooking);

// @route   PUT /api/vehicle-bookings/:id/status
// @desc    Update vehicle booking status (admin only)
// @access  Private (Admin only)
router.put('/:id/status', authMiddleware, vehicleBookingController.updateVehicleBookingStatus);

module.exports = router;

