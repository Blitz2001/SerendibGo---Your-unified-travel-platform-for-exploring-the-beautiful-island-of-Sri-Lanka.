import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, isAuthenticated, logout } = useAuth();
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

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              🏝️ SerendibGo
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`transition-colors ${
                isActiveRoute('/') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/tours" 
              className={`transition-colors ${
                isActiveRoute('/tours') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Tours
            </Link>
            <Link 
              to="/hotels" 
              className={`transition-colors ${
                isActiveRoute('/hotels') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Hotels
            </Link>
            <Link 
              to="/vehicles" 
              className={`transition-colors ${
                isActiveRoute('/vehicles') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Vehicles
            </Link>
            <Link 
              to="/plan-trip" 
              className={`transition-colors ${
                isActiveRoute('/plan-trip') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Plan Trip
            </Link>
            <Link 
              to="/support/contact" 
              className={`transition-colors ${
                isActiveRoute('/support') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Support
            </Link>
            {isAuthenticated && (
              <Link 
                to="/bookings" 
                className={`transition-colors ${
                  isActiveRoute('/bookings') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                My Bookings
              </Link>
            )}
            {isAuthenticated && currentUser?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className={`transition-colors ${
                  isActiveRoute('/admin') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Admin
              </Link>
            )}
            {isAuthenticated && currentUser?.role === 'staff' && (
              <Link 
                to="/staff/dashboard" 
                className={`transition-colors ${
                  isActiveRoute('/staff') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Staff
              </Link>
            )}
            {isAuthenticated && currentUser?.role === 'hotel_owner' && (
              <Link 
                to="/hotel-owner/dashboard" 
                className={`transition-colors ${
                  isActiveRoute('/hotel-owner') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                My Hotels
              </Link>
            )}
                  {isAuthenticated && currentUser?.role === 'guide' && (
                    <Link
                      to="/guide/dashboard"
                      className={`transition-colors ${
                        isActiveRoute('/guide')
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      My Services
                    </Link>
                  )}
                  <Link
                    to="/guides"
                    className={`transition-colors ${
                      isActiveRoute('/guides')
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Guides
                  </Link>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className={`transition-colors ${
                        isActiveRoute('/login')
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Login
                    </Link>
                  )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block">{currentUser?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest User Buttons */
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden px-4 pb-4">
        <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Menu
        </button>
      </div>
    </header>
  );
};

export default Header;
