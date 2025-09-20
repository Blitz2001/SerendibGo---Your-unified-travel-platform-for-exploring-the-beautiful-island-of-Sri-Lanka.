import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated via token
      if (authService.isAuthenticated()) {
        // Get user from localStorage
        const storedUser = authService.getCurrentUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Try to get current user from API
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            authService.updateUserInStorage(response.data.user);
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid authentication
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const credentials = { email, password };
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
