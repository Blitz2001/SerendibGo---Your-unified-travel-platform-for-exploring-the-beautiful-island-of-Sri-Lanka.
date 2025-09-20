import apiService from './apiService';
import API_CONFIG from '../config/api';

class PaymentService {
  // Create a new payment session
  async createPayment(bookingData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE, bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Verify payment with PayHere
  async verifyPayment(verificationData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY, verificationData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY, {
        page,
        limit
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get payment details by ID
  async getPaymentById(paymentId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(paymentId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Process refund
  async processRefund(refundData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.REFUND, refundData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Initialize PayHere payment
  async initializePayHerePayment(paymentData) {
    try {
      // Create payment session
      const paymentSession = await this.createPayment(paymentData);
      
      if (paymentSession.success) {
        // Redirect to PayHere checkout
        const { paymentUrl, paymentData: payHereData } = paymentSession.data;
        
        // Create form and submit to PayHere
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentUrl;
        form.target = '_blank';

        // Add payment data as form fields
        Object.keys(payHereData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = payHereData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        return {
          success: true,
          message: 'Redirecting to PayHere...',
          data: paymentSession.data
        };
      } else {
        throw new Error(paymentSession.message || 'Failed to create payment session');
      }
    } catch (error) {
      throw error;
    }
  }

  // Handle PayHere payment callback
  async handlePayHereCallback(callbackData) {
    try {
      const { order_id, payment_id, status, hash } = callbackData;
      
      const verificationResponse = await this.verifyPayment({
        orderId: order_id,
        paymentId: payment_id,
        status,
        hash
      });

      return verificationResponse;
    } catch (error) {
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(startDate, endDate) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.STATS, {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a single instance
const paymentService = new PaymentService();
export default paymentService;
