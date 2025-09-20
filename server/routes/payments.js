const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// @route   POST /api/payments/create
// @desc    Create a new payment session
// @access  Private
router.post('/create', authMiddleware, paymentController.createPayment);

// @route   POST /api/payments/verify
// @desc    Verify payment with PayHere
// @access  Private
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

// @route   GET /api/payments/:id
// @desc    Get payment details by ID
// @access  Private
router.get('/:id', authMiddleware, paymentController.getPaymentDetails);

// @route   GET /api/payments/:id/invoice
// @desc    Generate payment invoice
// @access  Private
router.get('/:id/invoice', authMiddleware, paymentController.generateInvoice);

// @route   POST /api/payments/refund
// @desc    Process payment refund
// @access  Private
router.post('/refund', authMiddleware, paymentController.processRefund);

// @route   POST /api/payments/notify
// @desc    PayHere webhook notification
// @access  Public
router.post('/notify', paymentController.verifyPayment);

module.exports = router;
