import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const HotelOwnerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userData = authService.getCurrentUserFromStorage();
    setUser(userData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Owner Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}! Manage your properties and bookings.</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/hotels/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Hotel
              </Link>
              <Link
                to="/profile"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl">🏨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-green-600 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-purple-600 text-xl">💳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">LKR 125,000</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <Link
                to="/bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Luxury Beach Resort</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Confirmed
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dec 15-18, 2024 • 2 guests</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Room 201</span>
                  <span className="font-medium text-green-600">LKR 15,000</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">City Center Hotel</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Checked In
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dec 12-15, 2024 • 1 guest</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Room 105</span>
                  <span className="font-medium text-green-600">LKR 8,000</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Mountain View Lodge</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dec 20-22, 2024 • 4 guests</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Suite A</span>
                  <span className="font-medium text-green-600">LKR 25,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Overview</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Luxury Beach Resort</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Available
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Colombo, Sri Lanka</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>5 rooms available</span>
                  <span className="font-medium text-blue-600">LKR 15,000/night</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">City Center Hotel</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Limited
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Kandy, Sri Lanka</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>2 rooms available</span>
                  <span className="font-medium text-blue-600">LKR 8,000/night</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Mountain View Lodge</h3>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Booked
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Nuwara Eliya, Sri Lanka</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>0 rooms available</span>
                  <span className="font-medium text-blue-600">LKR 25,000/night</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/hotels/add"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <h3 className="font-medium text-gray-900">Add Property</h3>
                <p className="text-sm text-gray-600">List new hotel</p>
              </div>
            </Link>

            <Link
              to="/bookings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <h3 className="font-medium text-gray-900">Manage Bookings</h3>
                <p className="text-sm text-gray-600">View all reservations</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Performance insights</p>
              </div>
            </Link>

            <Link
              to="/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <h3 className="font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Configure properties</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelOwnerDashboard;
