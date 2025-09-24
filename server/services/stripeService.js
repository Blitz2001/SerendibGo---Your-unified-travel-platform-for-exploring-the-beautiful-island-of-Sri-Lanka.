/**
 * Lazy initialize Stripe client so we can show a clearer error when the
 * environment variable is missing instead of letting the Stripe library
 * throw an opaque error at module import time.
 */
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable.\nPlease set STRIPE_SECRET_KEY in env.local (project root) or your environment.');
  }
  // require here to avoid initializing stripe during module import when key is missing
  // eslint-disable-next-line global-require
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

class StripeService {
  /**
   * Create a payment intent for tour booking
   * @param {Object} bookingData - Booking information
   * @param {string} bookingData.bookingId - Booking ID
   * @param {number} bookingData.amount - Amount in cents
   * @param {string} bookingData.currency - Currency code (default: 'lkr')
   * @param {string} bookingData.customerEmail - Customer email
   * @param {string} bookingData.tourTitle - Tour title for description
   * @returns {Promise<Object>} Payment intent object
   */
  static async createPaymentIntent(bookingData) {
    try {
      const { bookingId, amount, currency = 'lkr', customerEmail, tourTitle } = bookingData;

      // Convert LKR to cents (Stripe expects amounts in smallest currency unit)
      const amountInCents = Math.round(amount * 100);

  const paymentIntent = await getStripe().paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          bookingId: bookingId.toString(),
          bookingType: 'tour',
          tourTitle: tourTitle
        },
        receipt_email: customerEmail,
        description: `Tour Booking: ${tourTitle}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: currency.toLowerCase(),
        status: paymentIntent.status
      };

    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'STRIPE_ERROR'
      };
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Confirmation result
   */
  static async confirmPaymentIntent(paymentIntentId) {
    try {
  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          status: 'succeeded',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        };
      } else if (paymentIntent.status === 'requires_payment_method') {
        return {
          success: false,
          status: 'requires_payment_method',
          error: 'Payment method required'
        };
      } else if (paymentIntent.status === 'requires_confirmation') {
  const confirmedPayment = await getStripe().paymentIntents.confirm(paymentIntentId);
        return {
          success: confirmedPayment.status === 'succeeded',
          status: confirmedPayment.status,
          amount: confirmedPayment.amount,
          currency: confirmedPayment.currency,
          metadata: confirmedPayment.metadata
        };
      } else {
        return {
          success: false,
          status: paymentIntent.status,
          error: `Payment status: ${paymentIntent.status}`
        };
      }

    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'STRIPE_ERROR'
      };
    }
  }

  /**
   * Retrieve payment intent details
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment intent details
   */
  static async getPaymentIntent(paymentIntentId) {
    try {
  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata,
          created: paymentIntent.created
        }
      };

    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'STRIPE_ERROR'
      };
    }
  }

  /**
   * Cancel a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Cancellation result
   */
  static async cancelPaymentIntent(paymentIntentId) {
    try {
  const paymentIntent = await getStripe().paymentIntents.cancel(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        cancelled: true
      };

    } catch (error) {
      console.error('Stripe payment cancellation error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'STRIPE_ERROR'
      };
    }
  }

  /**
   * Create a refund for a successful payment
   * @param {Object} refundData - Refund data
   * @param {string} refundData.paymentIntentId - Payment intent ID
   * @param {number} refundData.amount - Amount to refund in cents (optional, defaults to full refund)
   * @param {string} refundData.reason - Reason for refund
   * @returns {Promise<Object>} Refund result
   */
  static async createRefund(refundData) {
    try {
      const { paymentIntentId, amount, reason } = refundData;
      
      const stripeRefundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        stripeRefundData.amount = Math.round(amount); // Amount is already in cents
      }

      if (reason) {
        stripeRefundData.reason = reason;
      }

  const refund = await getStripe().refunds.create(stripeRefundData);
      
      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        currency: refund.currency
      };

    } catch (error) {
      console.error('Stripe refund creation error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'STRIPE_ERROR'
      };
    }
  }
}

module.exports = StripeService;
