import apiService from './apiService';
import API_CONFIG from '../config/api';

class TripRequestService {
  static async createTripRequest(tripData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.CREATE, tripData);
      return response;
    } catch (error) {
      console.error('Error creating trip request:', error);
      throw error;
    }
  }

  static async getMyTripRequests(page = 1, limit = 10, status = '') {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.MY_REQUESTS, {
        params: {
          page,
          limit,
          status
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching my trip requests:', error);
      throw error;
    }
  }

  static async getTripRequestById(id) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.DETAIL(id));
      return response;
    } catch (error) {
      console.error('Error fetching trip request details:', error);
      throw error;
    }
  }

  static async getAllTripRequests(params = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.ADMIN_ALL, {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching all trip requests:', error);
      throw error;
    }
  }

  static async updateTripRequestStatus(id, statusData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.UPDATE_STATUS(id), statusData);
      return response;
    } catch (error) {
      console.error('Error updating trip request status:', error);
      throw error;
    }
  }

  static async assignTripRequest(id, assignmentData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.ASSIGN(id), assignmentData);
      return response;
    } catch (error) {
      console.error('Error assigning trip request:', error);
      throw error;
    }
  }

  static async addCommunication(id, communicationData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.ADD_COMMUNICATION(id), communicationData);
      return response;
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  }

  static async getTripRequestStats() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.STATS);
      return response;
    } catch (error) {
      console.error('Error fetching trip request stats:', error);
      throw error;
    }
  }
}

export default TripRequestService;
