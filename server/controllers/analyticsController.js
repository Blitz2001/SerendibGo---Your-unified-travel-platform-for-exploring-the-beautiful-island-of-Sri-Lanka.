const analyticsService = require('../services/analyticsService');
const { requireAdmin } = require('../middleware/auth');

// @route   GET /api/analytics/platform
// @desc    Get platform analytics
// @access  Private (Admin only)
const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    const analytics = await analyticsService.getPlatformAnalytics(period, year);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platform analytics'
    });
  }
};

// @route   GET /api/analytics/bookings
// @desc    Get booking analytics
// @access  Private (Admin only)
const getBookingAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    const analytics = await analyticsService.getBookingAnalytics(period, year);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking analytics'
    });
  }
};

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Admin only)
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    const analytics = await analyticsService.getRevenueAnalytics(period, year);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue analytics'
    });
  }
};

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private (Admin only)
const getUserAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    const analytics = await analyticsService.getUserAnalytics(period, year);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user analytics'
    });
  }
};

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive dashboard analytics
// @access  Private (Admin only)
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    const [
      platformAnalytics,
      bookingAnalytics,
      revenueAnalytics,
      userAnalytics
    ] = await Promise.all([
      analyticsService.getPlatformAnalytics(period, year),
      analyticsService.getBookingAnalytics(period, year),
      analyticsService.getRevenueAnalytics(period, year),
      analyticsService.getUserAnalytics(period, year)
    ]);

    const dashboardData = {
      platform: platformAnalytics,
      bookings: bookingAnalytics,
      revenue: revenueAnalytics,
      users: userAnalytics,
      period,
      year,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard analytics'
    });
  }
};

module.exports = {
  getPlatformAnalytics,
  getBookingAnalytics,
  getRevenueAnalytics,
  getUserAnalytics,
  getDashboardAnalytics
};
