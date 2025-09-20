import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, allow access (will be handled by ProtectedRoute if needed)
  if (!isAuthenticated) {
    return children;
  }

  // If user is a guide, hotel_owner, vehicle_owner, staff, or admin, redirect to their dashboard
  if (user && ['guide', 'hotel_owner', 'vehicle_owner', 'staff', 'admin'].includes(user.role)) {
    const getDashboardPath = (role) => {
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
          return '/dashboard';
      }
    };
    
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // Allow access for regular users (role: 'user')
  return children;
};

export default UserOnlyRoute;
