import apiService from './apiService';
import API_CONFIG from '../config/api';

class StripePaymentService {
  /**
   * Create a payment session for a booking
   * @param {Object} bookingData - Booking information
   * @param {string} bookingData.bookingId - Booking ID
   * @param {string} bookingData.bookingType - Type of booking (tour, vehicle, guide)
   * @param {number} bookingData.amount - Amount to pay
   * @returns {Promise<Object>} Payment session data
   */
  static async createPaymentSession(bookingData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE, bookingData);
      return response.data;
    } catch (error) {
      console.error('Payment session creation error:', error);
      throw error;
    }
  }

  /**
   * Verify payment after successful Stripe payment
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Payment verification result
   */
  static async verifyPayment(paymentIntentId) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY, {
        paymentIntentId
      });
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for the current user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} Payment history
   */
  static async getPaymentHistory(params = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY, { params });
      return response.data;
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  }

  /**
   * Get payment details by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  static async getPaymentDetails(paymentId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(paymentId));
      return response.data;
    } catch (error) {
      console.error('Payment details error:', error);
      throw error;
    }
  }

  /**
   * Process a complete payment flow for tour booking
   * @param {Object} bookingData - Tour booking data
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   * @returns {Promise<Object>} Payment session data
   */
  static async processTourPayment(bookingData, onSuccess, onError) {
    try {
      // Create payment session
      const paymentSession = await this.createPaymentSession({
        bookingId: bookingData.bookingId,
        bookingType: 'tour',
        amount: bookingData.totalAmount
      });

      // paymentSession is already the data part of the response
      return paymentSession;
    } catch (error) {
      console.error('Tour payment processing error:', error);
      onError?.(error);
      throw error;
    }
  }

  /**
   * Process a complete payment flow for vehicle booking
   * @param {Object} bookingData - Vehicle booking data
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   * @returns {Promise<Object>} Payment session data
   */
  static async processVehiclePayment(bookingData, onSuccess, onError) {
    try {
      // Create payment session
      const paymentSession = await this.createPaymentSession({
        bookingId: bookingData.bookingId,
        bookingType: 'vehicle',
        amount: bookingData.totalAmount
      });

      if (paymentSession.success) {
        return paymentSession.data;
      } else {
        throw new Error(paymentSession.message || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Vehicle payment processing error:', error);
      onError?.(error);
      throw error;
    }
  }

  /**
   * Process a complete payment flow for guide booking
   * @param {Object} bookingData - Guide booking data
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   * @returns {Promise<Object>} Payment session data
   */
  static async processGuidePayment(bookingData, onSuccess, onError) {
    try {
      // Create payment session
      const paymentSession = await this.createPaymentSession({
        bookingId: bookingData.bookingId,
        bookingType: 'guide',
        amount: bookingData.totalAmount
      });

      if (paymentSession.success) {
        return paymentSession.data;
      } else {
        throw new Error(paymentSession.message || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Guide payment processing error:', error);
      onError?.(error);
      throw error;
    }
  }
}

export default StripePaymentService;
