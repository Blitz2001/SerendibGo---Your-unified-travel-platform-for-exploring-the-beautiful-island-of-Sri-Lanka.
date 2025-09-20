import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import tourService from '../services/tourService';
import authService from '../services/authService';
import PaymentModal from './payment/PaymentModal';

const TourBookingModal = ({ tour, isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    participants: 1,
    startDate: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: `/tours/${tour._id}` } });
      return;
    }

    if (!formData.startDate) {
      setError('Please select a start date');
      return;
    }

    if (formData.participants < 1) {
      setError('Please select at least 1 participant');
      return;
    }

    if (formData.participants > tour.availableSlots) {
      setError(`Only ${tour.availableSlots} slots available for this tour`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await tourService.bookTour(tour._id, formData);
      
      if (response.success) {
        // TEMPORARILY DISABLED: Skip payment step for now
        // TODO: Re-enable payment integration later
        toast.success('Tour booked successfully! Payment integration will be added later.');
        onSuccess(response.data);
        onClose();
        
        // COMMENTED OUT: Payment integration (to be re-enabled later)
        /*
        setBookingData({
          bookingId: response.data._id,
          bookingType: 'tour',
          totalAmount: response.data.totalAmount,
          currency: response.data.currency,
          tourTitle: tour.title,
          participants: response.data.participants,
          startDate: response.data.startDate,
          customerName: authService.getCurrentUser()?.name,
          customerEmail: authService.getCurrentUser()?.email
        });
        setShowPaymentModal(true);
        */
      } else {
        setError(response.message || 'Failed to book tour');
      }
    } catch (err) {
      setError('An error occurred while booking the tour');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    // Close payment modal
    setShowPaymentModal(false);
    
    // Call the original success callback
    onSuccess(bookingData);
    
    // Close the booking modal
    onClose();
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setBookingData(null);
  };

  if (!isOpen) return null;

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Book Tour</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900">{tour.title}</h4>
            <p className="text-sm text-gray-600">{tour.location}</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">
              {tour.currency} {tour.price?.toLocaleString()} per person
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Participants
              </label>
              <select
                id="participants"
                name="participants"
                value={formData.participants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {[...Array(tour.availableSlots)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {tour.availableSlots} slots available
              </p>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={minDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requirements or requests..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
              <h5 className="font-medium text-gray-900 mb-2">Booking Summary</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tour Price:</span>
                  <span>{tour.currency} {tour.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{formData.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{tour.duration} day{tour.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">
                      {tour.currency} {(tour.price * formData.participants)?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        bookingData={bookingData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default TourBookingModal;

