const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper: lazily initialize the Gemini AI client so missing/invalid keys
// produce a clear response instead of an unhandled 500.
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI:', err && err.message ? err.message : err);
    return null;
  }
}

console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

// Chat with AI chatbot
const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Initialize the generative AI client for each request to handle missing/invalid keys
    const genAI = getGenAI();
    if (!genAI) {
      // Clear error to the client when the AI key isn't configured
      return res.status(503).json({
        success: false,
        message: 'AI service not configured. Please set GEMINI_API_KEY in the server environment.'
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create context for Sri Lanka tourism
    const context = `You are SerendibGo AI Assistant, the official AI travel assistant for SerendibGo - Sri Lanka's premier travel platform.

    ABOUT SERENDIBGO PLATFORM:
    SerendibGo is a comprehensive travel platform offering:
    
    🏨 HOTEL BOOKINGS:
    - Wide selection of hotels across Sri Lanka
    - Budget to luxury accommodations
    - Real-time availability and pricing
    - Easy booking with instant confirmation
    
    🚗 VEHICLE SERVICES:
    - Vehicle rentals (hourly, daily, weekly, monthly)
    - Professional drivers available
    - Various vehicle types: cars, vans, buses
    - Insurance options included
    
    🧭 TOUR BOOKINGS:
    - Curated tours across Sri Lanka
    - Cultural, adventure, and nature tours
    - Professional tour guides
    - Group and private tour options
    
    👨‍🏫 GUIDE SERVICES:
    - Licensed local guides
    - Specialized knowledge in different regions
    - Custom itinerary planning
    - Multi-language support
    
    💬 MESSAGING SYSTEM:
    - Direct communication with guides
    - Real-time chat support
    - Booking inquiries and support
    
    YOUR ROLE AS AI ASSISTANT:
    - Help users navigate the SerendibGo platform
    - Recommend specific services based on their needs
    - Provide detailed information about available tours, hotels, and vehicles
    - Assist with booking processes and requirements
    - Offer personalized travel advice for Sri Lanka
    - Guide users to the right sections of the platform
    
    KEY INFORMATION ABOUT SRI LANKA:
    - Capital: Colombo
    - Popular destinations: Kandy, Galle, Sigiriya, Anuradhapura, Polonnaruwa, Nuwara Eliya, Ella, Yala National Park
    - Famous attractions: Temple of the Tooth Relic, Sigiriya Rock Fortress, Galle Fort, Yala Safari, Tea plantations
    - Best time to visit: December to March (dry season)
    - Currency: Sri Lankan Rupee (LKR)
    - Languages: Sinhala, Tamil, English
    
    IMPORTANT: You have access to SerendibGo's services and can recommend specific tours, hotels, and vehicles available on the platform. Always be specific about what SerendibGo offers and guide users to the appropriate booking sections.`;

    // Prepare conversation history with context
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: context }]
      },
      {
        role: 'model',
        parts: [{ text: 'Hello! I\'m SerendibGo AI Assistant, your personal travel guide for Sri Lanka\'s premier travel platform. I can help you with hotel bookings, vehicle rentals, tour packages, guide services, and personalized travel planning. What would you like to explore on SerendibGo today?' }]
      }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      chatHistory.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      });
    });

    // Add current message
    chatHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Start chat session
    const chat = model.startChat({
      history: chatHistory
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      data: {
        response: text,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Chatbot error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Handle specific Gemini API errors
    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error. Please contact support.'
      });
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.'
      });
    }

    // Fallback response
    res.json({
      success: true,
      data: {
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team for assistance with your Sri Lanka travel plans.',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Get chatbot suggestions/prompts
const getChatbotSuggestions = (req, res) => {
  const suggestions = [
    "What are the must-visit places in Sri Lanka?",
    "Tell me about Sri Lankan cuisine and food",
    "What's the best time to visit Sri Lanka?",
    "How many days should I spend in Sri Lanka?",
    "What activities can I do in Kandy?",
    "Tell me about Yala National Park safari",
    "What are the visa requirements for Sri Lanka?",
    "Suggest a 7-day itinerary for Sri Lanka",
    "What's the weather like in Sri Lanka?",
    "Tell me about Sri Lankan culture and traditions"
  ];

  res.json({
    success: true,
    data: {
      suggestions
    }
  });
};

module.exports = {
  chatWithBot,
  getChatbotSuggestions
};
