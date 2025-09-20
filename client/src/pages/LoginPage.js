import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            🏝️ SerendibGo
          </Link>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>

        {/* Sample Credentials */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Login Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Admin User</h4>
                <p className="text-sm text-blue-700">admin@serendibgo.com</p>
                <p className="text-sm text-blue-700">Password: admin123</p>
                <p className="text-xs text-blue-600 mt-1">Access: Admin Dashboard</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Staff Member</h4>
                <p className="text-sm text-green-700">staff@serendibgo.com</p>
                <p className="text-sm text-green-700">Password: staff123</p>
                <p className="text-xs text-green-600 mt-1">Access: Staff Dashboard</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Hotel Owner</h4>
                <p className="text-sm text-purple-700">hotelowner@serendibgo.com</p>
                <p className="text-sm text-purple-700">Password: hotel123</p>
                <p className="text-xs text-purple-600 mt-1">Access: Hotel Owner Dashboard</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900">Tour Guide</h4>
                <p className="text-sm text-orange-700">guide@serendibgo.com</p>
                <p className="text-sm text-orange-700">Password: guide123</p>
                <p className="text-xs text-orange-600 mt-1">Access: Guide Dashboard</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Regular Customer</h4>
                <p className="text-sm text-gray-700">customer@serendibgo.com</p>
                <p className="text-sm text-gray-700">Password: customer123</p>
                <p className="text-xs text-gray-600 mt-1">Access: Home Page</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
