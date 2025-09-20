import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  Eye,
  MessageSquare,
  BarChart3,
  Settings,
  Hotel,
  UserCheck,
  XCircle,
  Plus,
  Search,
  Activity,
  Headphones,
  Bed,
  Star,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import hotelService from '../../services/hotelService';
import bookingService from '../../services/bookingService';
import HotelOwnerLayout from '../../components/layout/HotelOwnerLayout';
import { toast } from 'react-hot-toast';

const HotelOwnerDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Set active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/hotels')) {
      setActiveTab('hotels');
    } else if (path.includes('/bookings')) {
      setActiveTab('bookings');
    } else if (path.includes('/availability')) {
      setActiveTab('availability');
    } else if (path.includes('/reviews')) {
      setActiveTab('reviews');
    } else if (path.includes('/analytics')) {
      setActiveTab('analytics');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Hotels
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  // Bookings
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  
  // Availability Management
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showManualBookingModal, setShowManualBookingModal] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({
    date: '',
    isAvailable: true,
    reason: '',
    price: ''
  });
  const [manualBookingData, setManualBookingData] = useState({
    date: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomType: '',
    nights: 1,
    totalAmount: '',
    notes: ''
  });
  
  // Statistics
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    occupancyRate: 0,
    averageRating: 0
  });
  
  // Filters and Search
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load hotels
      const hotelsResponse = await hotelService.getMyHotels();
      if (hotelsResponse.success) {
        const hotels = hotelsResponse.hotels || [];
        setHotels(hotels);
        if (hotels.length > 0) {
          setSelectedHotel(hotels[0]);
        }
      }

      // Load bookings
      const bookingsResponse = await bookingService.getMyBookings({ 
        page: 1, 
        limit: 100 
      });
      if (bookingsResponse.success) {
        const bookings = bookingsResponse.bookings || [];
        setBookings(bookings);
        setPendingBookings(bookings.filter(booking => booking.status === 'pending'));
      }

      // Calculate statistics
      const hotelsData = hotelsResponse.success ? (hotelsResponse.hotels || []) : [];
      const bookingsData = bookingsResponse.success ? (bookingsResponse.bookings || []) : [];
      calculateStats(hotelsData, bookingsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (hotelsData, bookingsData) => {
    const totalHotels = hotelsData.length;
    const totalBookings = bookingsData.length;
    const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
    
    const totalRevenue = bookingsData
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    const occupancyRate = totalBookings > 0 ? 
      (bookingsData.filter(b => b.status === 'confirmed').length / totalBookings) * 100 : 0;
    
    const averageRating = hotelsData.length > 0 ? 
      hotelsData.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / hotelsData.length : 0;

    setStats({
      totalHotels,
      totalBookings,
      totalRevenue,
      pendingBookings,
      occupancyRate: Math.round(occupancyRate),
      averageRating: Math.round(averageRating * 10) / 10
    });
  };

  const handleAvailabilityChange = async () => {
    if (!selectedHotel || !availabilityData.date) {
      toast.error('Please select a hotel and date');
      return;
    }

    try {
      const response = await hotelService.updateAvailability(selectedHotel._id, {
        date: availabilityData.date,
        isAvailable: availabilityData.isAvailable,
        reason: availabilityData.reason,
        price: availabilityData.price
      });

      if (response.success) {
        toast.success('Availability updated successfully');
        setShowAvailabilityModal(false);
        setAvailabilityData({ date: '', isAvailable: true, reason: '', price: '' });
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleManualBooking = async () => {
    if (!selectedHotel || !manualBookingData.date || !manualBookingData.guestName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const bookingData = {
        hotel: selectedHotel._id,
        checkIn: manualBookingData.date,
        checkOut: new Date(new Date(manualBookingData.date).getTime() + manualBookingData.nights * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 1,
        roomType: manualBookingData.roomType,
        totalAmount: parseFloat(manualBookingData.totalAmount) || 0,
        guestName: manualBookingData.guestName,
        guestEmail: manualBookingData.guestEmail,
        guestPhone: manualBookingData.guestPhone,
        notes: manualBookingData.notes,
        status: 'confirmed',
        bookingType: 'manual'
      };

      const response = await bookingService.createBooking(bookingData);

      if (response.success) {
        toast.success('Manual booking created successfully');
        setShowManualBookingModal(false);
        setManualBookingData({
          date: '',
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          roomType: '',
          nights: 1,
          totalAmount: '',
          notes: ''
        });
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating manual booking:', error);
      toast.error('Failed to create booking');
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await bookingService.updateBookingStatus(bookingId, { status: action });
      
      if (response.success) {
        toast.success(`Booking ${action} successfully`);
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter functions
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || booking.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <HotelOwnerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Owner Dashboard</h1>
          <p className="text-gray-600">
            Manage your hotels, bookings, and availability
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3, path: '/hotel-owner/dashboard' },
                { id: 'hotels', label: 'My Hotels', icon: Hotel, path: '/hotel-owner/hotels' },
                { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/hotel-owner/bookings' },
                { id: 'availability', label: 'Availability', icon: CalendarIcon, path: '/hotel-owner/availability' },
                { id: 'reviews', label: 'Reviews', icon: Star, path: '/hotel-owner/reviews' }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
              </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHotels}</p>
              </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Hotel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <CalendarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Set Availability</p>
                  <p className="text-sm text-gray-600">Block or open dates</p>
                </button>

                <button
                  onClick={() => setShowManualBookingModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Manual Booking</p>
                  <p className="text-sm text-gray-600">Add walk-in bookings</p>
                </button>

                <Link
                  to="/hotel-owner/add-hotel"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Hotel className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Add Hotel</p>
                  <p className="text-sm text-gray-600">Register new property</p>
                </Link>

                <Link
                  to="/hotel-owner/settings"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-600">Manage account</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Hotels ({hotels.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {hotels.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hotels found. <Link to="/hotel-owner/add-hotel" className="text-blue-600 hover:text-blue-700">Add your first hotel</Link>
                  </div>
                ) : (
                  hotels.map((hotel) => (
                    <div key={hotel._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{hotel.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                              {hotel.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{hotel.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📍 {hotel.location?.city}</span>
                            <span>⭐ {hotel.rating || 'No rating'}</span>
                            <span>💰 ${hotel.pricing?.startingPrice || 'N/A'}/night</span>
                            <span>🛏️ {hotel.rooms?.length || 0} rooms</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bookings ({filteredBookings.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No bookings found
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{booking.guestName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{booking.guestEmail}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📅 {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                            <span>👥 {booking.guests} guests</span>
                            <span>💰 ${booking.totalAmount}</span>
                            <span>🛏️ {booking.roomType}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking._id, 'confirmed')}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking._id, 'cancelled')}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                          <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Availability Management</h3>
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Set Availability
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your hotel availability by blocking dates or setting special pricing.
              </p>
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No availability settings configured yet.</p>
                <p className="text-sm">Click "Set Availability" to get started.</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Reviews</h3>
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No reviews yet.</p>
                <p className="text-sm">Reviews from guests will appear here.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Set Availability</h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                      <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hotel
                  </label>
                  <select
                    value={selectedHotel?._id || ''}
                    onChange={(e) => {
                      const hotel = hotels.find(h => h._id === e.target.value);
                      setSelectedHotel(hotel);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map(hotel => (
                      <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                    ))}
                  </select>
                      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={availabilityData.date}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={availabilityData.isAvailable}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Available</option>
                    <option value="false">Blocked</option>
                  </select>
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={availabilityData.reason}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Maintenance, Special event"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={availabilityData.price}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Override default price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAvailabilityChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Modal */}
      {showManualBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Manual Booking</h3>
              <button
                onClick={() => setShowManualBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hotel
                  </label>
                  <select
                    value={selectedHotel?._id || ''}
                    onChange={(e) => {
                      const hotel = hotels.find(h => h._id === e.target.value);
                      setSelectedHotel(hotel);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map(hotel => (
                      <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={manualBookingData.date}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Nights *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualBookingData.nights}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, nights: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={manualBookingData.guestName}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, guestName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    value={manualBookingData.guestEmail}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, guestEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Phone
                  </label>
                  <input
                    type="tel"
                    value={manualBookingData.guestPhone}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, guestPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <input
                    type="text"
                    value={manualBookingData.roomType}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, roomType: e.target.value }))}
                    placeholder="e.g., Standard Room, Suite"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualBookingData.totalAmount}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={manualBookingData.notes}
                    onChange={(e) => setManualBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about this booking"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowManualBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualBooking}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </HotelOwnerLayout>
  );
};

export default HotelOwnerDashboard;