import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import hotelService from '../../services/hotelService';
import BookingForm from '../../components/booking/BookingForm';

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load hotel data
  const loadHotel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading hotel with ID:', id);
      const response = await hotelService.getHotelById(id);
      console.log('Hotel API response:', response);
      
      if (response.success) {
        setHotel(response.data.hotel);
        if (response.data.hotel.images && response.data.hotel.images.length > 0) {
          setSelectedImage(0);
        }
      } else {
        setError(response.message || 'Failed to load hotel details');
      }
    } catch (err) {
      console.error('Load hotel error:', err);
      setError(`Error loading hotel details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHotel();
  }, [loadHotel]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Hotel not found'}</p>
          <button
            onClick={() => navigate('/hotels')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Hotels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={() => navigate('/hotels')} className="hover:text-blue-600">
              Hotels
            </button>
            <span>/</span>
            <span className="text-gray-900">{hotel.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hotel Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="relative h-96">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[selectedImage].url}
                    alt={hotel.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500">No Images Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hotel Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{hotel.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-1">📍</span>
                      {hotel.location?.address?.city}, {hotel.location?.address?.state}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      {hotel.starRating} Stars
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {hotel.category?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {hotel.averageRoomPrice ? `LKR ${hotel.averageRoomPrice.toLocaleString()}` : 'Price on request'}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{hotel.description}</p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                                 <button
                   onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                   className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                 >
                   Book Now
                 </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Contact Hotel
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'rooms', label: 'Rooms & Rates' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">About This Hotel</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{hotel.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Highlights</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• {hotel.starRating}-star luxury accommodation</li>
                          <li>• Located in {hotel.location?.address?.city}</li>
                          <li>• {hotel.amenities?.length || 0} premium amenities</li>
                          <li>• {hotel.rooms?.length || 0} room types available</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-2">📞</span>
                            {hotel.contact?.phone}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">✉️</span>
                            {hotel.contact?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Rooms</h3>
                    {hotel.rooms && hotel.rooms.length > 0 ? (
                      <div className="space-y-4">
                        {hotel.rooms.map(room => (
                          <div key={room._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{room.name}</h4>
                                <p className="text-sm text-gray-600">{room.type} • {room.capacity} guests</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                  LKR {room.price.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">per night</div>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{room.description}</p>
                            
                            {/* Room Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities.slice(0, 6).map((amenity, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                    >
                                      {amenity.replace('_', ' ')}
                                    </span>
                                  ))}
                                  {room.amenities.length > 6 && (
                                    <span className="text-gray-500 text-xs">
                                      +{room.amenities.length - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Room Status and Booking Button */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className={`w-2 h-2 rounded-full ${
                                    room.isAvailable && room.availableRooms > 0 
                                      ? 'bg-green-500' 
                                      : 'bg-red-500'
                                  }`}></span>
                                  <span className={room.isAvailable && room.availableRooms > 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                  }>
                                    {room.isAvailable && room.availableRooms > 0 
                                      ? `${room.availableRooms} available` 
                                      : 'Not available'
                                    }
                                  </span>
                                </div>
                                {room.occupancyRate !== undefined && (
                                  <span className="text-gray-500">
                                    {room.occupancyRate}% occupied
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => navigate(`/booking/${hotel._id}:${room._id}`)}
                                disabled={!room.isAvailable || room.availableRooms === 0}
                                className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
                                  room.isAvailable && room.availableRooms > 0
                                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {room.isAvailable && room.availableRooms > 0 ? 'Book Now' : 'Not Available'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No room information available.</p>
                    )}
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab === 'amenities' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Hotel Amenities</h3>
                    {hotel.amenities && hotel.amenities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotel.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">✓</span>
                            </div>
                            <span className="text-gray-700">{hotelService.formatAmenityName(amenity)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No amenities information available.</p>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Guest Reviews</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          <span className="ml-1 font-semibold">{hotel.rating?.average?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-gray-500">({hotel.rating?.count || 0} reviews)</span>
                      </div>
                    </div>
                    
                    {hotel.rating?.reviews && hotel.rating.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {hotel.rating.reviews.slice(0, 5).map((review, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-sm font-medium">
                                    {review.user?.name?.charAt(0) || 'G'}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-800">{review.user?.name || 'Guest'}</span>
                              </div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-lg ${
                                      i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No reviews yet. Be the first to review this hotel!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Room Selection and Booking */}
            <div className="sticky top-4 space-y-6">
              {/* Room Selection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Rooms</h3>
                <div className="space-y-4">
                  {hotel.rooms && hotel.rooms.length > 0 ? (
                    hotel.rooms.map((room) => (
                      <div key={room._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{room.name}</h4>
                          <span className="text-lg font-semibold text-blue-600">
                            {room.currency} {room.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Capacity: {room.capacity} guests</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            room.isAvailable && room.availableRooms > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {room.isAvailable && room.availableRooms > 0 
                              ? `${room.availableRooms} available` 
                              : 'Not available'
                            }
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">No rooms available</p>
                  )}
                </div>
              </div>

                             {/* Booking Form */}
               {hotel.rooms && hotel.rooms.length > 0 && (
                 <div id="booking-form">
                   <BookingForm 
                     hotel={hotel} 
                     room={hotel.rooms[0]} 
                     onBookingSuccess={(booking) => {
                       console.log('Booking successful:', booking);
                       // You can add navigation to bookings page or show success message
                     }}
                   />
                 </div>
               )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📞</span>
                  <span className="text-gray-700">{hotel.contact?.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">✉️</span>
                  <span className="text-gray-700">{hotel.contact?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && hotel.images && hotel.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={hotel.images[selectedImage].url}
              alt={hotel.name}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
            {hotel.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => prev === 0 ? hotel.images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
                >
                  ‹
                </button>
                <button
                  onClick={() => setSelectedImage(prev => prev === hotel.images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailPage;
