import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUserFromStorage();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, redirect to unauthorized page
  if (requiredRole && currentUser && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and role requirements met, render children
  return children;
};

export default ProtectedRoute;
