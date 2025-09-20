import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Settings, 
  LogOut,
  User,
  Bell,
  MessageSquare
} from 'lucide-react';

const GuideHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setShowUserMenu(false);
      navigate('/');
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const guideNavItems = [
    { path: '/guide/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/guide/bookings', label: 'My Bookings', icon: '📅' },
    { path: '/guide/availability', label: 'Availability', icon: '⏰' },
    { path: '/guide/earnings', label: 'Earnings', icon: '💰' },
    { path: '/guide/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/guide/analytics', label: 'Analytics', icon: '📈' },
    { path: '/guide/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/guide/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              🏝️ SerendibGo Guide
            </Link>
          </div>

          {/* Guide Navigation */}
          <nav className="hidden md:flex space-x-6">
            {guideNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Messages */}
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.name || 'Guide'}
                </span>
                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <Link
                    to="/guide/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    My Profile
                  </Link>
                  <Link
                    to="/guide/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t">
          <nav className="flex space-x-1 py-2">
            {guideNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium rounded-md transition-colors ${
                  isActiveRoute(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default GuideHeader;
