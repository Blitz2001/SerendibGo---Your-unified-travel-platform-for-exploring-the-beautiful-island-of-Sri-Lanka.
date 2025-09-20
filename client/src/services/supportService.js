import apiService from './apiService';
import API_CONFIG from '../config/api';

class SupportService {
  // Create a new support request
  static async createSupportRequest(supportData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.SUPPORT.CONTACT, supportData);
      return response;
    } catch (error) {
      console.error('Create support request error:', error);
      throw error;
    }
  }

  // Get support request categories
  static async getCategories() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.SUPPORT.CATEGORIES);
      return response;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  // Get user's support requests
  static async getMySupportRequests(params = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.SUPPORT.MY_REQUESTS, { params });
      return response;
    } catch (error) {
      console.error('Get my support requests error:', error);
      throw error;
    }
  }

  // Get support request details
  static async getSupportRequest(requestId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.SUPPORT.DETAIL(requestId));
      return response;
    } catch (error) {
      console.error('Get support request error:', error);
      throw error;
    }
  }

  // Add response to support request (Admin only)
  static async addResponse(requestId, message) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.SUPPORT.RESPOND(requestId), {
        message
      });
      return response;
    } catch (error) {
      console.error('Add response error:', error);
      throw error;
    }
  }

  // Update support request status (Admin only)
  static async updateStatus(requestId, status) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.SUPPORT.UPDATE_STATUS(requestId), {
        status
      });
      return response;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  }

  // Helper method to format support request data
  static formatSupportRequestData(formData, relatedData = {}) {
    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      category: formData.category,
      relatedBookingId: relatedData.bookingId,
      relatedBookingType: relatedData.bookingType,
      relatedTourId: relatedData.tourId
    };
  }

  // Helper method to get category label
  static getCategoryLabel(categoryValue, categories = []) {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  }

  // Helper method to get status color
  static getStatusColor(status) {
    const colors = {
      open: 'text-blue-600 bg-blue-100',
      in_progress: 'text-yellow-600 bg-yellow-100',
      resolved: 'text-green-600 bg-green-100',
      closed: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  // Helper method to get priority color
  static getPriorityColor(priority) {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  }
}

export default SupportService;
