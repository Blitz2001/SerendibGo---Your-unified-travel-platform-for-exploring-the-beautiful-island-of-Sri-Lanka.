const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Message routes
router.post('/', messageController.sendMessage);
router.get('/', messageController.getMyMessages);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:id', messageController.getMessage);
router.post('/:id/reply', messageController.replyToMessage);
router.patch('/:id/read', messageController.markAsRead);

module.exports = router;
