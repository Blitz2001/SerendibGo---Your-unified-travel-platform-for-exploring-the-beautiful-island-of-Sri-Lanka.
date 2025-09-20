const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews
} = require('../controllers/reviewController');

// Public routes
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.get('/user/:userId', getUserReviews);

// Protected routes (authenticated users only)
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);
router.post('/:id/helpful', authMiddleware, markReviewHelpful);

module.exports = router;