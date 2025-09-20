import apiService from './apiService';
import API_CONFIG from '../config/api';

class TourBookingService {
  // Get user's tour bookings
  async getMyTourBookings(params = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.MY_BOOKINGS, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cancel a tour booking
  async cancelTourBooking(bookingId, cancellationReason) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TOURS.CANCEL_BOOKING(bookingId), {
        cancellationReason
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get tour booking by ID
  async getTourBookingById(bookingId) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TOURS.GET_BOOKING(bookingId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update tour booking status
  async updateTourBookingStatus(bookingId, status) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TOURS.UPDATE_BOOKING_STATUS(bookingId), {
        status
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Format booking status for display
  formatStatus(status) {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  // Format payment status for display
  formatPaymentStatus(paymentStatus) {
    const paymentStatusMap = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded'
    };
    return paymentStatusMap[paymentStatus] || paymentStatus;
  }

  // Get status color for UI
  getStatusColor(status) {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get payment status color for UI
  getPaymentStatusColor(paymentStatus) {
    const paymentStatusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    return paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-800';
  }

  // Calculate booking statistics
  getBookingStats(tourBookings) {
    // Ensure tourBookings is an array
    if (!tourBookings || !Array.isArray(tourBookings)) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        totalAmount: 0
      };
    }

    const stats = {
      total: tourBookings.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0
    };

    tourBookings.forEach(booking => {
      if (booking && booking.status) {
        stats[booking.status]++;
      }
      if (booking && booking.totalAmount) {
        stats.totalAmount += booking.totalAmount;
      }
    });

    return stats;
  }
}

// Create and export a single instance
const tourBookingService = new TourBookingService();
export default tourBookingService;

