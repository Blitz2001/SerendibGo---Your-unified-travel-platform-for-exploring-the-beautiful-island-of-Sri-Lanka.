const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const GuideBooking = require('../models/GuideBooking');
const VehicleBooking = require('../models/VehicleBooking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Review = require('../models/Review');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Guide = require('../models/Guide');
const Vehicle = require('../models/Vehicle');

class AnalyticsService {
  
  // Get overall platform analytics
  async getPlatformAnalytics(period = 'month', year = new Date().getFullYear()) {
    try {
      const dateRange = this.getDateRange(period, year);
      
      const [
        totalUsers,
        totalBookings,
        totalRevenue,
        totalReviews,
        activeTours,
        activeHotels,
        activeGuides,
        activeVehicles,
        monthlyStats,
        revenueStats,
        bookingStats,
        userStats
      ] = await Promise.all([
        User.countDocuments(),
        this.getTotalBookings(dateRange),
        this.getTotalRevenue(dateRange),
        Review.countDocuments(),
        Tour.countDocuments({ isActive: true }),
        Hotel.countDocuments({ isActive: true }),
        Guide.countDocuments({ status: 'approved' }),
        Vehicle.countDocuments({ isActive: true }),
        this.getMonthlyStats(dateRange),
        this.getRevenueStats(dateRange),
        this.getBookingStats(dateRange),
        this.getUserStats(dateRange)
      ]);

      return {
        overview: {
          totalUsers,
          totalBookings,
          totalRevenue,
          totalReviews,
          activeTours,
          activeHotels,
          activeGuides,
          activeVehicles
        },
        trends: {
          monthly: monthlyStats,
          revenue: revenueStats,
          bookings: bookingStats,
          users: userStats
        }
      };

    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw error;
    }
  }

  // Get booking analytics
  async getBookingAnalytics(period = 'month', year = new Date().getFullYear()) {
    try {
      const dateRange = this.getDateRange(period, year);
      
      const [
        hotelBookings,
        tourBookings,
        guideBookings,
        vehicleBookings,
        bookingTrends,
        statusDistribution,
        topDestinations,
        averageBookingValue
      ] = await Promise.all([
        this.getHotelBookingStats(dateRange),
        this.getTourBookingStats(dateRange),
        this.getGuideBookingStats(dateRange),
        this.getVehicleBookingStats(dateRange),
        this.getBookingTrends(dateRange),
        this.getBookingStatusDistribution(dateRange),
        this.getTopDestinations(dateRange),
        this.getAverageBookingValue(dateRange)
      ]);

      return {
        byType: {
          hotels: hotelBookings,
          tours: tourBookings,
          guides: guideBookings,
          vehicles: vehicleBookings
        },
        trends: bookingTrends,
        statusDistribution,
        topDestinations,
        averageBookingValue
      };

    } catch (error) {
      console.error('Error getting booking analytics:', error);
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(period = 'month', year = new Date().getFullYear()) {
    try {
      const dateRange = this.getDateRange(period, year);
      
      const [
        totalRevenue,
        revenueByType,
        revenueTrends,
        paymentMethods,
        refundStats,
        averageTransactionValue
      ] = await Promise.all([
        this.getTotalRevenue(dateRange),
        this.getRevenueByType(dateRange),
        this.getRevenueTrends(dateRange),
        this.getPaymentMethodStats(dateRange),
        this.getRefundStats(dateRange),
        this.getAverageTransactionValue(dateRange)
      ]);

      return {
        totalRevenue,
        byType: revenueByType,
        trends: revenueTrends,
        paymentMethods,
        refunds: refundStats,
        averageTransactionValue
      };

    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  // Get user analytics
  async getUserAnalytics(period = 'month', year = new Date().getFullYear()) {
    try {
      const dateRange = this.getDateRange(period, year);
      
      const [
        totalUsers,
        newUsers,
        userRoles,
        userActivity,
        userRetention,
        topUsers
      ] = await Promise.all([
        User.countDocuments(),
        this.getNewUsers(dateRange),
        this.getUserRoleDistribution(),
        this.getUserActivity(dateRange),
        this.getUserRetention(dateRange),
        this.getTopUsers(dateRange)
      ]);

      return {
        totalUsers,
        newUsers,
        roleDistribution: userRoles,
        activity: userActivity,
        retention: userRetention,
        topUsers
      };

    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // Helper methods
  getDateRange(period, year) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = new Date(year, now.getMonth(), now.getDate());
        endDate = new Date(year, now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(year, now.getMonth(), startOfWeek);
        endDate = new Date(year, now.getMonth(), startOfWeek + 7);
        break;
      case 'month':
        startDate = new Date(year, now.getMonth(), 1);
        endDate = new Date(year, now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
        break;
      default:
        startDate = new Date(year, now.getMonth(), 1);
        endDate = new Date(year, now.getMonth() + 1, 1);
    }

    return { startDate, endDate };
  }

  async getTotalBookings(dateRange) {
    const hotelBookings = await Booking.countDocuments({
      createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
    });
    const tourBookings = await TourBooking.countDocuments({
      createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
    });
    const guideBookings = await GuideBooking.countDocuments({
      createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
    });
    const vehicleBookings = await VehicleBooking.countDocuments({
      createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
    });

    return hotelBookings + tourBookings + guideBookings + vehicleBookings;
  }

  async getTotalRevenue(dateRange) {
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getMonthlyStats(dateRange) {
    const stats = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return stats;
  }

  async getRevenueStats(dateRange) {
    const stats = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$bookingType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return stats;
  }

  async getBookingStats(dateRange) {
    const hotelStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const tourStats = await TourBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return { hotels: hotelStats, tours: tourStats };
  }

  async getUserStats(dateRange) {
    const stats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return stats;
  }

  async getHotelBookingStats(dateRange) {
    return await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' }
        }
      }
    ]);
  }

  async getTourBookingStats(dateRange) {
    return await TourBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' }
        }
      }
    ]);
  }

  async getGuideBookingStats(dateRange) {
    return await GuideBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' }
        }
      }
    ]);
  }

  async getVehicleBookingStats(dateRange) {
    return await VehicleBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' }
        }
      }
    ]);
  }

  async getBookingTrends(dateRange) {
    const trends = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$bookingType'
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    return trends;
  }

  async getBookingStatusDistribution(dateRange) {
    const distribution = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return distribution;
  }

  async getTopDestinations(dateRange) {
    const destinations = await Tour.aggregate([
      {
        $lookup: {
          from: 'tourbookings',
          localField: '_id',
          foreignField: 'tour',
          as: 'bookings'
        }
      },
      {
        $unwind: '$bookings'
      },
      {
        $match: {
          'bookings.createdAt': { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          revenue: { $sum: '$bookings.totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return destinations;
  }

  async getAverageBookingValue(dateRange) {
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].average : 0;
  }

  async getRevenueByType(dateRange) {
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$bookingType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return revenue;
  }

  async getRevenueTrends(dateRange) {
    const trends = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    return trends;
  }

  async getPaymentMethodStats(dateRange) {
    const stats = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    return stats;
  }

  async getRefundStats(dateRange) {
    const stats = await Payment.aggregate([
      {
        $match: {
          status: 'refunded',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRefunded: { $sum: '$refundAmount' }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : { count: 0, totalRefunded: 0 };
  }

  async getAverageTransactionValue(dateRange) {
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].average : 0;
  }

  async getNewUsers(dateRange) {
    return await User.countDocuments({
      createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
    });
  }

  async getUserRoleDistribution() {
    const distribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return distribution;
  }

  async getUserActivity(dateRange) {
    const activity = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    return activity;
  }

  async getUserRetention(dateRange) {
    // Simplified retention calculation
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: dateRange.startDate, $lt: dateRange.endDate }
    });

    return {
      totalUsers,
      activeUsers,
      retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    };
  }

  async getTopUsers(dateRange) {
    const topUsers = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dateRange.startDate, $lt: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$amount' },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          bookingCount: 1
        }
      }
    ]);

    return topUsers;
  }
}

module.exports = new AnalyticsService();
