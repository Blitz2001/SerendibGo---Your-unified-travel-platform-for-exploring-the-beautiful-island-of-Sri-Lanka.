import apiService from './apiService';
import API_CONFIG from '../config/api';

class TourService {
  // Get all tours with optional filters
  async getTours(filters = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, filters);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get a single tour by ID
  async getTourById(tourId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.DETAIL(tourId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create a new tour (requires authentication)
  async createTour(tourData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TOURS.CREATE, tourData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update an existing tour (requires authentication)
  async updateTour(tourId, tourData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TOURS.UPDATE(tourId), tourData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete a tour (requires authentication)
  async deleteTour(tourId) {
    try {
      const response = await apiService.delete(API_CONFIG.ENDPOINTS.TOURS.DELETE(tourId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search tours with advanced filters
  async searchTours(searchParams = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, searchParams);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tours by category
  async getToursByCategory(category) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, { category });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tours by location
  async getToursByLocation(location) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, { location });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tours by price range
  async getToursByPriceRange(minPrice, maxPrice) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, {
        minPrice,
        maxPrice
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tours by difficulty level
  async getToursByDifficulty(difficulty) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, { difficulty });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tours by duration
  async getToursByDuration(duration) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, { duration });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get featured tours (top rated)
  async getFeaturedTours(limit = 6) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, {
        sort: 'rating',
        limit
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tours with availability on specific dates
  async getToursByAvailability(startDate, endDate) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.LIST, {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      throw error;
      }
  }

  // Book a tour
  async bookTour(tourId, bookingData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TOURS.BOOK(tourId), bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a single instance
const tourService = new TourService();
export default tourService;
