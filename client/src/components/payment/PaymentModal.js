import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StripePaymentForm from './StripePaymentForm';
import StripePaymentService from '../../services/stripePaymentService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  onPaymentSuccess 
}) => {
  const [paymentSession, setPaymentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookingData) {
      createPaymentSession();
    }
  }, [isOpen, bookingData]);

  const createPaymentSession = async () => {
    if (!bookingData) return;

    setIsLoading(true);
    setError(null);

    try {
      let paymentData;
      
      switch (bookingData.bookingType) {
        case 'tour':
          paymentData = await StripePaymentService.processTourPayment(
            bookingData,
            null,
            (error) => setError(error.message)
          );
          break;
        case 'vehicle':
          paymentData = await StripePaymentService.processVehiclePayment(
            bookingData,
            null,
            (error) => setError(error.message)
          );
          break;
        case 'guide':
          paymentData = await StripePaymentService.processGuidePayment(
            bookingData,
            null,
            (error) => setError(error.message)
          );
          break;
        default:
          throw new Error('Invalid booking type');
      }

      setPaymentSession(paymentData);
    } catch (error) {
      console.error('Payment session creation error:', error);
      setError(error.message || 'Failed to create payment session');
      toast.error('Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Verify payment with backend
      const verification = await StripePaymentService.verifyPayment(paymentIntent.id);
      
      if (verification.success) {
        toast.success('Payment completed successfully!');
        onPaymentSuccess?.(verification.data);
        onClose();
      } else {
        throw new Error(verification.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Creating payment session...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={createPaymentSession}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}

          {paymentSession && !isLoading && (
            <div>
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Booking Type:</span>
                    <span className="capitalize">{bookingData.bookingType}</span>
                  </div>
                  {bookingData.tourTitle && (
                    <div className="flex justify-between">
                      <span>Tour:</span>
                      <span>{bookingData.tourTitle}</span>
                    </div>
                  )}
                  {bookingData.participants && (
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span>{bookingData.participants}</span>
                    </div>
                  )}
                  {bookingData.startDate && (
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span>{new Date(bookingData.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>{bookingData.currency} {bookingData.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <StripePaymentForm
                clientSecret={paymentSession.clientSecret}
                amount={bookingData.totalAmount}
                currency={bookingData.currency}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                bookingData={{
                  customerName: bookingData.customerName,
                  customerEmail: bookingData.customerEmail
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
