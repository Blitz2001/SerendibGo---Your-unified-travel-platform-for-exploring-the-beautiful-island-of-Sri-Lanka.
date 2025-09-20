const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', guideController.getGuides);
router.get('/stats', guideController.getGuideStats);
router.get('/specialization/:specialization', guideController.getGuidesBySpecialization);
router.get('/location/:city', guideController.getGuidesByLocation);

// Protected routes (require authentication)
router.use(authMiddleware);

// Specific routes MUST come before the generic /:id route
router.get('/my-profile', guideController.getMyProfile);
router.put('/my-profile', guideController.updateMyProfile);
router.put('/services', guideController.updateMyServices);
router.get('/my-bookings', guideController.getMyBookings);
router.put('/availability', guideController.updateMyAvailability);
router.post('/create-profile', guideController.createMyProfile);

// Earnings, Reviews, and Analytics routes
router.get('/earnings', guideController.getMyEarnings);
router.get('/reviews', guideController.getMyReviews);
router.get('/analytics', guideController.getMyAnalytics);

// Public route for viewing guide details (must come after specific routes)
router.get('/:id', guideController.getGuide);

// Review management routes
router.post('/reviews/:reviewId/reply', guideController.replyToReview);
router.post('/reviews/:reviewId/report', guideController.reportReview);
router.post('/reviews/:reviewId/helpful', guideController.markReviewHelpful);

// Settings routes
router.put('/settings/notifications', guideController.updateNotificationSettings);
router.put('/settings/privacy', guideController.updatePrivacySettings);
router.put('/settings/payment', guideController.updatePaymentSettings);
router.put('/settings/password', guideController.changePassword);
router.delete('/settings/account', guideController.deleteAccount);

// Profile image upload
router.post('/profile/image', guideController.uploadProfileImage);

// Generic routes (must come after specific routes)
router.post('/', guideController.createGuide);
router.put('/:id', guideController.updateGuide);
router.delete('/:id', guideController.deleteGuide);
router.patch('/:id/availability', guideController.updateAvailability);

// Admin only routes
router.patch('/:id/verify', guideController.verifyGuide);

module.exports = router;