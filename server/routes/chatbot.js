const express = require('express');
const { chatWithBot, getChatbotSuggestions } = require('../controllers/chatbotController');

const router = express.Router();

// @route   POST /api/chatbot
// @desc    Chat with AI chatbot
// @access  Public
router.post('/', chatWithBot);

// @route   GET /api/chatbot/suggestions
// @desc    Get chatbot suggestions/prompts
// @access  Public
router.get('/suggestions', getChatbotSuggestions);

module.exports = router;
