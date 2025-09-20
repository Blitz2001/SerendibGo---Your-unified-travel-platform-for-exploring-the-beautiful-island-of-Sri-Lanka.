import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import bookingService from '../../services/bookingService';
import tourBookingService from '../../services/tourBookingService';
import vehicleBookingService from '../../services/vehicleBookingService';
import guideBookingService from '../../services/guideBookingService';
import vehicleRentalService from '../../services/vehicleRentalService';


const MyBookingsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [vehicleRentals, setVehicleRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels', 'tours', 'vehicles', 'guides', or 'rentals'

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      // Load hotel bookings
      const hotelResponse = await bookingService.getMyBookings(params);
      
      // Load tour bookings
      const tourResponse = await tourBookingService.getMyTourBookings(params);
      
      // Load vehicle bookings
      const vehicleResponse = await vehicleBookingService.getMyVehicleBookings(params);
      
      // Load guide bookings
      const guideResponse = await guideBookingService.getMyGuideBookings(params);
      
      // Load vehicle rentals
      const rentalResponse = await vehicleRentalService.getMyRentals(params);
      
      if (hotelResponse.success) {
          setBookings(hotelResponse.data?.bookings || []);
          setTotalPages(hotelResponse.data?.pagination?.totalPages || 1);
        } else {
          setBookings([]);
        }
        
        if (tourResponse.success) {
          setTourBookings(tourResponse.data?.bookings || []);
        } else {
          setTourBookings([]);
        }

        if (vehicleResponse.success) {
          setVehicleBookings(vehicleResponse.data?.bookings || []);
        } else {
          setVehicleBookings([]);
        }

        if (guideResponse.success) {
          setGuideBookings(guideResponse.data?.bookings || []);
        } else {
          setGuideBookings([]);
        }

        if (rentalResponse.success) {
          setVehicleRentals(rentalResponse.data?.rentals || []);
        } else {
          setVehicleRentals([]);
        }
      
      if (!hotelResponse.success && !tourResponse.success && !vehicleResponse.success && !guideResponse.success && !rentalResponse.success) {
        setError('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, currentPage]);

  // Load bookings when component mounts or filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, selectedStatus, currentPage, loadBookings]);

  // Calculate stats when bookings change
  useEffect(() => {
    if (bookings.length > 0 || tourBookings.length > 0 || vehicleBookings.length > 0 || guideBookings.length > 0 || vehicleRentals.length > 0) {
      const hotelStats = bookingService.getBookingStats(bookings);
      const tourStats = tourBookingService.getBookingStats(tourBookings);
      const vehicleStats = vehicleBookingService.getBookingStats(vehicleBookings);
      const guideStats = guideBookingService.getBookingStats(guideBookings);
      
      // Calculate rental stats manually since we don't have a service method yet
      const rentalStats = {
        total: vehicleRentals.length,
        pending: vehicleRentals.filter(r => r.status === 'pending').length,
        confirmed: vehicleRentals.filter(r => r.status === 'confirmed').length,
        active: vehicleRentals.filter(r => r.status === 'active').length,
        completed: vehicleRentals.filter(r => r.status === 'completed').length,
        cancelled: vehicleRentals.filter(r => r.status === 'cancelled').length,
        totalAmount: vehicleRentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0)
      };
      
      // Combine stats
      setStats({
        total: hotelStats.total + tourStats.total + vehicleStats.total + guideStats.total + rentalStats.total,
        pending: hotelStats.pending + tourStats.pending + vehicleStats.pending + guideStats.pending + rentalStats.pending,
        confirmed: hotelStats.confirmed + tourStats.confirmed + vehicleStats.confirmed + guideStats.confirmed + rentalStats.confirmed,
        checked_in: hotelStats.checked_in || 0,
        checked_out: hotelStats.checked_out || 0,
        in_progress: (tourStats.in_progress || 0) + (guideStats.in_progress || 0) + rentalStats.active,
        completed: (hotelStats.completed || 0) + (tourStats.completed || 0) + (vehicleStats.completed || 0) + (guideStats.completed || 0) + rentalStats.completed,
        cancelled: hotelStats.cancelled + tourStats.cancelled + vehicleStats.cancelled + guideStats.cancelled + rentalStats.cancelled,
        totalAmount: hotelStats.totalAmount + tourStats.totalAmount + vehicleStats.totalAmount + guideStats.totalAmount + rentalStats.totalAmount
      });
    }
  }, [bookings, tourBookings, vehicleBookings, guideBookings, vehicleRentals]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCancelBooking = async (bookingId, cancellationReason) => {
    try {
      const response = await bookingService.cancelBooking(bookingId, cancellationReason);
      
      if (response.success) {
        toast.success('Booking cancelled successfully');
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString() || '0'}`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const paymentColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    return paymentColors[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
            <p className="text-gray-600 mb-8">Please log in to view your bookings</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && bookings.length === 0 && tourBookings.length === 0 && vehicleBookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and track your hotel reservations</p>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(stats.totalAmount)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Booking Type Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('hotels')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hotels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Hotel Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('tours')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tours'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tour Bookings ({tourBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vehicles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vehicle Bookings ({vehicleBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('guides')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guides'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Guide Bookings ({guideBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('rentals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rentals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vehicle Rentals ({vehicleRentals.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadBookings}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : activeTab === 'hotels' && bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No hotel bookings found</p>
            <p className="text-gray-400 mb-6">
              {selectedStatus 
                ? `You don't have any ${selectedStatus} hotel bookings.` 
                : "You haven't made any hotel bookings yet."
              }
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Hotels
            </button>
          </div>
        ) : activeTab === 'tours' && tourBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No tour bookings found</p>
            <p className="text-gray-400 mb-6">
              {selectedStatus 
                ? `You don't have any ${selectedStatus} tour bookings.` 
                : "You haven't made any tour bookings yet."
              }
            </p>
            <button
              onClick={() => navigate('/tours')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Tours
            </button>
          </div>
        ) : activeTab === 'vehicles' && vehicleBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No vehicle bookings found</p>
            <p className="text-gray-400 mb-6">
              {selectedStatus 
                ? `You don't have any ${selectedStatus} vehicle bookings.` 
                : "You haven't made any vehicle bookings yet."
              }
            </p>
            <button
              onClick={() => navigate('/vehicles')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Vehicles
            </button>
          </div>
        ) : activeTab === 'hotels' && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Hotel Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      {booking.hotel?.images?.[0] && (
                        <img
                          src={booking.hotel.images[0].url}
                          alt={booking.hotel.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.hotel?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {booking.hotel?.location?.address?.city}, {booking.hotel?.location?.address?.state}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>⭐ {booking.hotel?.starRating || 'N/A'}</span>
                          <span>🏨 {booking.room?.name || 'Room'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex flex-col lg:items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {bookingService.formatStatus(booking.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {bookingService.formatPaymentStatus(booking.paymentStatus)}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(booking.totalAmount, booking.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.nights || 0} nights
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates and Guests */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-medium">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-medium">{formatDate(booking.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-medium">
                        {booking.guests?.adults || 0} adults, {booking.guests?.children || 0} children
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/bookings/${booking._id}`)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                    
                    {booking.status === 'confirmed' && bookingService.canBeCancelled(booking) && (
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for cancellation:');
                          if (reason) {
                            handleCancelBooking(booking._id, reason);
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {booking.specialRequests && (
                      <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        Special requests included
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Tour Bookings Display */}
        {activeTab === 'tours' && (
          <div className="space-y-4">
            {tourBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg mb-4">No tour bookings found</p>
                <p className="text-gray-400 mb-6">
                  {selectedStatus ? `You don't have any ${selectedStatus} tour bookings.` : "You haven't made any tour bookings yet."}
                </p>
                <button
                  onClick={() => navigate('/tours')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Tours
                </button>
              </div>
            ) : (
              tourBookings.map((tourBooking) => (
                <div key={tourBooking._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Tour Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start space-x-4">
                        {tourBooking.tour?.images?.[0] && (
                          <img
                            src={tourBooking.tour.images[0].url}
                            alt={tourBooking.tour.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {tourBooking.tour?.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {tourBooking.tour?.location}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>🗺️ {tourBooking.tour?.duration} day{tourBooking.tour?.duration > 1 ? 's' : ''}</span>
                            <span>👥 {tourBooking.participants} participant{tourBooking.participants > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex flex-col lg:items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tourBookingService.getStatusColor(tourBooking.status)}`}>
                          {tourBookingService.formatStatus(tourBooking.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tourBookingService.getPaymentStatusColor(tourBooking.paymentStatus)}`}>
                          {tourBookingService.formatPaymentStatus(tourBooking.paymentStatus)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(tourBooking.totalAmount, tourBooking.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {tourBooking.participants} participant{tourBooking.participants > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">{formatDate(tourBooking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">{formatDate(tourBooking.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/tours/${tourBooking.tour._id}`)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View Tour
                      </button>
                      
                      {tourBooking.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              // TODO: Implement tour booking cancellation
                              toast.error('Tour cancellation not yet implemented');
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {tourBooking.specialRequests && (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          Special requests included
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

                 {/* Vehicle Bookings Display */}
         {activeTab === 'vehicles' && (
           <div className="space-y-4">
            
            {vehicleBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg mb-4">No vehicle bookings found</p>
                <p className="text-gray-400 mb-6">
                  {selectedStatus ? `You don't have any ${selectedStatus} vehicle bookings.` : "You haven't made any vehicle bookings yet."}
                </p>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Vehicles
                </button>
              </div>
            ) : (
              vehicleBookings.map((vehicleBooking) => (
                <div key={vehicleBooking._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Vehicle Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start space-x-4">
                        {vehicleBooking.vehicle?.images?.[0] && (
                          <img
                            src={vehicleBooking.vehicle.images[0].url}
                            alt={vehicleBooking.vehicle.make}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                                                 <div>
                           <h3 className="text-lg font-semibold text-gray-900 mb-1">
                             {vehicleBooking.vehicle?.brand} {vehicleBooking.vehicle?.model}
                           </h3>
                           <p className="text-sm text-gray-600 mb-2">
                             {vehicleBooking.vehicle?.year} • {vehicleBooking.vehicle?.capacity} passengers
                           </p>
                           <div className="flex items-center space-x-4 text-sm text-gray-500">
                             <span>🚗 {vehicleBooking.vehicle?.type}</span>
                             <span>👥 {vehicleBooking.guests} passenger{vehicleBooking.guests > 1 ? 's' : ''}</span>
                           </div>
                         </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex flex-col lg:items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicleBookingService.getStatusColor(vehicleBooking.status)}`}>
                          {vehicleBookingService.formatStatus(vehicleBooking.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicleBookingService.getPaymentStatusColor(vehicleBooking.paymentStatus)}`}>
                          {vehicleBookingService.formatPaymentStatus(vehicleBooking.paymentStatus)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(vehicleBooking.totalAmount, vehicleBooking.currency)}
                        </p>
                                                 <p className="text-sm text-gray-600">
                           {vehicleBooking.guests} passenger{vehicleBooking.guests > 1 ? 's' : ''}
                         </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div>
                         <p className="text-sm text-gray-600">Check-in Date</p>
                         <p className="font-medium">{formatDate(vehicleBooking.checkIn)}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-600">Check-out Date</p>
                         <p className="font-medium">{formatDate(vehicleBooking.checkOut)}</p>
                       </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/vehicles/${vehicleBooking.vehicle._id}`)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View Vehicle
                      </button>
                      
                      {vehicleBooking.status === 'confirmed' && (
                        <button
                          onClick={async () => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`/api/vehicle-bookings/${vehicleBooking._id}/cancel`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ reason }),
                                });

                                if (response.ok) {
                                  toast.success('Vehicle booking cancelled successfully');
                                  // Refresh the page or update the booking status
                                  window.location.reload();
                                } else {
                                  const errorData = await response.json();
                                  toast.error(errorData.message || 'Failed to cancel booking');
                                }
                              } catch (error) {
                                console.error('Cancellation error:', error);
                                toast.error('Failed to cancel booking');
                              }
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {vehicleBooking.specialRequests && (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          Special requests included
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Guide Bookings Tab */}
        {activeTab === 'guides' && (
          <div className="space-y-4">
            {guideBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg mb-4">No guide bookings found</p>
                <p className="text-gray-400 mb-6">
                  {selectedStatus ? `You don't have any ${selectedStatus} guide bookings.` : "You haven't made any guide bookings yet."}
                </p>
                <button
                  onClick={() => navigate('/guides')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Guides
                </button>
              </div>
            ) : (
              guideBookings.map((guideBooking) => (
                <div key={guideBooking._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Guide Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start space-x-4">
                        {guideBooking.guide?.images?.[0] && (
                          <img
                            src={guideBooking.guide.images[0].url}
                            alt={guideBooking.guide.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {guideBooking.guide?.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {guideBooking.guide?.location} • {guideBooking.tourType} tour
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>👥 {guideBooking.participants} participant{guideBooking.participants > 1 ? 's' : ''}</span>
                            <span>⭐ {guideBooking.guide?.rating?.average || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex flex-col lg:items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${guideBookingService.getStatusColor(guideBooking.status)}`}>
                          {guideBookingService.formatStatus(guideBooking.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${guideBookingService.getPaymentStatusColor(guideBooking.paymentStatus)}`}>
                          {guideBookingService.formatPaymentStatus(guideBooking.paymentStatus)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(guideBooking.totalAmount, guideBooking.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {guideBooking.participants} participant{guideBooking.participants > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">{formatDate(guideBooking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">{formatDate(guideBooking.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/guides/${guideBooking.guide._id}`)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View Guide
                      </button>
                      
                      {guideBooking.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              // TODO: Implement guide booking cancellation
                              toast.error('Guide cancellation not yet implemented');
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {guideBooking.specialRequests && (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          Special requests included
                        </span>
                      )}

                      {guideBooking.meetingPoint && (
                        <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Meeting point: {guideBooking.meetingPoint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Vehicle Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            {vehicleRentals.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg mb-4">No vehicle rentals found</p>
                <p className="text-gray-400 mb-6">
                  {selectedStatus 
                    ? `You don't have any ${selectedStatus} vehicle rentals.` 
                    : 'You haven\'t rented any vehicles yet.'
                  }
                </p>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Vehicles
                </button>
              </div>
            ) : (
              vehicleRentals.map((rental) => (
                <div key={rental._id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={rental.vehicle?.images?.[0] || '/placeholder-vehicle.jpg'}
                        alt={`${rental.vehicle?.brand} ${rental.vehicle?.model}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rental.vehicle?.brand} {rental.vehicle?.model}
                        </h3>
                        <p className="text-gray-600">
                          {rental.vehicle?.year} • {rental.vehicle?.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rental ID: {rental._id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rental.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        rental.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        rental.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        rental.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rental.status?.charAt(0).toUpperCase() + rental.status?.slice(1)}
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        {rental.currency} {rental.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Rental Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {rental.rentalType} rental
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-gray-900">
                        {rental.rentalDuration} {rental.rentalType === 'hourly' ? 'hours' : 'days'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-medium text-gray-900">
                        {rental.guests} {rental.guests === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(rental.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate(`/vehicles/${rental.vehicle?._id}`)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View Vehicle
                      </button>
                      
                      {rental.status === 'confirmed' && (
                        <button
                          onClick={async () => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`/api/vehicle-rentals/${rental._id}/cancel`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ reason }),
                                });

                                if (response.ok) {
                                  toast.success('Vehicle rental cancelled successfully');
                                  window.location.reload();
                                } else {
                                  const errorData = await response.json();
                                  toast.error(errorData.message || 'Failed to cancel rental');
                                }
                              } catch (error) {
                                console.error('Cancellation error:', error);
                                toast.error('Failed to cancel rental');
                              }
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Cancel Rental
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {rental.paymentMethod && (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {rental.paymentMethod.replace('_', ' ')}
                        </span>
                      )}
                      {rental.specialRequests && (
                        <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          Special requests
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
