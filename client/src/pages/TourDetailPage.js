import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import tourService from '../services/tourService';
import authService from '../services/authService';
import TourBookingModal from '../components/TourBookingModal';
import ContactSupportCard from '../components/support/ContactSupportCard';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const checkAuthStatus = useCallback(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const loadTour = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tourService.getTourById(id);
      if (response.success) {
        setTour(response.data.tour);
      } else {
        setError('Tour not found');
      }
    } catch (err) {
      setError('Failed to load tour details');
      console.error('Error loading tour:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTour();
    checkAuthStatus();
  }, [id, loadTour, checkAuthStatus]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tours/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (bookingData) => {
    setBookingSuccess(bookingData);
    // Refresh tour data to update availability
    loadTour();
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString()}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.easy;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      cultural: '🏛️',
      adventure: '🏔️',
      beach: '🏖️',
      wildlife: '🦁',
      historical: '📜',
      religious: '🙏',
      nature: '🌿',
      food: '🍽️',
      shopping: '🛍️',
      wellness: '🧘'
    };
    return icons[category] || '🗺️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading amazing tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tour Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load tour details'}</p>
          <Link
            to="/tours"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Main Image */}
      <div className="relative h-96 bg-gray-900">
        {tour.images && tour.images.length > 0 ? (
          <img
            src={tour.images[selectedImage]?.url || tour.images[0]?.url}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <span className="text-white text-6xl">{getCategoryIcon(tour.category)}</span>
          </div>
        )}
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            to="/tours"
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all"
          >
            ← Back to Tours
          </Link>
        </div>

        {/* Tour Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getCategoryIcon(tour.category)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(tour.difficulty)}`}>
                {tour.difficulty}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{tour.title}</h1>
            <p className="text-xl text-gray-200">{tour.location}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {tour.images && tour.images.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Photo Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tour.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `Tour image ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                          {image.caption}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tour Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About This Tour</h3>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Tour Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tour Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Itinerary</h3>
                <div className="space-y-6">
                  {tour.itinerary.map((day, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {day.day}
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">{day.title}</h4>
                      </div>
                      <p className="text-gray-700 mb-3">{day.description}</p>
                      
                      {/* Activities */}
                      {day.activities && day.activities.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Activities:</h5>
                          <div className="flex flex-wrap gap-2">
                            {day.activities.map((activity, actIndex) => (
                              <span
                                key={actIndex}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meals */}
                      {day.meals && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Meals:</h5>
                          <div className="text-sm text-gray-700">
                            {Object.entries(day.meals).map(([mealType, included]) => (
                              <span key={mealType} className="inline-block mr-3">
                                {included ? `✓ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}` : `✗ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accommodation */}
                      {day.accommodation && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Accommodation:</h5>
                          <span className="text-sm text-gray-700">{day.accommodation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-green-600">What's Included</h3>
                {tour.inclusions && tour.inclusions.length > 0 ? (
                  <ul className="space-y-2">
                    {tour.inclusions.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No inclusions listed</p>
                )}
              </div>

              {/* Exclusions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-red-600">What's Not Included</h3>
                {tour.exclusions && tour.exclusions.length > 0 ? (
                  <ul className="space-y-2">
                    {tour.exclusions.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No exclusions listed</p>
                )}
              </div>
            </div>

            {/* Requirements */}
            {tour.requirements && tour.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                <div className="space-y-2">
                  {tour.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {tour.cancellationPolicy && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cancellation Policy</h3>
                <p className="text-gray-700">{tour.cancellationPolicy}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Booking & Info */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(tour.price, tour.currency)}
                </div>
                <div className="text-gray-600">per person</div>
              </div>

              {/* Tour Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{tour.duration} day{tour.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium capitalize">{tour.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
                    {tour.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max Participants</span>
                  <span className="font-medium">{tour.maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Slots</span>
                  <span className="font-medium text-green-600">
                    {tour.availableSlots || tour.maxParticipants - (tour.currentParticipants || 0)}
                  </span>
                </div>
              </div>

              {/* Rating */}
              {tour.rating && (
                <div className="border-t pt-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{tour.rating.average}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 text-center">
                    Based on {tour.rating.count} reviews
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                disabled={!tour.isAvailable}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  tour.isAvailable
                    ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {tour.isAvailable ? 'Book Now' : 'Fully Booked'}
              </button>

              {/* Availability Status */}
              {!tour.isAvailable && (
                <p className="text-sm text-red-600 text-center mt-2">
                  This tour is currently fully booked
                </p>
              )}
            </div>

            {/* Guide Information */}
            {tour.guide && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Guide</h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">👤</span>
                  </div>
                  <div className="font-medium text-gray-900">{tour.guide.name}</div>
                  <div className="text-sm text-gray-600">Professional Tour Guide</div>
                  <Link
                    to={`/guides/${tour.guide._id}`}
                    className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                  >
                    View Guide Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Contact Support */}
            <ContactSupportCard 
              tourTitle={tour?.title}
              tourId={tour?._id}
            />
          </div>
        </div>
      </div>

      {/* Tour Booking Modal */}
      <TourBookingModal
        tour={tour}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Booking Success Message */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your tour has been booked successfully. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4 text-left">
              <h5 className="font-medium text-gray-900 mb-2">Booking Details:</h5>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Tour:</span>
                  <span className="font-medium">{tour.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span className="font-medium">{bookingSuccess.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-medium">{new Date(bookingSuccess.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium text-blue-600">
                    {bookingSuccess.currency} {bookingSuccess.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
