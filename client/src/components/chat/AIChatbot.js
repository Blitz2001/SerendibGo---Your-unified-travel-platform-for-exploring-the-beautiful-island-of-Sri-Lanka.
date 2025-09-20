import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Welcome to SerendibGo! 🌴

I'm your AI travel assistant for Sri Lanka's premier travel platform. I can help you with:

🏨 **Hotel Bookings**: Find and book accommodations across Sri Lanka
🚗 **Vehicle Rentals**: Rent cars, vans, or buses with professional drivers
🧭 **Tour Packages**: Discover curated tours and cultural experiences
👨‍🏫 **Guide Services**: Connect with licensed local guides
💬 **Travel Planning**: Get personalized recommendations and itineraries

I have access to SerendibGo's complete service offerings and can recommend specific tours, hotels, and vehicles available on our platform.

What would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load suggestions when component mounts
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await apiService.get('/api/chatbot/suggestions');
      if (response.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'model',
          message: msg.content
        }));

      // Call the Gemini API
      const response = await apiService.post('/api/chatbot', {
        message: currentMessage,
        conversationHistory
      });

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.response,
          timestamp: new Date(response.data.timestamp)
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Sorry, I\'m having trouble right now. Please try again.');
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team for assistance with your Sri Lanka travel plans.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = suggestions.length > 0 ? suggestions.slice(0, 3) : [
    "What are the must-visit places in Sri Lanka?",
    "What's the best time to visit Sri Lanka?",
    "Tell me about Sri Lankan cuisine"
  ];

  // Format bot messages with rich text support
  const formatBotMessage = (content) => {
    if (!content) return null;

    // Split content into lines and process each line
    const lines = content.split('\n');
    const formattedLines = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedLines.push(<br key={`br-${index}`} />);
        return;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const bulletText = trimmedLine.substring(2);
        formattedLines.push(
          <div key={`bullet-${index}`} className="flex items-start mb-1">
            <span className="text-blue-600 mr-2 mt-1">•</span>
            <span className="text-gray-700">{bulletText}</span>
          </div>
        );
        return;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)\.\s(.+)$/);
        if (match) {
          formattedLines.push(
            <div key={`numbered-${index}`} className="flex items-start mb-1">
              <span className="text-blue-600 mr-2 mt-1 font-semibold">{match[1]}.</span>
              <span className="text-gray-700">{match[2]}</span>
            </div>
          );
          return;
        }
      }

      // Handle quoted text
      if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
        formattedLines.push(
          <div key={`quote-${index}`} className="bg-blue-50 border-l-4 border-blue-400 pl-3 py-2 mb-2 rounded-r">
            <span className="text-gray-700 italic">"{trimmedLine.slice(1, -1)}"</span>
          </div>
        );
        return;
      }

      // Handle headings (lines that end with :)
      if (trimmedLine.endsWith(':')) {
        formattedLines.push(
          <div key={`heading-${index}`} className="font-semibold text-gray-800 mb-2 mt-3 first:mt-0">
            {trimmedLine}
          </div>
        );
        return;
      }

      // Handle bold text with **
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        const formattedParts = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            return <strong key={`bold-${index}-${partIndex}`} className="font-semibold text-gray-900">{part}</strong>;
          }
          return part;
        });
        formattedLines.push(
          <p key={`bold-para-${index}`} className="mb-2 text-gray-700 leading-relaxed">
            {formattedParts}
          </p>
        );
        return;
      }

      // Handle regular paragraphs
      formattedLines.push(
        <p key={`para-${index}`} className="mb-2 text-gray-700 leading-relaxed">
          {trimmedLine}
        </p>
      );
    });

    return <div className="space-y-1">{formattedLines}</div>;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center"
        title="Chat with AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">SerendibGo AI Assistant</h3>
                <p className="text-sm text-blue-100">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm leading-relaxed">
                        {message.type === 'bot' ? (
                          <div className="prose prose-sm max-w-none">
                            {formatBotMessage(message.content)}
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-1 text-blue-100 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(question);
                    // Auto-send the question
                    setTimeout(() => {
                      handleSendMessage();
                    }, 100);
                  }}
                  className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about tours, hotels, vehicles, or travel advice..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
