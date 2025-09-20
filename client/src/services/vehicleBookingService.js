import apiService from './apiService';

class VehicleBookingService {
  // Create a new vehicle booking
  async createVehicleBooking(bookingData) {
    try {
      const response = await apiService.post('/api/vehicle-bookings', bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's vehicle bookings
  async getMyVehicleBookings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/vehicle-bookings/my?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicle booking by ID
  async getVehicleBookingById(bookingId) {
    try {
      const response = await apiService.get(`/api/vehicle-bookings/${bookingId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cancel a vehicle booking
  async cancelVehicleBooking(bookingId, cancellationReason) {
    try {
      const response = await apiService.put(`/api/vehicle-bookings/${bookingId}/cancel`, {
        cancellationReason
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update vehicle booking status (admin only)
  async updateVehicleBookingStatus(bookingId, status) {
    try {
      const response = await apiService.put(`/api/vehicle-bookings/${bookingId}/status`, {
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
  getBookingStats(vehicleBookings) {
    if (!vehicleBookings || !Array.isArray(vehicleBookings)) {
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
      total: vehicleBookings.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0
    };

    vehicleBookings.forEach(booking => {
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
const vehicleBookingService = new VehicleBookingService();
export default vehicleBookingService;
