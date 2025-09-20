const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'payment_success',
      'payment_failed',
      'review_received',
      'message_received',
      'trip_request',
      'vehicle_approved',
      'vehicle_rejected',
      'guide_approved',
      'guide_rejected',
      'system_announcement',
      'promotion',
      'security_alert'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set readAt when isRead becomes true
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  return await notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type = null,
    priority = null
  } = options;

  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  const notifications = await this.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(filter);
  const unreadCount = await this.countDocuments({ user: userId, isRead: false });

  return {
    notifications,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    },
    unreadCount
  };
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds = null) {
  const filter = { user: userId };
  if (notificationIds) {
    filter._id = { $in: notificationIds };
  }

  return await this.updateMany(filter, { 
    isRead: true, 
    readAt: new Date() 
  });
};

// Static method to delete old notifications
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
