import apiService from './apiService';

class GuideService {
  // Get all guides with filters
  async getGuides(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/guides?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guide by ID
  async getGuideById(guideId) {
    try {
      const response = await apiService.get(`/api/guides/${guideId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guides by location
  async getGuidesByLocation(location) {
    try {
      const response = await apiService.get(`/api/guides?location=${location}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guides by specialization
  async getGuidesBySpecialization(specialization) {
    try {
      const response = await apiService.get(`/api/guides?specialization=${specialization}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search guides
  async searchGuides(query) {
    try {
      const response = await apiService.get(`/api/guides/search?q=${query}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current guide's profile
  async getMyProfile() {
    try {
      const response = await apiService.get('/api/guides/my-profile');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current guide's bookings
  async getMyGuideBookings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/guides/my-bookings?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update guide availability
  async updateAvailability(availabilityData) {
    try {
      const response = await apiService.put('/api/guides/availability', availabilityData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create guide profile
  async createMyProfile() {
    try {
      const response = await apiService.post('/api/guides/create-profile');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update guide profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/api/guides/my-profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update guide services
  async updateServices(servicesData) {
    try {
      const response = await apiService.put('/api/guides/services', servicesData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, statusData) {
    try {
      const response = await apiService.put(`/api/guides/bookings/${bookingId}/status`, statusData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guide earnings
  async getMyEarnings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/guides/earnings?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guide reviews
  async getMyReviews(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/guides/reviews?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guide analytics
  async getMyAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/guides/analytics?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Review management methods
  async replyToReview(reviewId, replyData) {
    try {
      const response = await apiService.post(`/api/guides/reviews/${reviewId}/reply`, replyData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async reportReview(reviewId, reportData) {
    try {
      const response = await apiService.post(`/api/guides/reviews/${reviewId}/report`, reportData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markReviewHelpful(reviewId) {
    try {
      const response = await apiService.post(`/api/guides/reviews/${reviewId}/helpful`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Settings management methods
  async updateNotificationSettings(settings) {
    try {
      const response = await apiService.put('/api/guides/settings/notifications', settings);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updatePrivacySettings(settings) {
    try {
      const response = await apiService.put('/api/guides/settings/privacy', settings);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentSettings(settings) {
    try {
      const response = await apiService.put('/api/guides/settings/payment', settings);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await apiService.put('/api/guides/settings/password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount() {
    try {
      const response = await apiService.delete('/api/guides/settings/account');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Image upload method
  async uploadProfileImage(imageData) {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      const response = await apiService.post('/api/guides/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a single instance
const guideService = new GuideService();
export default guideService;







