const Message = require('../models/Message');
const Guide = require('../models/Guide');
const User = require('../models/User');

// Send a message to a guide
const sendMessage = async (req, res) => {
  try {
    const { guideId, subject, message, contactMethod } = req.body;
    const userId = req.user.userId || req.user.id;

    // Validate required fields
    if (!guideId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Guide ID, subject, and message are required'
      });
    }

    // Check if guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Check if user is trying to message themselves
    if (guide.user.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself'
      });
    }

    // Create message
    const newMessage = new Message({
      sender: userId,
      recipient: guide.user,
      guide: guideId,
      subject,
      message,
      contactMethod: contactMethod || 'email',
      status: 'sent'
    });

    await newMessage.save();

    // Populate the message with user details
    await newMessage.populate([
      { path: 'sender', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'guide', select: 'user' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Get messages for a user (sent and received)
const getMyMessages = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10, type = 'all' } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    if (type === 'sent') {
      query.sender = userId;
    } else if (type === 'received') {
      query.recipient = userId;
    } else {
      query.$or = [
        { sender: userId },
        { recipient: userId }
      ];
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('guide', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// Get a specific message
const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const message = await Message.findOne({
      _id: id,
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('guide', 'user');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read if user is the recipient
    if (message.recipient._id.toString() === userId && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message'
    });
  }
};

// Reply to a message
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: replyMessage } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const originalMessage = await Message.findById(id);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Check if user is the recipient of the original message
    if (originalMessage.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reply to messages sent to you'
      });
    }

    // Update the original message with reply
    originalMessage.reply = {
      message: replyMessage,
      repliedAt: new Date(),
      repliedBy: userId
    };
    originalMessage.status = 'replied';

    await originalMessage.save();

    // Create a new message as the reply
    const reply = new Message({
      sender: userId,
      recipient: originalMessage.sender,
      guide: originalMessage.guide,
      subject: `Re: ${originalMessage.subject}`,
      message: replyMessage,
      contactMethod: originalMessage.contactMethod,
      status: 'sent'
    });

    await reply.save();

    await reply.populate([
      { path: 'sender', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'guide', select: 'user' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: reply
    });

  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reply'
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const message = await Message.findOne({
      _id: id,
      recipient: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read'
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const count = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count'
    });
  }
};

module.exports = {
  sendMessage,
  getMyMessages,
  getMessage,
  replyToMessage,
  markAsRead,
  getUnreadCount
};
