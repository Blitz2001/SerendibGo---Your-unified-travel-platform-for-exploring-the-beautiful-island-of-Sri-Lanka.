import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, Star, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import guideService from '../../services/guideService';
import guideBookingService from '../../services/guideBookingService';
import { useAuth } from '../../contexts/AuthContext';

const GuideBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    participants: 1,
    tourType: 'cultural',
    specialRequests: '',
    meetingPoint: '',
    paymentMethod: 'credit_card'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const response = await guideService.getGuideById(id);
        
        if (response.success) {
          setGuide(response.guide);
          // Pre-fill dates if passed from previous page
          if (location.state?.startDate) {
            setBookingData(prev => ({
              ...prev,
              startDate: location.state.startDate,
              endDate: location.state.endDate || ''
            }));
          }
        } else {
          setError('Guide not found');
        }
      } catch (err) {
        console.error('Error fetching guide:', err);
        setError('Failed to load guide details');
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    if (!guide || !bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return guide.dailyRate * duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to book a guide');
      navigate('/login');
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(bookingData.startDate) <= new Date()) {
      toast.error('Start date must be in the future');
      return;
    }

    if (new Date(bookingData.endDate) <= new Date(bookingData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (bookingData.participants > guide.maxCapacity) {
      toast.error(`Maximum ${guide.maxCapacity} participants allowed`);
      return;
    }

    setSubmitting(true);
    try {
      const bookingResponse = await guideBookingService.createGuideBooking({
        guideId: id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        participants: bookingData.participants,
        tourType: bookingData.tourType,
        specialRequests: bookingData.specialRequests,
        meetingPoint: bookingData.meetingPoint,
        paymentMethod: bookingData.paymentMethod
      });

      if (bookingResponse.success) {
        toast.success('Guide booking created successfully!');
        navigate('/bookings');
      } else {
        toast.error(bookingResponse.message || 'Failed to create guide booking');
      }
    } catch (err) {
      console.error('Error booking guide:', err);
      toast.error('Failed to book guide. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString() || '0'}`;
  };

  const tourTypeOptions = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'nature', label: 'Nature' },
    { value: 'beach', label: 'Beach' },
    { value: 'wildlife', label: 'Wildlife' },
    { value: 'historical', label: 'Historical' },
    { value: 'religious', label: 'Religious' },
    { value: 'food', label: 'Food' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'custom', label: 'Custom' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Guide Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The guide you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/guides')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const duration = bookingData.startDate && bookingData.endDate 
    ? Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/guides/${id}`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guide
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Guide: {guide.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Participants and Tour Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="inline w-4 h-4 mr-2" />
                      Number of Participants
                    </label>
                    <input
                      type="number"
                      name="participants"
                      value={bookingData.participants}
                      onChange={handleInputChange}
                      min="1"
                      max={guide.maxCapacity}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Max: {guide.maxCapacity} participants
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour Type
                    </label>
                    <select
                      name="tourType"
                      value={bookingData.tourType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {tourTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Meeting Point */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Meeting Point
                  </label>
                  <input
                    type="text"
                    name="meetingPoint"
                    value={bookingData.meetingPoint}
                    onChange={handleInputChange}
                    placeholder="e.g., Hotel lobby, Airport, City center"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any special requirements or requests..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    'Book Guide'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Guide Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide Summary</h3>
              
              {/* Guide Image */}
              {guide.images && guide.images[0] && (
                <img
                  src={guide.images[0].url}
                  alt={guide.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              {/* Guide Details */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xl font-semibold text-gray-900">{guide.name}</h4>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {guide.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Max {guide.maxCapacity} participants
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {guide.rating?.average || 'N/A'} ({guide.rating?.count || 0} reviews)
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span>{formatPrice(guide.dailyRate, guide.currency)}</span>
                  </div>
                  {duration > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{duration} day{duration > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span>{bookingData.participants}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-blue-600">{formatPrice(totalPrice, guide.currency)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Specialties */}
              {guide.specialties && guide.specialties.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideBookingPage;
