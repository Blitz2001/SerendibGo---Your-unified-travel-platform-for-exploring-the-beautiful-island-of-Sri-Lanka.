import apiService from './apiService';
import API_CONFIG from '../config/api';

class BookingService {
  // Create new booking
  async createBooking(bookingData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's bookings
  async getMyBookings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.BOOKINGS.GET_ALL}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get booking by ID
  async getBookingById(id) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.BOOKINGS.GET_BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update booking
  async updateBooking(id, bookingData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE(id), bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(id, cancellationReason) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL(id), {
        cancellationReason
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update booking status (admin/hotel owner only)
  async updateBookingStatus(id, statusData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), statusData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get hotel bookings (hotel owner or admin only)
  async getHotelBookings(hotelId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.BOOKINGS.GET_HOTEL_BOOKINGS(hotelId)}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check room availability
  async checkAvailability(params) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.BOOKINGS.CHECK_AVAILABILITY}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings() {
    try {
      const response = await this.getMyBookings({ status: 'confirmed' });
      if (response.success) {
        const upcoming = response.data.bookings.filter(booking => {
          const checkIn = new Date(booking.checkIn);
          const now = new Date();
          return checkIn > now;
        });
        return {
          success: true,
          data: { bookings: upcoming }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get past bookings
  async getPastBookings() {
    try {
      const response = await this.getMyBookings({ status: 'completed' });
      if (response.success) {
        const past = response.data.bookings.filter(booking => {
          const checkOut = new Date(booking.checkOut);
          const now = new Date();
          return checkOut < now;
        });
        return {
          success: true,
          data: { bookings: past }
        };
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get active bookings
  async getActiveBookings() {
    try {
      const response = await this.getMyBookings({ status: 'checked_in' });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get pending bookings
  async getPendingBookings() {
    try {
      const response = await this.getMyBookings({ status: 'pending' });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate total amount for a booking
  calculateTotalAmount(roomPrice, checkIn, checkOut, guests = { adults: 1, children: 0, infants: 0 }) {
    if (!roomPrice || !checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Base price per night
    let total = roomPrice * nights;
    
    // Add charges for additional guests if applicable
    const totalGuests = guests.adults + guests.children + guests.infants;
    if (totalGuests > 2) {
      // Add 20% for each additional guest beyond 2
      const additionalGuests = totalGuests - 2;
      total += (roomPrice * 0.2 * additionalGuests * nights);
    }
    
    return Math.round(total);
  }

  // Format booking data for display
  formatBookingData(booking) {
    return {
      ...booking,
      formattedCheckIn: this.formatDate(booking.checkIn),
      formattedCheckOut: this.formatDate(booking.checkOut),
      formattedTotalAmount: this.formatPrice(booking.totalAmount, booking.currency),
      formattedRoomPrice: this.formatPrice(booking.roomPrice, booking.currency),
      statusDisplay: this.formatStatus(booking.status),
      paymentStatusDisplay: this.formatPaymentStatus(booking.paymentStatus),
      nights: this.calculateNights(booking.checkIn, booking.checkOut),
      canBeCancelled: this.canBeCancelled(booking),
      refundAmount: this.calculateRefund(booking)
    };
  }

  // Format date
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format price
  formatPrice(price, currency = 'LKR') {
    if (!price) return `${currency} 0`;
    return `${currency} ${price.toLocaleString()}`;
  }

  // Format status
  formatStatus(status) {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      checked_in: 'Checked In',
      checked_out: 'Checked Out',
      cancelled: 'Cancelled',
      completed: 'Completed'
    };
    return statusMap[status] || status;
  }

  // Format payment status
  formatPaymentStatus(paymentStatus) {
    const paymentStatusMap = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded'
    };
    return paymentStatusMap[paymentStatus] || paymentStatus;
  }

  // Calculate nights
  calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  }

  // Check if booking can be cancelled
  canBeCancelled(booking) {
    if (booking.status !== 'confirmed') return false;
    
    const now = new Date();
    const checkInTime = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
    
    return hoursUntilCheckIn > 24;
  }

  // Calculate refund amount
  calculateRefund(booking) {
    if (!this.canBeCancelled(booking)) return 0;
    
    const now = new Date();
    const checkInTime = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn > 48) {
      return booking.totalAmount;
    }
    
    return Math.round(booking.totalAmount * 0.5);
  }

  // Validate booking data
  validateBookingData(bookingData) {
    const errors = [];

    if (!bookingData.hotelId) errors.push('Hotel is required');
    if (!bookingData.roomId) errors.push('Room is required');
    if (!bookingData.checkIn) errors.push('Check-in date is required');
    if (!bookingData.checkOut) errors.push('Check-out date is required');
    if (!bookingData.guests || !bookingData.guests.adults) errors.push('Number of adults is required');

    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const now = new Date();

      if (checkIn <= now) {
        errors.push('Check-in date must be in the future');
      }

      if (checkOut <= checkIn) {
        errors.push('Check-out date must be after check-in date');
      }
    }

    if (bookingData.guests) {
      const { adults, children, infants } = bookingData.guests;
      if (adults < 1) errors.push('At least 1 adult is required');
      if (adults > 10) errors.push('Maximum 10 adults allowed');
      if (children > 8) errors.push('Maximum 8 children allowed');
      if (infants > 4) errors.push('Maximum 4 infants allowed');
    }

    return errors;
  }

  // Get booking statistics
  getBookingStats(bookings) {
    // Ensure bookings is an array
    if (!bookings || !Array.isArray(bookings)) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        checkedIn: 0,
        checkedOut: 0,
        cancelled: 0,
        completed: 0,
        totalAmount: 0
      };
    }

    const stats = {
      total: bookings.length,
      pending: 0,
      confirmed: 0,
      checkedIn: 0,
      checkedOut: 0,
      cancelled: 0,
      completed: 0,
      totalAmount: 0
    };

    bookings.forEach(booking => {
      if (booking && booking.status) {
        stats[booking.status] = (stats[booking.status] || 0) + 1;
      }
      if (booking && booking.totalAmount) {
        stats.totalAmount += booking.totalAmount;
      }
    });

    return stats;
  }
}

const bookingService = new BookingService();
export default bookingService;
