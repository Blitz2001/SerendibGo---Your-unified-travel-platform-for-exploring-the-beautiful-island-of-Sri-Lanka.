import apiService from './apiService';
import API_CONFIG from '../config/api';

class VehicleService {
  // Get all vehicles with optional filters
  async getVehicles(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.VEHICLES.LIST}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get a single vehicle by ID
  async getVehicleById(vehicleId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.VEHICLES.DETAIL(vehicleId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search vehicles with advanced filters
  async searchVehicles(searchParams = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.VEHICLES.SEARCH, searchParams);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles by type
  async getVehiclesByType(type) {
    try {
      const response = await this.getVehicles({ type });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles by location
  async getVehiclesByLocation(city) {
    try {
      const response = await this.getVehicles({ city });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles by price range
  async getVehiclesByPriceRange(minPrice, maxPrice) {
    try {
      const response = await this.getVehicles({ minPrice, maxPrice });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles by capacity
  async getVehiclesByCapacity(capacity) {
    try {
      const response = await this.getVehicles({ capacity });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles by features
  async getVehiclesByFeatures(features) {
    try {
      const response = await this.getVehicles({ features });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get available vehicles for specific dates
  async getAvailableVehicles(checkIn, checkOut, location = null) {
    try {
      const params = { checkIn, checkOut };
      if (location) params.location = location;
      const response = await this.getVehicles(params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get featured vehicles
  async getFeaturedVehicles(limit = 6) {
    try {
      const response = await this.getVehicles({ featured: true, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles owned by current user
  async getMyVehicles() {
    try {
      const response = await apiService.get('/api/vehicles/owner/my-vehicles');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new vehicle (requires authentication)
  async createVehicle(vehicleData) {
    try {
      const response = await apiService.post('/api/vehicles', vehicleData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update vehicle (requires authentication)
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await apiService.put(`/api/vehicles/${vehicleId}`, vehicleData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete vehicle (requires authentication)
  async deleteVehicle(vehicleId) {
    try {
      const response = await apiService.delete(`/api/vehicles/${vehicleId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload vehicle images
  async uploadVehicleImages(vehicleId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });
      
      const response = await apiService.post(`/api/vehicles/${vehicleId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check vehicle availability
  async checkVehicleAvailability(vehicleId, checkIn, checkOut) {
    try {
      const response = await apiService.post(`/api/vehicles/${vehicleId}/check-availability`, {
        checkIn,
        checkOut
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicle reviews
  async getVehicleReviews(vehicleId, page = 1, limit = 10) {
    try {
      const response = await apiService.get(`/api/vehicles/${vehicleId}/reviews?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Add vehicle review
  async addVehicleReview(vehicleId, reviewData) {
    try {
      const response = await apiService.post(`/api/vehicles/${vehicleId}/reviews`, reviewData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate rental price
  calculateRentalPrice(vehicle, duration, unit = 'daily') {
    if (!vehicle || !vehicle.pricing) return 0;
    
    const pricing = vehicle.pricing;
    let basePrice = 0;
    
    switch (unit) {
      case 'hourly':
        basePrice = pricing.hourly || 0;
        return basePrice * duration;
      case 'daily':
        basePrice = pricing.daily || 0;
        return basePrice * duration;
      case 'weekly':
        basePrice = pricing.weekly || (pricing.daily * 7 * 0.9); // 10% discount for weekly
        return basePrice * Math.ceil(duration / 7);
      case 'monthly':
        basePrice = pricing.monthly || (pricing.daily * 30 * 0.8); // 20% discount for monthly
        return basePrice * Math.ceil(duration / 30);
      default:
        return pricing.daily * duration;
    }
  }

  // Format vehicle data for display
  formatVehicleData(vehicle) {
    return {
      ...vehicle,
      formattedPrice: this.formatPrice(vehicle.pricing?.daily || 0, vehicle.pricing?.currency || 'LKR'),
      formattedCapacity: `${vehicle.capacity} passenger${vehicle.capacity > 1 ? 's' : ''}`,
      formattedYear: vehicle.year,
      formattedLocation: vehicle.location?.city || 'Location not specified',
      statusDisplay: this.formatStatus(vehicle.status),
      ratingDisplay: vehicle.rating?.average?.toFixed(1) || '0.0',
      isAvailable: vehicle.availability?.isAvailable && vehicle.status === 'active',
      featuresList: vehicle.features?.join(', ') || 'No features listed',
      amenitiesList: vehicle.amenities?.join(', ') || 'No amenities listed'
    };
  }

  // Format price
  formatPrice(price, currency = 'LKR') {
    if (!price) return `${currency} 0`;
    return `${currency} ${price.toLocaleString()}`;
  }

  // Format status
  formatStatus(status) {
    const statusMap = {
      active: 'Available',
      maintenance: 'Under Maintenance',
      inactive: 'Not Available',
      suspended: 'Suspended'
    };
    return statusMap[status] || status;
  }

  // Get vehicle type icon
  getVehicleTypeIcon(type) {
    const iconMap = {
      car: '🚗',
      van: '🚐',
      bus: '🚌',
      jeep: '🚙',
      motorcycle: '🏍️',
      bicycle: '🚲',
      boat: '🚤',
      helicopter: '🚁'
    };
    return iconMap[type] || '🚗';
  }

  // Get vehicle type display name
  getVehicleTypeDisplayName(type) {
    const nameMap = {
      car: 'Car',
      van: 'Van',
      bus: 'Bus',
      jeep: 'Jeep',
      motorcycle: 'Motorcycle',
      bicycle: 'Bicycle',
      boat: 'Boat',
      helicopter: 'Helicopter'
    };
    return nameMap[type] || 'Vehicle';
  }

  // Validate vehicle search parameters
  validateSearchParams(params) {
    const errors = [];
    
    if (params.checkIn && params.checkOut) {
      const checkIn = new Date(params.checkIn);
      const checkOut = new Date(params.checkOut);
      const now = new Date();
      
      if (checkIn <= now) {
        errors.push('Check-in date must be in the future');
      }
      
      if (checkOut <= checkIn) {
        errors.push('Check-out date must be after check-in date');
      }
    }
    
    if (params.capacity && (params.capacity < 1 || params.capacity > 50)) {
      errors.push('Capacity must be between 1 and 50');
    }
    
    if (params.minPrice && params.minPrice < 0) {
      errors.push('Minimum price cannot be negative');
    }
    
    if (params.maxPrice && params.maxPrice < 0) {
      errors.push('Maximum price cannot be negative');
    }
    
    if (params.minPrice && params.maxPrice && params.minPrice > params.maxPrice) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
    
    return errors;
  }
}

const vehicleService = new VehicleService();
export default vehicleService;
