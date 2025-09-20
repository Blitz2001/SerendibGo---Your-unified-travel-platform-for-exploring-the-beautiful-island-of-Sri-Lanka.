const cron = require('node-cron');
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const GuideBooking = require('../models/GuideBooking');
const VehicleBooking = require('../models/VehicleBooking');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { sendBookingNotification } = require('../controllers/notificationController');

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  // Start the reminder service
  start() {
    if (this.isRunning) {
      console.log('Reminder service is already running');
      return;
    }

    // Run every hour to check for upcoming bookings
    cron.schedule('0 * * * *', async () => {
      await this.checkUpcomingBookings();
    });

    // Run daily at 9 AM to send 24-hour reminders
    cron.schedule('0 9 * * *', async () => {
      await this.send24HourReminders();
    });

    // Run daily at 9 AM to send 7-day reminders
    cron.schedule('0 9 * * *', async () => {
      await this.send7DayReminders();
    });

    this.isRunning = true;
    console.log('✅ Reminder service started');
  }

  // Stop the reminder service
  stop() {
    cron.destroy();
    this.isRunning = false;
    console.log('⏹️ Reminder service stopped');
  }

  // Check for upcoming bookings (within 2 hours)
  async checkUpcomingBookings() {
    try {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Check hotel bookings
      await this.checkHotelBookings(now, twoHoursFromNow);
      
      // Check tour bookings
      await this.checkTourBookings(now, twoHoursFromNow);
      
      // Check guide bookings
      await this.checkGuideBookings(now, twoHoursFromNow);
      
      // Check vehicle bookings
      await this.checkVehicleBookings(now, twoHoursFromNow);

    } catch (error) {
      console.error('Error checking upcoming bookings:', error);
    }
  }

  // Check hotel bookings
  async checkHotelBookings(now, twoHoursFromNow) {
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'paid'] },
      checkIn: { $gte: now, $lte: twoHoursFromNow }
    }).populate('user hotel');

    for (const booking of bookings) {
      await this.sendReminder(booking, 'hotel', booking.user, {
        hotel: booking.hotel,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
      });
    }
  }

  // Check tour bookings
  async checkTourBookings(now, twoHoursFromNow) {
    const bookings = await TourBooking.find({
      status: { $in: ['confirmed', 'paid'] },
      startDate: { $gte: now, $lte: twoHoursFromNow }
    }).populate('user tour');

    for (const booking of bookings) {
      await this.sendReminder(booking, 'tour', booking.user, {
        tour: booking.tour,
        startDate: booking.startDate,
        participants: booking.participants
      });
    }
  }

  // Check guide bookings
  async checkGuideBookings(now, twoHoursFromNow) {
    const bookings = await GuideBooking.find({
      status: { $in: ['confirmed', 'paid'] },
      startDate: { $gte: now, $lte: twoHoursFromNow }
    }).populate('user guide');

    for (const booking of bookings) {
      await this.sendReminder(booking, 'guide', booking.user, {
        guide: booking.guide,
        startDate: booking.startDate,
        duration: booking.duration
      });
    }
  }

  // Check vehicle bookings
  async checkVehicleBookings(now, twoHoursFromNow) {
    const bookings = await VehicleBooking.find({
      status: { $in: ['confirmed', 'paid'] },
      startDate: { $gte: now, $lte: twoHoursFromNow }
    }).populate('user vehicle');

    for (const booking of bookings) {
      await this.sendReminder(booking, 'vehicle', booking.user, {
        vehicle: booking.vehicle,
        startDate: booking.startDate,
        endDate: booking.endDate
      });
    }
  }

  // Send 24-hour reminders
  async send24HourReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000); // 1 hour window

      // Check all booking types for tomorrow
      await this.checkHotelBookings(tomorrow, tomorrowEnd);
      await this.checkTourBookings(tomorrow, tomorrowEnd);
      await this.checkGuideBookings(tomorrow, tomorrowEnd);
      await this.checkVehicleBookings(tomorrow, tomorrowEnd);

    } catch (error) {
      console.error('Error sending 24-hour reminders:', error);
    }
  }

  // Send 7-day reminders
  async send7DayReminders() {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextWeekEnd = new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000); // 1 day window

      // Check all booking types for next week
      await this.checkHotelBookings(nextWeek, nextWeekEnd);
      await this.checkTourBookings(nextWeek, nextWeekEnd);
      await this.checkGuideBookings(nextWeek, nextWeekEnd);
      await this.checkVehicleBookings(nextWeek, nextWeekEnd);

    } catch (error) {
      console.error('Error sending 7-day reminders:', error);
    }
  }

  // Send reminder for a specific booking
  async sendReminder(booking, bookingType, user, bookingData) {
    try {
      // Check if reminder was already sent
      if (booking.reminderSent) {
        return;
      }

      // Send email reminder
      const emailResult = await emailService.sendBookingReminder({
        user,
        booking,
        service: bookingData[bookingType] || bookingData.hotel || bookingData.tour || bookingData.guide || bookingData.vehicle
      });

      if (!emailResult.success) {
        console.error('Failed to send email reminder:', emailResult.error);
      }

      // Send in-app notification
      await sendBookingNotification(user._id, bookingType, 'booking_reminder', {
        bookingId: booking._id,
        bookingType,
        ...bookingData
      });

      // Mark reminder as sent
      booking.reminderSent = true;
      booking.lastReminderSent = new Date();
      await booking.save();

      console.log(`✅ Reminder sent for ${bookingType} booking ${booking._id} to user ${user.email}`);

    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }

  // Manually send reminder for a specific booking
  async sendManualReminder(bookingId, bookingType) {
    try {
      let booking, user, bookingData;

      switch (bookingType) {
        case 'hotel':
          booking = await Booking.findById(bookingId).populate('user hotel');
          if (booking) {
            user = booking.user;
            bookingData = {
              hotel: booking.hotel,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut
            };
          }
          break;
        case 'tour':
          booking = await TourBooking.findById(bookingId).populate('user tour');
          if (booking) {
            user = booking.user;
            bookingData = {
              tour: booking.tour,
              startDate: booking.startDate,
              participants: booking.participants
            };
          }
          break;
        case 'guide':
          booking = await GuideBooking.findById(bookingId).populate('user guide');
          if (booking) {
            user = booking.user;
            bookingData = {
              guide: booking.guide,
              startDate: booking.startDate,
              duration: booking.duration
            };
          }
          break;
        case 'vehicle':
          booking = await VehicleBooking.findById(bookingId).populate('user vehicle');
          if (booking) {
            user = booking.user;
            bookingData = {
              vehicle: booking.vehicle,
              startDate: booking.startDate,
              endDate: booking.endDate
            };
          }
          break;
      }

      if (!booking || !user) {
        throw new Error('Booking or user not found');
      }

      await this.sendReminder(booking, bookingType, user, bookingData);

      return {
        success: true,
        message: 'Reminder sent successfully'
      };

    } catch (error) {
      console.error('Error sending manual reminder:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get reminder statistics
  async getReminderStats() {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats = {
        totalBookings: 0,
        remindersSent: 0,
        upcomingBookings: 0,
        overdueBookings: 0
      };

      // Count hotel bookings
      const hotelBookings = await Booking.countDocuments({
        status: { $in: ['confirmed', 'paid'] }
      });
      stats.totalBookings += hotelBookings;

      const hotelReminders = await Booking.countDocuments({
        reminderSent: true,
        lastReminderSent: { $gte: last24Hours }
      });
      stats.remindersSent += hotelReminders;

      // Count tour bookings
      const tourBookings = await TourBooking.countDocuments({
        status: { $in: ['confirmed', 'paid'] }
      });
      stats.totalBookings += tourBookings;

      const tourReminders = await TourBooking.countDocuments({
        reminderSent: true,
        lastReminderSent: { $gte: last24Hours }
      });
      stats.remindersSent += tourReminders;

      // Count guide bookings
      const guideBookings = await GuideBooking.countDocuments({
        status: { $in: ['confirmed', 'paid'] }
      });
      stats.totalBookings += guideBookings;

      const guideReminders = await GuideBooking.countDocuments({
        reminderSent: true,
        lastReminderSent: { $gte: last24Hours }
      });
      stats.remindersSent += guideReminders;

      // Count vehicle bookings
      const vehicleBookings = await VehicleBooking.countDocuments({
        status: { $in: ['confirmed', 'paid'] }
      });
      stats.totalBookings += vehicleBookings;

      const vehicleReminders = await VehicleBooking.countDocuments({
        reminderSent: true,
        lastReminderSent: { $gte: last24Hours }
      });
      stats.remindersSent += vehicleReminders;

      return stats;

    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const reminderService = new ReminderService();

module.exports = reminderService;
