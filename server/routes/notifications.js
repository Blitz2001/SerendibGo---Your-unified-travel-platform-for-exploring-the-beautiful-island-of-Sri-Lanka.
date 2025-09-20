const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  sendNotification,
  broadcastNotification
} = require('../controllers/notificationController');

// Protected routes (authenticated users only)
router.get('/', authMiddleware, getUserNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/read', authMiddleware, markNotificationsAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

// Admin only routes
router.post('/send', authMiddleware, requireAdmin, sendNotification);
router.post('/broadcast', authMiddleware, requireAdmin, broadcastNotification);

module.exports = router;
