import apiService from './apiService';

class VehicleRentalService {
  // Create a vehicle rental booking
  async createRental(rentalData) {
    try {
      const response = await apiService.post('/api/vehicle-rentals', rentalData);
      return response;
    } catch (error) {
      console.error('Error creating vehicle rental:', error);
      throw error;
    }
  }

  // Get user's rental bookings
  async getMyRentals(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const url = `/api/vehicle-rentals/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching rentals:', error);
      throw error;
    }
  }

  // Get a specific rental booking
  async getRental(rentalId) {
    try {
      const response = await apiService.get(`/api/vehicle-rentals/${rentalId}`);
      return response;
    } catch (error) {
      console.error('Error fetching rental:', error);
      throw error;
    }
  }

  // Update rental status
  async updateRentalStatus(rentalId, status) {
    try {
      const response = await apiService.patch(`/api/vehicle-rentals/${rentalId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating rental status:', error);
      throw error;
    }
  }

  // Cancel rental booking
  async cancelRental(rentalId, reason = '') {
    try {
      const response = await apiService.patch(`/api/vehicle-rentals/${rentalId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error cancelling rental:', error);
      throw error;
    }
  }

  // Check vehicle availability for rental
  async checkAvailability(vehicleId, startDate, endDate, rentalType = 'daily') {
    try {
      const response = await apiService.post('/api/vehicle-rentals/check-availability', {
        vehicleId,
        startDate,
        endDate,
        rentalType
      });
      return response;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  // Calculate rental cost
  async calculateCost(vehicleId, rentalData) {
    try {
      const response = await apiService.post('/api/vehicle-rentals/calculate-cost', {
        vehicleId,
        ...rentalData
      });
      return response;
    } catch (error) {
      console.error('Error calculating cost:', error);
      throw error;
    }
  }

  // Get rental statistics for vehicle owner
  async getRentalStats(vehicleId, period = 'month') {
    try {
      const response = await apiService.get(`/api/vehicle-rentals/stats/${vehicleId}?period=${period}`);
      return response;
    } catch (error) {
      console.error('Error fetching rental stats:', error);
      throw error;
    }
  }

  // Get rental analytics
  async getRentalAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) queryParams.append('period', params.period);
      if (params.year) queryParams.append('year', params.year);
      if (params.month) queryParams.append('month', params.month);

      const url = `/api/vehicle-rentals/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching rental analytics:', error);
      throw error;
    }
  }

  // Submit rental review
  async submitReview(rentalId, reviewData) {
    try {
      const response = await apiService.post(`/api/vehicle-rentals/${rentalId}/review`, reviewData);
      return response;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  // Get rental reviews
  async getRentalReviews(vehicleId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.rating) queryParams.append('rating', params.rating);

      const url = `/api/vehicle-rentals/${vehicleId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching rental reviews:', error);
      throw error;
    }
  }
}

const vehicleRentalService = new VehicleRentalService();
export default vehicleRentalService;
