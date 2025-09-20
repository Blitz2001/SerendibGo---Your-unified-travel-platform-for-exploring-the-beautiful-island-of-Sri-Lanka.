import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const GuideNavigation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/guide/dashboard',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      name: 'Bookings',
      href: '/guide/bookings',
      icon: Calendar,
      description: 'Manage your bookings'
    },
    {
      name: 'Profile',
      href: '/guide/profile',
      icon: UserCheck,
      description: 'Manage your profile'
    },
    {
      name: 'Earnings',
      href: '/guide/earnings',
      icon: DollarSign,
      description: 'View your earnings'
    },
    {
      name: 'Reviews',
      href: '/guide/reviews',
      icon: Star,
      description: 'Manage reviews'
    },
    {
      name: 'Analytics',
      href: '/guide/analytics',
      icon: BarChart3,
      description: 'View analytics'
    },
    {
      name: 'Settings',
      href: '/guide/settings',
      icon: Settings,
      description: 'Guide settings and preferences'
    }
  ];

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'pending':
        return Clock;
      case 'new':
        return CheckCircle;
      case 'urgent':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SerendibGo</h1>
              <p className="text-xs text-gray-500">Guide Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const BadgeIcon = item.badge ? getBadgeIcon(item.badge) : null;
            const isItemActive = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isItemActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(item.badge)}`}>
                    {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Guide Info & Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Guide</p>
              <p className="text-xs text-gray-500">SerendibGo Guide</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SerendibGo</h1>
              <p className="text-xs text-gray-500">Guide Portal</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const BadgeIcon = item.badge ? getBadgeIcon(item.badge) : null;
                const isItemActive = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isItemActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isItemActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(item.badge)}`}>
                            {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
              
              {/* Mobile Logout */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GuideNavigation;
