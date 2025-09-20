import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [], fallbackPath = '/' }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // If user doesn't have required role, redirect to appropriate dashboard
  const getDefaultPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'hotel_owner':
        return '/hotel-owner/dashboard';
      case 'vehicle_owner':
        return '/vehicle-owner/dashboard';
      case 'guide':
        return '/guide/dashboard';
      default:
        return '/';
    }
  };

  return <Navigate to={getDefaultPath(user?.role) || fallbackPath} replace />;
};

export default RoleBasedRoute;
