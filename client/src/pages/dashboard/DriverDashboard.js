import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const DriverDashboard = () => {
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
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}! Manage your trips and vehicle.</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/trips"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Trips
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
                <span className="text-blue-600 text-xl">🚗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Trips</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.7</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-purple-600 text-xl">💳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">LKR 3,500</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Trip */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Trip</h2>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Airport Transfer</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  In Progress
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">Pickup: Bandaranaike Airport</p>
                    <p className="text-sm text-gray-600">Terminal 1, Arrival Gate</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-red-600 mr-3">🎯</span>
                  <div>
                    <p className="font-medium text-gray-900">Dropoff: Colombo City Center</p>
                    <p className="text-sm text-gray-600">Fort, Colombo 01</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Passenger: Sarah M.</span>
                  <span className="font-medium text-green-600">LKR 2,500</span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Complete Trip
                </button>
                <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Trips</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">City Tour</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Scheduled
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dec 15, 2024 • 2:00 PM</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>3 passengers</span>
                  <span className="font-medium text-green-600">LKR 1,800</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Hotel Transfer</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Confirmed
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dec 16, 2024 • 9:00 AM</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>2 passengers</span>
                  <span className="font-medium text-green-600">LKR 1,200</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Airport Pickup</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Booked
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dec 17, 2024 • 11:30 AM</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>1 passenger</span>
                  <span className="font-medium text-green-600">LKR 2,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🚗</span>
                <div>
                  <h3 className="font-medium text-gray-900">Toyota Hiace</h3>
                  <p className="text-sm text-gray-600">License: WP-1234</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Level:</span>
                  <span className="font-medium text-green-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Available
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">📱</span>
                <div>
                  <h3 className="font-medium text-gray-900">App Status</h3>
                  <p className="text-sm text-gray-600">Online</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-medium">2 min ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-blue-600">Colombo</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h3 className="font-medium text-gray-900">Today's Summary</h3>
                  <p className="text-sm text-gray-600">Performance</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">45 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Online:</span>
                  <span className="font-medium">6h 30m</span>
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
              to="/trips"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <h3 className="font-medium text-gray-900">View Trips</h3>
                <p className="text-sm text-gray-600">All assignments</p>
              </div>
            </Link>

            <Link
              to="/earnings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">💰</span>
              <div>
                <h3 className="font-medium text-gray-900">Earnings</h3>
                <p className="text-sm text-gray-600">View income</p>
              </div>
            </Link>

            <Link
              to="/schedule"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">📅</span>
              <div>
                <h3 className="font-medium text-gray-900">Schedule</h3>
                <p className="text-sm text-gray-600">Manage availability</p>
              </div>
            </Link>

            <Link
              to="/support"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl mr-3">🆘</span>
              <div>
                <h3 className="font-medium text-gray-900">Support</h3>
                <p className="text-sm text-gray-600">Get help</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
