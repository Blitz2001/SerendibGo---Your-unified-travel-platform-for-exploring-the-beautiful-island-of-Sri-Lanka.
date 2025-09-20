const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 20, 
      unreadOnly = false, 
      type = null, 
      priority = null 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type,
      priority
    };

    const result = await Notification.getUserNotifications(userId, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

// @route   PUT /api/notifications/read
// @desc    Mark notifications as read
// @access  Private
const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationIds } = req.body;

    const result = await Notification.markAsRead(userId, notificationIds);

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notifications as read'
    });
  }
};

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
};

// @route   POST /api/notifications/send
// @desc    Send notification to user (admin only)
// @access  Private (Admin only)
const sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, priority = 'medium' } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, type, title, and message are required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notification = await Notification.createNotification({
      user: userId,
      type,
      title,
      message,
      data: data || {},
      priority
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending notification'
    });
  }
};

// @route   POST /api/notifications/broadcast
// @desc    Send notification to all users (admin only)
// @access  Private (Admin only)
const broadcastNotification = async (req, res) => {
  try {
    const { type, title, message, data, priority = 'medium', userRoles = [] } = req.body;

    // Validate required fields
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and message are required'
      });
    }

    // Build user filter
    const userFilter = {};
    if (userRoles.length > 0) {
      userFilter.role = { $in: userRoles };
    }

    // Get users to send notification to
    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(user => user._id);

    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found to send notification to'
      });
    }

    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      message,
      data: data || {},
      priority
    }));

    const result = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${result.length} users`,
      data: {
        sentCount: result.length,
        userIds: userIds.length
      }
    });

  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while broadcasting notification'
    });
  }
};

// Helper function to create notification (used by other controllers)
const createNotification = async (notificationData) => {
  try {
    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Create notification helper error:', error);
    return null;
  }
};

// Helper function to send booking notification
const sendBookingNotification = async (userId, bookingType, action, bookingData) => {
  const notifications = {
    booking_confirmed: {
      title: 'Booking Confirmed',
      message: `Your ${bookingType} booking has been confirmed!`,
      type: 'booking_confirmed',
      priority: 'high'
    },
    booking_cancelled: {
      title: 'Booking Cancelled',
      message: `Your ${bookingType} booking has been cancelled.`,
      type: 'booking_cancelled',
      priority: 'medium'
    },
    booking_reminder: {
      title: 'Booking Reminder',
      message: `Don't forget! Your ${bookingType} booking is coming up soon.`,
      type: 'booking_reminder',
      priority: 'medium'
    }
  };

  const notificationConfig = notifications[action];
  if (!notificationConfig) return null;

  return await createNotification({
    user: userId,
    ...notificationConfig,
    data: bookingData
  });
};

// Helper function to send payment notification
const sendPaymentNotification = async (userId, paymentStatus, paymentData) => {
  const notifications = {
    success: {
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully!',
      type: 'payment_success',
      priority: 'high'
    },
    failed: {
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      type: 'payment_failed',
      priority: 'high'
    }
  };

  const notificationConfig = notifications[paymentStatus];
  if (!notificationConfig) return null;

  return await createNotification({
    user: userId,
    ...notificationConfig,
    data: paymentData
  });
};

module.exports = {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  sendNotification,
  broadcastNotification,
  createNotification,
  sendBookingNotification,
  sendPaymentNotification
};
