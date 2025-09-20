import apiService from './apiService';
import API_CONFIG from '../config/api';

class AuthService {
  // User registration
  async register(userData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // User login
  async login(credentials) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      // Optional: Call logout endpoint if available (before clearing token)
      try {
        await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        // Ignore logout endpoint errors
        console.log('Logout endpoint not available');
      }
      
      // Clear local storage after API call
      apiService.removeAuthToken();
      localStorage.removeItem('user');
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = apiService.getAuthToken();
    return !!token;
  }

  // Get user from localStorage
  getCurrentUserFromStorage() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      return null;
    }
  }

  // Update user in localStorage
  updateUserInStorage(userData) {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error updating user in storage:', error);
    }
  }

  // Get dashboard URL based on user role
  getDashboardUrl(userRole) {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'hotel_owner':
        return '/hotel-owner/dashboard';
      case 'guide':
        return '/guide/dashboard';
      default:
        return '/';
    }
  }

  // Check if token is expired
  isTokenExpired() {
    const token = apiService.getAuthToken();
    if (!token) return true;

    try {
      // Decode JWT token (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Refresh token (placeholder for future implementation)
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update tokens
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return false;
    }
  }

  // Request password reset
  async forgotPassword(email) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token, password) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { 
        token, 
        password 
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Send email verification
  async sendVerification() {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.SEND_VERIFICATION);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Verify email with token
  async verifyEmail(token) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a single instance
const authService = new AuthService();
export default authService;
