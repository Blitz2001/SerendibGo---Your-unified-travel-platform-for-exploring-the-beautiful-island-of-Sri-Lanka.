const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const supportController = require('../controllers/supportController');

const router = express.Router();

// @route   POST /api/support/contact
// @desc    Create a new support request
// @access  Public (optional auth)
router.post('/contact', authMiddleware, supportController.createSupportRequest);

// @route   GET /api/support/categories
// @desc    Get support request categories
// @access  Public
router.get('/categories', supportController.getCategories);

// @route   GET /api/support/my-requests
// @desc    Get user's support requests
// @access  Private
router.get('/my-requests', authMiddleware, supportController.getMySupportRequests);

// @route   GET /api/support/requests/:id
// @desc    Get support request details
// @access  Private
router.get('/requests/:id', authMiddleware, supportController.getSupportRequest);

// @route   POST /api/support/requests/:id/respond
// @desc    Add response to support request (Admin only)
// @access  Private (Admin)
router.post('/requests/:id/respond', authMiddleware, supportController.addResponse);

// @route   PUT /api/support/requests/:id/status
// @desc    Update support request status (Admin only)
// @access  Private (Admin)
router.put('/requests/:id/status', authMiddleware, supportController.updateStatus);

module.exports = router;
