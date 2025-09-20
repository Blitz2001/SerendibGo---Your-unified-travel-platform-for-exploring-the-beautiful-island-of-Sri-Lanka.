const express = require('express');
const router = express.Router();
const { authMiddleware, requireHotelOwner, requireAdmin } = require('../middleware/auth');
const {
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
} = require('../controllers/bookingController');

// Public routes
router.post('/check-availability', checkAvailability);

// Protected routes (authenticated users only)
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getMyBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id', authMiddleware, updateBooking);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/modify', authMiddleware, modifyBooking);
router.get('/:id/modification-history', authMiddleware, getBookingModificationHistory);

// Hotel owner and admin routes
router.put('/:id/status', authMiddleware, requireHotelOwner, updateBookingStatus);
router.get('/hotel/:hotelId', authMiddleware, requireHotelOwner, getHotelBookings);

module.exports = router;
