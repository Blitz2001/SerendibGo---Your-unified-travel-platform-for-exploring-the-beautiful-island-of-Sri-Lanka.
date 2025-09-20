import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S8ihRFDRWCCCFP0sNzWI9hmoJBb4zaFjeay1dsNlLnSUYInDJYcMWQHyT2U3VkoafcaTKh5uQ0wownRC2Z7dGQW00Mlb5OZC4');

const PaymentForm = ({ 
  clientSecret, 
  amount, 
  currency, 
  onPaymentSuccess, 
  onPaymentError,
  bookingData 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingData?.customerName || 'Customer',
            email: bookingData?.customerEmail || '',
          },
        }
      });

      if (error) {
        console.error('Payment failed:', error);
        toast.error(`Payment failed: ${error.message}`);
        onPaymentError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        toast.success('Payment successful!');
        onPaymentSuccess?.(paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An error occurred during payment');
      onPaymentError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Details
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Pay
          </label>
          <div className="text-2xl font-bold text-blue-600">
            {currency} {amount?.toLocaleString()}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            !stripe || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isProcessing ? 'Processing...' : `Pay ${currency} ${amount?.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
};

const StripePaymentForm = ({ 
  clientSecret, 
  amount, 
  currency = 'LKR', 
  onPaymentSuccess, 
  onPaymentError,
  bookingData 
}) => {
  if (!clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Payment session not available. Please try again.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        clientSecret={clientSecret}
        amount={amount}
        currency={currency}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        bookingData={bookingData}
      />
    </Elements>
  );
};

export default StripePaymentForm;
