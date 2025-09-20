import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'vehicle_owner':
      return <Navigate to="/vehicle-owner/dashboard" replace />;
    case 'hotel_owner':
      return <Navigate to="/hotel-owner/dashboard" replace />;
    case 'guide':
      return <Navigate to="/guide/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRouter;