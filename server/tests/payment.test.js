const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Payment = require('../models/Payment');
const User = require('../models/User');
const TourBooking = require('../models/TourBooking');

describe('Payment API Tests', () => {
  let testUser;
  let testBooking;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    await testUser.save();

    // Create test booking
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const endDate = new Date(futureDate);
    endDate.setDate(endDate.getDate() + 3); // 3 days later
    
    testBooking = new TourBooking({
      user: testUser._id,
      tour: new mongoose.Types.ObjectId(),
      startDate: futureDate,
      endDate: endDate,
      participants: 2,
      totalAmount: 25000,
      status: 'pending'
    });
    await testBooking.save();

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await Payment.deleteMany({});
    await TourBooking.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/payments/create', () => {
    it('should create a payment session successfully', async () => {
      const paymentData = {
        bookingId: testBooking._id.toString(),
        bookingType: 'tour',
        amount: 25000,
        currency: 'LKR'
      };

      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('paymentId');
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('paymentUrl');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent booking', async () => {
      const paymentData = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        bookingType: 'tour',
        amount: 25000,
        currency: 'LKR'
      };

      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should verify payment successfully', async () => {
      // First create a payment
      const payment = new Payment({
        orderId: 'TEST_ORDER_123',
        user: testUser._id,
        bookingId: testBooking._id,
        bookingType: 'tour',
        amount: 25000,
        currency: 'LKR',
        status: 'pending'
      });
      await payment.save();

      const verificationData = {
        orderId: 'TEST_ORDER_123',
        paymentId: 'PAY_123456',
        status: '2', // PayHere success status
        hash: 'test_hash' // In real scenario, this would be calculated
      };

      const response = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verificationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent payment', async () => {
      const verificationData = {
        orderId: 'NON_EXISTENT_ORDER',
        paymentId: 'PAY_123456',
        status: '2',
        hash: 'test_hash'
      };

      const response = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verificationData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return payment history', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('payments');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/payments/history');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should return payment details', async () => {
      const payment = new Payment({
        orderId: 'TEST_ORDER_DETAILS',
        user: testUser._id,
        bookingId: testBooking._id,
        bookingType: 'tour',
        amount: 25000,
        currency: 'LKR',
        status: 'completed'
      });
      await payment.save();

      const response = await request(app)
        .get(`/api/payments/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment._id).toBe(payment._id.toString());
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/payments/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should process refund successfully', async () => {
      const payment = new Payment({
        orderId: 'TEST_ORDER_REFUND',
        user: testUser._id,
        bookingId: testBooking._id,
        bookingType: 'tour',
        amount: 25000,
        currency: 'LKR',
        status: 'completed'
      });
      await payment.save();

      const refundData = {
        paymentId: payment._id.toString(),
        reason: 'Customer request',
        amount: 25000
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment.status).toBe('refunded');
    });

    it('should return 400 for non-completed payment', async () => {
      const payment = new Payment({
        orderId: 'TEST_ORDER_REFUND_FAIL',
        user: testUser._id,
        bookingId: testBooking._id,
        bookingType: 'tour',
        amount: 25000,
        currency: 'LKR',
        status: 'pending'
      });
      await payment.save();

      const refundData = {
        paymentId: payment._id.toString(),
        reason: 'Customer request',
        amount: 25000
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
