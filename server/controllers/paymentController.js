const Payment = require('../models/Payment');
const TourBooking = require('../models/TourBooking');
const VehicleBooking = require('../models/VehicleBooking');
const GuideBooking = require('../models/GuideBooking');
const StripeService = require('../services/stripeService');
const crypto = require('crypto');

// @desc    Create a new payment session with Stripe
// @route   POST /api/payments/create
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { bookingId, bookingType, amount } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!bookingId || !bookingType || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, booking type, and amount are required'
      });
    }

    // Validate booking type
    const validBookingTypes = ['tour', 'vehicle', 'guide', 'hotel'];
    if (!validBookingTypes.includes(bookingType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type'
      });
    }

    // Find the booking based on type
    let booking;
    let tourTitle = '';
    
    switch (bookingType) {
      case 'tour':
        booking = await TourBooking.findById(bookingId).populate('tour', 'title');
        tourTitle = booking?.tour?.title || 'Tour Booking';
        break;
      case 'vehicle':
        booking = await VehicleBooking.findById(bookingId).populate('vehicle', 'model');
        tourTitle = booking?.vehicle?.model || 'Vehicle Booking';
        break;
      case 'guide':
        booking = await GuideBooking.findById(bookingId).populate('guide', 'name');
        tourTitle = booking?.guide?.name || 'Guide Booking';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported booking type'
        });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to booking'
      });
    }

    // Check if booking is already paid
    if (booking.status === 'paid' || booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    // Generate payment session ID and order ID
    const paymentSessionId = crypto.randomUUID();
    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create payment record
    const payment = new Payment({
      orderId: orderId,
      user: userId,
      bookingId: bookingId,
      bookingType: bookingType,
      amount: amount,
      currency: 'LKR',
      status: 'pending',
      paymentSessionId: paymentSessionId,
      paymentMethod: 'stripe',
      metadata: {
        bookingDetails: {
          id: bookingId,
          type: bookingType,
          amount: amount
        }
      }
    });

    await payment.save();

    // Create Stripe payment intent
    const stripeResult = await StripeService.createPaymentIntent({
      bookingId: payment._id,
      amount: amount,
      currency: 'lkr',
      customerEmail: req.user.email,
      tourTitle: tourTitle
    });

    if (!stripeResult.success) {
      // Update payment status to failed
      payment.status = 'failed';
      if (!payment.metadata) {
        payment.metadata = {};
      }
      payment.metadata.stripeError = stripeResult.error;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Failed to create payment session',
        error: stripeResult.error
      });
    }

    // Update payment with Stripe payment intent ID
    payment.stripePaymentIntentId = stripeResult.paymentIntentId;
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment session created successfully',
      data: {
        paymentId: payment._id,
        paymentSessionId: paymentSessionId,
        amount: amount,
        currency: 'LKR',
        clientSecret: stripeResult.clientSecret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify payment with Stripe
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.userId;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Find payment by Stripe payment intent ID
    const payment = await Payment.findOne({ 
      stripePaymentIntentId: paymentIntentId,
      user: userId 
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify payment with Stripe
    const stripeResult = await StripeService.confirmPaymentIntent(paymentIntentId);

    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: stripeResult.error
      });
    }

    // Update payment status
    payment.status = stripeResult.status === 'succeeded' ? 'completed' : 'failed';
    payment.completedAt = new Date();
    if (!payment.metadata) {
      payment.metadata = {};
    }
    payment.metadata.stripeStatus = stripeResult.status;

    await payment.save();

    // Update booking status if payment successful
    if (payment.status === 'completed') {
      let booking;
      switch (payment.bookingType) {
        case 'tour':
          booking = await TourBooking.findById(payment.bookingId);
          break;
        case 'vehicle':
          booking = await VehicleBooking.findById(payment.bookingId);
          break;
        case 'guide':
          booking = await GuideBooking.findById(payment.bookingId);
          break;
      }

      if (booking) {
        booking.status = 'paid';
        booking.paymentId = payment._id;
        await booking.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verification completed',
      data: {
        paymentId: payment._id,
        status: payment.status,
        stripeStatus: stripeResult.status
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('bookingId', 'status createdAt')
      .select('-__v');

    const total = await Payment.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const payment = await Payment.findOne({ _id: id, user: userId })
      .populate('bookingId')
      .select('-__v');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Process payment refund
// @route   POST /api/payments/refund
// @access  Private
const processRefund = async (req, res) => {
  try {
    const { paymentId, reason, amount } = req.body;
    const userId = req.user.userId;

    if (!paymentId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and reason are required'
      });
    }

    // Find payment
    const payment = await Payment.findOne({ 
      _id: paymentId, 
      user: userId 
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment can be refunded
    if (!payment.canBeRefunded()) {
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be refunded'
      });
    }

    // Determine refund amount
    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Process refund with Stripe
    let stripeRefundResult = null;
    if (payment.stripePaymentIntentId) {
      stripeRefundResult = await StripeService.createRefund({
        paymentIntentId: payment.stripePaymentIntentId,
        amount: refundAmount * 100, // Convert to cents
        reason: reason
      });
    }

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    
    if (stripeRefundResult && stripeRefundResult.success) {
      payment.transactionId = stripeRefundResult.refundId;
      if (!payment.metadata) {
        payment.metadata = {};
      }
      payment.metadata.stripeRefundId = stripeRefundResult.refundId;
    }

    await payment.save();

    // Update booking status
    let booking;
    switch (payment.bookingType) {
      case 'tour':
        booking = await TourBooking.findById(payment.bookingId);
        break;
      case 'vehicle':
        booking = await VehicleBooking.findById(payment.bookingId);
        break;
      case 'guide':
        booking = await GuideBooking.findById(payment.bookingId);
        break;
    }

    if (booking) {
      booking.status = 'cancelled';
      booking.cancellationReason = `Refunded: ${reason}`;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        paymentId: payment._id,
        refundAmount: refundAmount,
        refundReason: reason,
        refundedAt: payment.refundedAt,
        stripeRefundId: stripeRefundResult?.refundId || null
      }
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Generate payment invoice
// @route   GET /api/payments/:id/invoice
// @access  Private
const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const payment = await Payment.findOne({ _id: id, user: userId })
      .populate('user', 'name email')
      .populate('bookingId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${payment.orderId}`,
      invoiceDate: payment.createdAt,
      dueDate: payment.createdAt,
      customer: {
        name: payment.user.name,
        email: payment.user.email
      },
      items: [{
        description: `${payment.bookingType.charAt(0).toUpperCase() + payment.bookingType.slice(1)} Booking`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod
    };

    res.status(200).json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to generate PayHere hash
const generatePayHereHash = (orderId, amount, currency) => {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'your_merchant_secret';
  const hashString = `${merchantSecret}${orderId}${amount}${currency}`;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

module.exports = {
  createPayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  processRefund,
  generateInvoice
};
