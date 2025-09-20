import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BookingForm from '../../components/booking/BookingForm';
import hotelService from '../../services/hotelService';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelAndRoom = async () => {
      try {
        setLoading(true);
        
        // Extract hotelId and roomId from the URL parameter
        // Expected format: /booking/hotelId:roomId
        const [hotelId, roomId] = id.split(':');
        
        if (!hotelId || !roomId) {
          throw new Error('Invalid booking URL. Please select a room from the hotel page.');
        }

        // Fetch hotel data (which includes embedded rooms)
        const hotelResponse = await hotelService.getHotelById(hotelId);

        if (hotelResponse.success) {
          const hotelData = hotelResponse.data.hotel;
          setHotel(hotelData);
          
          // Find the specific room within the hotel's rooms array
          const selectedRoom = hotelData.rooms?.find(r => r._id === roomId);
          
          if (selectedRoom) {
            setRoom(selectedRoom);
          } else {
            throw new Error('Room not found in this hotel');
          }
        } else {
          throw new Error('Failed to load hotel information');
        }
      } catch (error) {
        console.error('Error fetching hotel/room:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotelAndRoom();
    }
  }, [id]);

  const handleBookingSuccess = (booking) => {
    toast.success('Booking created successfully!');
    // Navigate to payment page or booking confirmation
    navigate(`/payment/${booking._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading booking information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-800 mb-4">Booking Error</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/hotels')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Hotels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel or Room Not Found</h1>
            <p className="text-gray-600 mb-6">The requested hotel or room could not be found.</p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📅 Book Your Stay
            </h1>
            <p className="text-lg text-gray-600">
              Complete your booking for {hotel.name}
            </p>
          </div>

          {/* Hotel Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-4">
              {hotel.images && hotel.images[0] && (
                <img
                  src={hotel.images[0].url}
                  alt={hotel.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
                <p className="text-gray-600">{hotel.location}</p>
                {hotel.starRating && (
                  <div className="flex items-center mt-2">
                    {[...Array(hotel.starRating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{hotel.starRating} stars</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BookingForm
                hotel={hotel}
                room={room}
                onBookingSuccess={handleBookingSuccess}
              />
            </div>
            
            {/* Room Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
                
                {room.images && room.images[0] && (
                  <img
                    src={room.images[0].url}
                    alt={room.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                <h4 className="font-medium text-gray-900 mb-2">{room.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Room Type:</span>
                    <span className="font-medium">{room.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">{room.capacity} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per night:</span>
                    <span className="font-medium text-blue-600">
                      {room.currency} {room.price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Rooms:</span>
                    <span className="font-medium text-green-600">
                      {room.availableRooms} of {room.totalRooms}
                    </span>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Amenities</h5>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {amenity.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Availability Status */}
                <div className="mt-4 p-3 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`text-sm font-medium ${
                      room.isAvailable && room.availableRooms > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {room.isAvailable && room.availableRooms > 0 ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  {room.occupancyRate !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Occupancy Rate</span>
                        <span>{room.occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${room.occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
