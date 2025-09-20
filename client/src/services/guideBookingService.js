import apiService from './apiService';

class GuideBookingService {
  // Create a new guide booking
  async createGuideBooking(bookingData) {
    try {
      const response = await apiService.post('/api/guide-bookings', bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's guide bookings
  async getMyGuideBookings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/guide-bookings/my?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get guide booking by ID
  async getGuideBookingById(bookingId) {
    try {
      const response = await apiService.get(`/api/guide-bookings/${bookingId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cancel a guide booking
  async cancelGuideBooking(bookingId, cancellationReason) {
    try {
      const response = await apiService.put(`/api/guide-bookings/${bookingId}/cancel`, {
        cancellationReason
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update guide booking status (admin only)
  async updateGuideBookingStatus(bookingId, status) {
    try {
      const response = await apiService.put(`/api/guide-bookings/${bookingId}/status`, {
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
  getBookingStats(guideBookings) {
    if (!guideBookings || !Array.isArray(guideBookings)) {
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
      total: guideBookings.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0
    };

    guideBookings.forEach(booking => {
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
const guideBookingService = new GuideBookingService();
export default guideBookingService;







