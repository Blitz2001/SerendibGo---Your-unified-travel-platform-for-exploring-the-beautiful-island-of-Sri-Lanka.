import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Star, 
  Edit,
  BarChart3,
  Settings,
  MapPin,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const GuideDashboard = () => {
  const [guideProfile, setGuideProfile] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    completedTours: 0,
    upcomingTours: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load guide profile
      const profileResponse = await guideService.getMyProfile();
      if (profileResponse.success) {
        setGuideProfile(profileResponse.data);
      }

      // Load guide bookings for recent display (5 items)
      const recentBookingsResponse = await guideService.getMyGuideBookings({ page: 1, limit: 5 });
      if (recentBookingsResponse.success) {
        setRecentBookings(recentBookingsResponse.data.bookings || []);
      }

      // Load all bookings for stats calculation
      const allBookingsResponse = await guideService.getMyGuideBookings({ page: 1, limit: 1000 });
      if (allBookingsResponse.success) {
        setStats(prev => ({
          ...prev,
          totalBookings: allBookingsResponse.data.pagination?.totalBookings || 0
        }));
        // Calculate stats from all bookings
        calculateStats(allBookingsResponse.data.bookings || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookings) => {
    let totalEarnings = 0;
    let completedTours = 0;
    let upcomingTours = 0;
    let totalRating = 0;
    let ratingCount = 0;

    bookings.forEach(booking => {
      if (booking.status === 'completed') {
        completedTours++;
        if (booking.totalAmount) {
          totalEarnings += booking.totalAmount;
        }
      } else if (booking.status === 'confirmed') {
        upcomingTours++;
      }
      
      if (booking.rating) {
        totalRating += booking.rating;
        ratingCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      totalEarnings,
      completedTours,
      upcomingTours,
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const createGuideProfile = async () => {
    try {
      const response = await guideService.createMyProfile();
      if (response.success) {
        toast.success('Guide profile created successfully!');
        // Reload dashboard data
        loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to create guide profile');
      }
    } catch (error) {
      console.error('Error creating guide profile:', error);
      toast.error('Failed to create guide profile');
    }
  };

  const toggleAvailability = async () => {
    try {
      const currentStatus = guideProfile?.availability?.isAvailable || false;
      const newStatus = !currentStatus;
      
      const response = await guideService.updateAvailability({
        isAvailable: newStatus
      });
      
      if (response.success) {
        toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} for bookings`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <LoadingSkeleton type="stats" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingSkeleton type="card" count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guide Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your guide services and bookings</p>
        </div>

        {/* Profile Status */}
        {guideProfile && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={guideProfile.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                  alt={guideProfile.user?.name || 'Guide'}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{guideProfile.user?.name || 'Guide'}</h2>
                  <p className="text-gray-600">{guideProfile.profile?.specializations?.join(', ') || 'No specializations set'}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {guideProfile.rating?.average || 'No rating yet'} ({guideProfile.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  guideProfile.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {guideProfile.isVerified ? 'Verified Guide' : 'Pending Verification'}
                </span>
                <div className="mt-3">
                  <button
                    onClick={toggleAvailability}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      guideProfile?.availability?.isAvailable 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {guideProfile?.availability?.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {guideProfile.location || guideProfile.services?.locations?.[0]?.city || 'Location not specified'}
                </p>
                {guideProfile.isNewProfile && (
                  <button
                    onClick={createGuideProfile}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Guide Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <Link 
                  to="/guide/bookings" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.tour?.title || 'Custom Tour'}</h3>
                        <p className="text-sm text-gray-600">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Users className="w-3 h-3 inline mr-1" />
                          {booking.participants} participants
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Bookings will appear here once customers book your services</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile Management</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/guide/profile/edit"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Edit Profile</p>
                    <p className="text-sm text-gray-600">Update your information</p>
                  </div>
                </Link>

                <Link
                  to="/guide/services"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <UserCheck className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Services</p>
                    <p className="text-sm text-gray-600">Update your tour offerings</p>
                  </div>
                </Link>

                <Link
                  to="/guide/availability"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Set Availability</p>
                    <p className="text-sm text-gray-600">Manage your schedule</p>
                  </div>
                </Link>

                <Link
                  to="/guide/reviews"
                  className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Star className="w-6 h-6 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Reviews</p>
                    <p className="text-sm text-gray-600">View customer feedback</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/guide/profile/edit"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Edit Profile</p>
                  <p className="text-sm text-gray-600">Update info</p>
                </div>
              </Link>

              <Link
                to="/guide/bookings"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Bookings</p>
                  <p className="text-sm text-gray-600">Manage tours</p>
                </div>
              </Link>

              <Link
                to="/guide/analytics"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View reports</p>
                </div>
              </Link>

              <Link
                to="/guide/settings"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-6 h-6 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-600">Account settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;
