const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const {
  getPlatformAnalytics,
  getBookingAnalytics,
  getRevenueAnalytics,
  getUserAnalytics,
  getDashboardAnalytics
} = require('../controllers/analyticsController');

// All analytics routes require admin access
router.get('/platform', authMiddleware, requireAdmin, getPlatformAnalytics);
router.get('/bookings', authMiddleware, requireAdmin, getBookingAnalytics);
router.get('/revenue', authMiddleware, requireAdmin, getRevenueAnalytics);
router.get('/users', authMiddleware, requireAdmin, getUserAnalytics);
router.get('/dashboard', authMiddleware, requireAdmin, getDashboardAnalytics);

module.exports = router;
