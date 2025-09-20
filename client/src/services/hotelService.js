import apiService from './apiService';
import API_CONFIG from '../config/api';

class HotelService {
  // Get all hotels with filtering and pagination
  async getHotels(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.HOTELS.GET_ALL}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel by ID
  async getHotelById(id) {
    try {
      console.log('HotelService: Getting hotel by ID:', id);
      const endpoint = API_CONFIG.ENDPOINTS.HOTELS.GET_BY_ID(id);
      console.log('HotelService: Endpoint:', endpoint);
      const response = await apiService.get(endpoint);
      console.log('HotelService: API response:', response);
      return response;
    } catch (error) {
      console.error('HotelService: Error getting hotel by ID:', error);
      throw error;
    }
  }

  // Create new hotel
  async createHotel(hotelData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.HOTELS.CREATE, hotelData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update hotel
  async updateHotel(id, hotelData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.HOTELS.UPDATE(id), hotelData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete hotel
  async deleteHotel(id) {
    try {
      const response = await apiService.delete(API_CONFIG.ENDPOINTS.HOTELS.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotels owned by current user
  async getMyHotels() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.HOTELS.MY_HOTELS);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Add review to hotel
  async addReview(hotelId, reviewData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.HOTELS.ADD_REVIEW(hotelId), reviewData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search nearby hotels
  async searchNearbyHotels(params) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.HOTELS.SEARCH_NEARBY}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get featured hotels
  async getFeaturedHotels(limit = 6) {
    try {
      const response = await this.getHotels({ featured: true, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotels by category
  async getHotelsByCategory(category, limit = 10) {
    try {
      const response = await this.getHotels({ category, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotels by city
  async getHotelsByCity(city, limit = 10) {
    try {
      const response = await this.getHotels({ city, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotels by price range
  async getHotelsByPriceRange(minPrice, maxPrice, limit = 10) {
    try {
      const response = await this.getHotels({ minPrice, maxPrice, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotels by amenities
  async getHotelsByAmenities(amenities, limit = 10) {
    try {
      const response = await this.getHotels({ amenities, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotels by star rating
  async getHotelsByStarRating(starRating, limit = 10) {
    try {
      const response = await this.getHotels({ starRating, limit });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check hotel availability for specific dates
  async checkAvailability(hotelId, checkIn, checkOut, guests = 1) {
    try {
      const response = await this.getHotels({ 
        id: hotelId, 
        checkIn, 
        checkOut, 
        guests 
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel statistics (for hotel owners)
  async getHotelStats(hotelId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.HOTELS.STATS(hotelId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload hotel images
  async uploadHotelImages(hotelId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
        formData.append('captions', image.caption || '');
        formData.append('categories', image.category || 'other');
        formData.append('isPrimary', image.isPrimary || false);
      });

      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.HOTELS.UPLOAD_IMAGES(hotelId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel room types
  async getHotelRoomTypes(hotelId) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        return {
          success: true,
          data: {
            roomTypes: response.data.hotel.rooms || []
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel policies
  async getHotelPolicies(hotelId) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        return {
          success: true,
          data: {
            policies: response.data.hotel.policies || {}
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel reviews
  async getHotelReviews(hotelId, page = 1, limit = 10) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        const reviews = response.data.hotel.rating?.reviews || [];
        const totalReviews = response.data.hotel.rating?.count || 0;
        
        // Simple pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedReviews = reviews.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            reviews: paginatedReviews,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(totalReviews / limit),
              totalReviews,
              reviewsPerPage: limit
            }
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel amenities
  async getHotelAmenities(hotelId) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        return {
          success: true,
          data: {
            amenities: response.data.hotel.amenities || []
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel location details
  async getHotelLocation(hotelId) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        return {
          success: true,
          data: {
            location: response.data.hotel.location || {}
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get nearby attractions
  async getNearbyAttractions(hotelId) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        return {
          success: true,
          data: {
            nearbyAttractions: response.data.hotel.location?.nearbyAttractions || []
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get seasonal rates
  async getSeasonalRates(hotelId) {
    try {
      const response = await this.getHotelById(hotelId);
      if (response.success) {
        return {
          success: true,
          data: {
            seasonalRates: response.data.hotel.seasonalRates || []
          }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate room price with seasonal rates
  calculateRoomPrice(basePrice, seasonalRates, checkInDate) {
    if (!seasonalRates || seasonalRates.length === 0) {
      return basePrice;
    }

    const checkIn = new Date(checkInDate);
    const applicableRate = seasonalRates.find(rate => {
      const startDate = new Date(rate.startDate);
      const endDate = new Date(rate.endDate);
      return checkIn >= startDate && checkIn <= endDate;
    });

    if (applicableRate) {
      return Math.round(basePrice * applicableRate.multiplier);
    }

    return basePrice;
  }

  // Format hotel data for display
  formatHotelData(hotel) {
    return {
      ...hotel,
      formattedPrice: this.formatPrice(hotel.averageRoomPrice || 0),
      formattedRating: hotel.rating?.average?.toFixed(1) || '0.0',
      reviewCount: hotel.rating?.count || 0,
      locationDisplay: this.formatLocation(hotel.location),
      amenitiesDisplay: this.formatAmenities(hotel.amenities),
      categoryDisplay: this.formatCategory(hotel.category),
      starDisplay: '⭐'.repeat(hotel.starRating || 0)
    };
  }

  // Format price
  formatPrice(price, currency = 'LKR') {
    return `${currency} ${price?.toLocaleString() || '0'}`;
  }

  // Format location
  formatLocation(location) {
    if (!location) return '';
    const { address } = location;
    return `${address.city}, ${address.state}`;
  }

  // Format amenities
  formatAmenities(amenities) {
    if (!amenities || amenities.length === 0) return [];
    return amenities.map(amenity => this.formatAmenityName(amenity));
  }

  // Format amenity name
  formatAmenityName(amenity) {
    const amenityMap = {
      swimming_pool: 'Swimming Pool',
      spa: 'Spa',
      gym: 'Gym',
      restaurant: 'Restaurant',
      bar: 'Bar',
      cafe: 'Cafe',
      conference_room: 'Conference Room',
      business_center: 'Business Center',
      parking: 'Parking',
      airport_shuttle: 'Airport Shuttle',
      tour_desk: 'Tour Desk',
      car_rental: 'Car Rental',
      laundry_service: 'Laundry Service',
      dry_cleaning: 'Dry Cleaning',
      room_service: 'Room Service',
      '24_hour_front_desk': '24-Hour Front Desk',
      concierge: 'Concierge',
      luggage_storage: 'Luggage Storage',
      currency_exchange: 'Currency Exchange',
      atm: 'ATM',
      gift_shop: 'Gift Shop',
      garden: 'Garden',
      terrace: 'Terrace',
      rooftop: 'Rooftop',
      beach_access: 'Beach Access',
      mountain_view: 'Mountain View',
      city_view: 'City View'
    };
    return amenityMap[amenity] || amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Format category
  formatCategory(category) {
    const categoryMap = {
      budget: 'Budget',
      standard: 'Standard',
      comfort: 'Comfort',
      first_class: 'First Class',
      luxury: 'Luxury',
      ultra_luxury: 'Ultra Luxury'
    };
    return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

const hotelService = new HotelService();
export default hotelService;
