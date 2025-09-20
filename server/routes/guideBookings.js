const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const guideBookingController = require('../controllers/guideBookingController');

const router = express.Router();

// @route   POST /api/guide-bookings
// @desc    Create a new guide booking
// @access  Private (Authenticated users only)
router.post('/', authMiddleware, guideBookingController.createGuideBooking);

// @route   GET /api/guide-bookings/my
// @desc    Get user's guide bookings
// @access  Private (Authenticated users only)
router.get('/my', authMiddleware, guideBookingController.getMyGuideBookings);

// @route   GET /api/guide-bookings/:id
// @desc    Get guide booking by ID
// @access  Private (Authenticated users only)
router.get('/:id', authMiddleware, guideBookingController.getGuideBookingById);

// @route   PUT /api/guide-bookings/:id/cancel
// @desc    Cancel a guide booking
// @access  Private (Authenticated users only)
router.put('/:id/cancel', authMiddleware, guideBookingController.cancelGuideBooking);

// @route   PUT /api/guide-bookings/:id/status
// @desc    Update guide booking status (admin only)
// @access  Private (Admin only)
router.put('/:id/status', authMiddleware, guideBookingController.updateGuideBookingStatus);

module.exports = router;







