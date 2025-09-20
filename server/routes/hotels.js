const express = require('express');
const router = express.Router();
const { authMiddleware, requireHotelOwner, requireAdmin } = require('../middleware/auth');
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getMyHotels,
  addReview,
  searchNearbyHotels,
  createSampleHotels
} = require('../controllers/hotelController');

// Public routes
router.get('/', getHotels);
router.get('/search/nearby', searchNearbyHotels);
router.get('/:id', getHotelById);

// Development route for sample data
if (process.env.NODE_ENV === 'development') {
  router.post('/seed', createSampleHotels);
}

// Protected routes
router.post('/', authMiddleware, requireHotelOwner, createHotel);
router.put('/:id', authMiddleware, requireHotelOwner, updateHotel);
router.delete('/:id', authMiddleware, requireHotelOwner, deleteHotel);
router.get('/owner/my-hotels', authMiddleware, requireHotelOwner, getMyHotels);
router.post('/:id/reviews', authMiddleware, addReview);

module.exports = router;
