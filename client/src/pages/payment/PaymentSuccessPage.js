import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, MapPin, Users, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentSuccessPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      // This would normally fetch from your API
      // For demo purposes, using mock data
      setBookingDetails({
        id: bookingId,
        type: 'tour',
        title: 'Beach Paradise - Mirissa',
        amount: 25000,
        currency: 'LKR',
        date: '2024-12-15',
        guests: 2,
        duration: '3 days',
        location: 'Mirissa, Southern Province',
        confirmationNumber: `CONF-${Date.now().toString().slice(-8)}`,
        paymentId: `PAY-${Date.now().toString().slice(-8)}`
      });
    } catch (error) {
      toast.error('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadItinerary = () => {
    // This would normally generate and download a PDF
    toast.success('Itinerary download started!');
  };

  const sendEmailConfirmation = () => {
    // This would normally send an email
    toast.success('Confirmation email sent!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your booking has been confirmed. Welcome to SerendibGo! 🎉
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmation</h2>
            <p className="text-gray-600">Confirmation #{bookingDetails.confirmationNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="font-medium text-gray-900">{bookingDetails.date}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Number of Guests</p>
                  <p className="font-medium text-gray-900">{bookingDetails.guests} people</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{bookingDetails.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{bookingDetails.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{bookingDetails.title}</h4>
              <p className="text-gray-600 text-sm">
                Experience the pristine beaches of Mirissa, go whale watching, and enjoy water sports 
                in one of Sri Lanka's most beautiful coastal destinations.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-medium text-gray-900">{bookingDetails.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-gray-900">
                {bookingDetails.currency} {bookingDetails.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium text-gray-900">Credit Card</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• You will receive a detailed itinerary via email within 24 hours</p>
            <p>• Our team will contact you 48 hours before your tour for final arrangements</p>
            <p>• Please arrive 15 minutes before the scheduled start time</p>
            <p>• Don't forget to bring comfortable clothing and sunscreen</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={downloadItinerary}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Itinerary</span>
          </button>
          
          <button
            onClick={sendEmailConfirmation}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Send Email Confirmation</span>
          </button>
          
          <Link
            to="/bookings"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>View My Bookings</span>
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 text-sm mb-3">
            Our customer support team is available 24/7 to assist you
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <p>📧 support@serendibgo.lk</p>
            <p>📞 +94 11 234 5678</p>
            <p>💬 Use our AI chatbot for instant assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
