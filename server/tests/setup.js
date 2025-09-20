// Test setup file
require('dotenv').config({ path: './config.env' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Helper to create test user
  createTestUser: async (User, userData = {}) => {
    const defaultUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'tourist',
      ...userData
    };
    
    const user = new User(defaultUser);
    await user.save();
    return user;
  },

  // Helper to create test booking
  createTestBooking: async (TourBooking, user, bookingData = {}) => {
    const defaultBooking = {
      user: user._id,
      tour: new require('mongoose').Types.ObjectId(),
      startDate: new Date('2024-12-15'),
      participants: 2,
      totalAmount: 25000,
      status: 'pending',
      ...bookingData
    };
    
    const booking = new TourBooking(defaultBooking);
    await booking.save();
    return booking;
  },

  // Helper to get auth token
  getAuthToken: async (request, app, user) => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      });
    
    return loginResponse.body.token;
  },

  // Helper to clean up test data
  cleanupTestData: async (models) => {
    for (const model of models) {
      await model.deleteMany({});
    }
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
