import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  Download,
  Share2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import vehicleService from '../../services/vehicleService';

const VehicleRentalConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rentalInfo = location.state?.rentalInfo;

  if (!rentalInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your rental booking information. This might happen if you refreshed the page or navigated directly to this URL.
            </p>
            <div className="space-x-4">
              <Link
                to="/vehicles"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vehicles
              </Link>
              <Link
                to="/my-bookings"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadReceipt = () => {
    // Create a simple receipt text
    const receipt = `
VEHICLE RENTAL CONFIRMATION
============================

Booking ID: ${rentalInfo._id || 'N/A'}
Date: ${new Date().toLocaleDateString()}

VEHICLE DETAILS:
- Vehicle: ${rentalInfo.vehicle?.brand} ${rentalInfo.vehicle?.model}
- Type: ${rentalInfo.vehicle?.type}
- Year: ${rentalInfo.vehicle?.year}

RENTAL DETAILS:
- Rental Type: ${rentalInfo.rentalType}
- Start Date: ${rentalInfo.startDate}
- End Date: ${rentalInfo.endDate}
- Duration: ${rentalInfo.duration} ${rentalInfo.rentalType === 'hourly' ? 'hours' : 'days'}
- Pickup Location: ${rentalInfo.pickupLocation}
- Dropoff Location: ${rentalInfo.dropoffLocation}

PAYMENT:
- Total Amount: ${rentalInfo.pricing?.totalAmount || 'N/A'} ${rentalInfo.currency || 'LKR'}
- Payment Method: ${rentalInfo.paymentMethod}

Thank you for choosing SerendibGo!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rental-confirmation-${rentalInfo._id || 'booking'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully!');
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vehicle Rental Confirmation',
        text: `I've booked a ${rentalInfo.vehicle?.brand} ${rentalInfo.vehicle?.model} for ${rentalInfo.rentalType} rental from ${rentalInfo.startDate} to ${rentalInfo.endDate}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rental Confirmed!</h1>
            <p className="text-gray-600">
              Your vehicle rental has been successfully booked. You'll receive a confirmation email shortly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">{rentalInfo.startDate}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900">{rentalInfo.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">
                      {rentalInfo.duration} {rentalInfo.rentalType === 'hourly' ? 'hours' : 'days'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-medium text-gray-900">{rentalInfo.pickupLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={vehicleService.formatVehicleData(rentalInfo.vehicle).primaryImage}
                  alt={`${rentalInfo.vehicle?.brand} ${rentalInfo.vehicle?.model}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rentalInfo.vehicle?.brand} {rentalInfo.vehicle?.model}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {rentalInfo.vehicle?.year} • {rentalInfo.vehicle?.type}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Capacity: {rentalInfo.vehicle?.capacity} people</span>
                    <span>Location: {rentalInfo.vehicle?.location?.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Rate</span>
                  <span className="font-medium">
                    {vehicleService.formatPrice(rentalInfo.pricing?.baseAmount || 0, rentalInfo.currency)}
                  </span>
                </div>
                {rentalInfo.pricing?.driverFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver Fee</span>
                    <span className="font-medium">
                      {vehicleService.formatPrice(rentalInfo.pricing.driverFee, rentalInfo.currency)}
                    </span>
                  </div>
                )}
                {rentalInfo.pricing?.insuranceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium">
                      {vehicleService.formatPrice(rentalInfo.pricing.insuranceFee, rentalInfo.currency)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">
                      {vehicleService.formatPrice(rentalInfo.pricing?.totalAmount || 0, rentalInfo.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(rentalInfo.status || 'confirmed')}`}>
                  {rentalInfo.status || 'Confirmed'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your booking is confirmed and ready for pickup.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </button>
                <button
                  onClick={handleShareBooking}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </button>
                <Link
                  to="/my-bookings"
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View All Bookings
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📞 +94 11 234 5678</p>
                <p>✉️ support@serendibgo.com</p>
                <p>💬 Live Chat Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleRentalConfirmation;
