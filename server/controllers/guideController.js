const Guide = require('../models/Guide');
const User = require('../models/User');
const TourBooking = require('../models/TourBooking');
const Review = require('../models/Review');

// Get all guides with filters
exports.getGuides = async (req, res) => {
  try {
    const {
      specialization,
      city,
      minPrice,
      maxPrice,
      language,
      tourType,
      sortBy = 'rating',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filters = { status: 'active', 'availability.isAvailable': true };
    
    if (specialization) filters['profile.specializations'] = { $in: [specialization] };
    if (city) filters['services.locations.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filters['pricing.daily'] = {};
      if (minPrice) filters['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) filters['pricing.daily'].$lte = Number(maxPrice);
    }
    if (language) filters['profile.languages.language'] = { $in: [language] };
    if (tourType) filters['services.tourTypes'] = { $in: [tourType] };

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { 'pricing.daily': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.daily': -1 };
        break;
      case 'experience':
        sort = { 'profile.experience': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { 'rating.average': -1 };
    }

    const skip = (page - 1) * limit;
    
    const guides = await Guide.find(filters)
      .populate('user', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Guide.countDocuments(filters);

    res.json({
      success: true,
      guides,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ success: false, message: 'Error fetching guides' });
  }
};

// Get single guide by ID
exports.getGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('reviews');

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    res.json({ success: true, guide });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ success: false, message: 'Error fetching guide' });
  }
};

// Create new guide profile
exports.createGuide = async (req, res) => {
  try {
    // Check if user already has a guide profile
    const existingGuide = await Guide.findOne({ user: req.user.userId });
    if (existingGuide) {
      return res.status(400).json({ success: false, message: 'Guide profile already exists' });
    }

    const guideData = {
      ...req.body,
      user: req.user.userId
    };

    const guide = new Guide(guideData);
    await guide.save();

    res.status(201).json({ success: true, guide });
  } catch (error) {
    console.error('Create guide error:', error);
    res.status(500).json({ success: false, message: 'Error creating guide profile' });
  }
};

// Update guide profile
exports.updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Check ownership
    if (guide.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this guide profile' });
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, guide: updatedGuide });
  } catch (error) {
    console.error('Update guide error:', error);
    res.status(500).json({ success: false, message: 'Error updating guide profile' });
  }
};

// Delete guide profile
exports.deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Check ownership
    if (guide.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this guide profile' });
    }

    await Guide.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Guide profile deleted successfully' });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ success: false, message: 'Error deleting guide profile' });
  }
};

// Get guides by specialization
exports.getGuidesBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const guides = await Guide.find({
      'profile.specializations': specialization,
      status: 'active',
      'availability.isAvailable': true
    }).populate('user', 'name email phone');

    res.json({ success: true, guides });
  } catch (error) {
    console.error('Get guides by specialization error:', error);
    res.status(500).json({ success: false, message: 'Error fetching guides' });
  }
};

// Get guides by location
exports.getGuidesByLocation = async (req, res) => {
  try {
    const { city } = req.params;
    const guides = await Guide.find({
      'services.locations.city': { $regex: city, $options: 'i' },
      status: 'active',
      'availability.isAvailable': true
    }).populate('user', 'name email phone');

    res.json({ success: true, guides });
  } catch (error) {
    console.error('Get guides by location error:', error);
    res.status(500).json({ success: false, message: 'Error fetching guides' });
  }
};

// Update guide availability
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, schedule, availableFrom, availableTo, blackoutDates } = req.body;
    
    const guide = await Guide.findById(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Check ownership
    if (guide.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this guide' });
    }

    guide.availability = {
      ...guide.availability,
      isAvailable,
      schedule,
      availableFrom,
      availableTo,
      blackoutDates
    };

    await guide.save();
    res.json({ success: true, guide });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, message: 'Error updating availability' });
  }
};

// Verify guide (admin only)
exports.verifyGuide = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    guide.verification.isVerified = true;
      guide.verification.verifiedBy = req.user.userId;
    guide.verification.verifiedAt = new Date();
    guide.verification.verificationNotes = req.body.notes || '';
    guide.status = 'active';

    await guide.save();
    res.json({ success: true, guide });
  } catch (error) {
    console.error('Verify guide error:', error);
    res.status(500).json({ success: false, message: 'Error verifying guide' });
  }
};

// Get guide statistics
exports.getGuideStats = async (req, res) => {
  try {
    const stats = await Guide.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalGuides: { $sum: 1 },
          avgPrice: { $avg: '$pricing.daily' },
          avgRating: { $avg: '$rating.average' },
          avgExperience: { $avg: '$profile.experience' },
          bySpecialization: {
            $push: {
              specialization: '$profile.specializations',
              price: '$pricing.daily',
              rating: '$rating.average'
            }
          }
        }
      }
    ]);

    res.json({ success: true, stats: stats[0] || {} });
  } catch (error) {
    console.error('Get guide stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
};

// Get current guide's profile
exports.getMyProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId })
      .populate('user', 'name email profile')
      .populate('reviews.user', 'name');

    if (!guide) {
      // Create a default guide profile for guides who haven't set up their profile yet
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const defaultProfile = {
        user: req.user.userId,
        profile: {
          bio: 'Complete your guide profile to start receiving bookings',
          specializations: [],
          languages: [],
          experience: 0,
          certifications: []
        },
        services: {
          locations: [],
          tourTypes: [],
          groupSize: { min: 1, max: 10 }
        },
        pricing: {
          daily: 0,
          hourly: 0,
          currency: 'LKR'
        },
        availability: {
          isAvailable: false,
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: []
        },
        status: 'pending',
        rating: { average: 0, count: 0 },
        totalReviews: 0,
        isNewProfile: true,
        isVerified: false,
        location: 'Location not specified'
      };

      // Create the guide profile
      const newGuide = new Guide(defaultProfile);
      await newGuide.save();
      await newGuide.populate('user', 'name email profile');
      
      return res.json({ success: true, data: newGuide });
    }

    res.json({ success: true, data: guide });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching guide' });
  }
};

// Get current guide's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const GuideBooking = require('../models/GuideBooking');
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const bookings = await GuideBooking.find({ guide: req.user.userId })
      .populate('user', 'name email')
      .populate('tour', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await GuideBooking.countDocuments({ guide: req.user.userId });

    res.json({ 
      success: true, 
      data: {
        bookings: bookings || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBookings / limit),
          totalBookings: totalBookings || 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
};

// Update current guide's availability
exports.updateMyAvailability = async (req, res) => {
  try {
    const { isAvailable, workingHours, workingDays, languages } = req.body;

    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    // Update availability
    if (isAvailable !== undefined) guide.availability.isAvailable = isAvailable;
    if (workingHours) guide.availability.workingHours = workingHours;
    if (workingDays) guide.availability.workingDays = workingDays;
    if (languages) guide.profile.languages = languages;

    await guide.save();

    res.json({ success: true, message: 'Availability updated successfully', data: guide });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, message: 'Error updating availability' });
  }
};

// Create a basic guide profile for the current user
exports.createMyProfile = async (req, res) => {
  try {
    // Check if guide profile already exists
    const existingGuide = await Guide.findOne({ user: req.user.userId });
    if (existingGuide) {
      return res.status(400).json({ success: false, message: 'Guide profile already exists' });
    }

    // Get user details
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);

    // Create basic guide profile
    const guideData = {
      user: req.user.userId,
      profile: {
        bio: 'Professional tour guide with local expertise',
        specializations: ['cultural', 'nature', 'historical'],
        languages: [
          { language: 'English', proficiency: 'native' },
          { language: 'Sinhala', proficiency: 'fluent' }
        ],
        experience: 2,
        certifications: [{
          name: 'Tour Guide License',
          issuer: 'Sri Lanka Tourism Development Authority',
          date: new Date(),
          credentialId: 'SLG-' + Date.now()
        }]
      },
      services: {
        locations: [
          { city: 'Colombo', areas: ['Fort', 'Galle Face', 'Independence Square'] },
          { city: 'Kandy', areas: ['Temple of the Tooth', 'Botanical Gardens'] }
        ],
        tourTypes: ['private', 'group', 'day-trip'],
        groupSize: { min: 1, max: 15 }
      },
      pricing: {
        daily: 5000,
        hourly: 1000,
        currency: 'LKR'
      },
      availability: {
        isAvailable: true,
        workingHours: { start: '08:00', end: '18:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      status: 'active',
      rating: { average: 0, count: 0 },
      totalReviews: 0,
      isVerified: false,
      location: 'Colombo, Sri Lanka'
    };

    const guide = new Guide(guideData);
    await guide.save();

    // Populate the user data
    await guide.populate('user', 'name email profile');

    res.json({ success: true, message: 'Guide profile created successfully', data: guide });
  } catch (error) {
    console.error('Create guide profile error:', error);
    res.status(500).json({ success: false, message: 'Error creating guide profile' });
  }
};

// Update current guide's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    // Update profile fields
    const { bio, experience, specializations, languages, certifications, location } = req.body;
    
    if (bio !== undefined) guide.profile.bio = bio;
    if (experience !== undefined) guide.profile.experience = experience;
    if (specializations !== undefined) guide.profile.specializations = specializations;
    if (languages !== undefined) guide.profile.languages = languages;
    if (certifications !== undefined) guide.profile.certifications = certifications;
    if (location !== undefined) guide.location = location;

    await guide.save();
    await guide.populate('user', 'name email profile');

    res.json({ success: true, message: 'Profile updated successfully', data: guide });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// Update current guide's services
exports.updateMyServices = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    // Update services and pricing
    const { services, pricing } = req.body;
    
    if (services) {
      if (services.locations) guide.services.locations = services.locations;
      if (services.tourTypes) guide.services.tourTypes = services.tourTypes;
      if (services.groupSize) guide.services.groupSize = services.groupSize;
      if (services.duration) guide.services.duration = services.duration;
    }

    if (pricing) {
      if (pricing.hourly !== undefined) guide.pricing.hourly = pricing.hourly;
      if (pricing.daily !== undefined) guide.pricing.daily = pricing.daily;
      if (pricing.weekly !== undefined) guide.pricing.weekly = pricing.weekly;
      if (pricing.currency) guide.pricing.currency = pricing.currency;
      if (pricing.includes) guide.pricing.includes = pricing.includes;
      if (pricing.additionalCosts) guide.pricing.additionalCosts = pricing.additionalCosts;
    }

    await guide.save();
    await guide.populate('user', 'name email profile');

    res.json({ success: true, message: 'Services updated successfully', data: guide });
  } catch (error) {
    console.error('Update services error:', error);
    res.status(500).json({ success: false, message: 'Error updating services' });
  }
};

// Update current guide's availability
exports.updateMyAvailability = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    // Update availability fields
    const { isAvailable, workingHours, workingDays, timezone, breaks, blockedDates } = req.body;
    
    if (isAvailable !== undefined) guide.availability.isAvailable = isAvailable;
    if (workingHours) guide.availability.workingHours = workingHours;
    if (workingDays) guide.availability.workingDays = workingDays;
    if (timezone) guide.availability.timezone = timezone;
    if (breaks) guide.availability.breaks = breaks;
    if (blockedDates) guide.availability.blockedDates = blockedDates;

    await guide.save();
    await guide.populate('user', 'name email profile');

    res.json({ success: true, message: 'Availability updated successfully', data: guide });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, message: 'Error updating availability' });
  }
};

// Get guide earnings data
exports.getMyEarnings = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    
    // Get guide's bookings for earnings calculation
    const bookings = await TourBooking.find({ guide: req.user.userId })
      .populate('tour', 'title')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate earnings based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(year, now.getMonth(), 1);
        endDate = new Date(year, now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(year, quarter * 3, 1);
        endDate = new Date(year, quarter * 3 + 3, 0);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      default:
        startDate = new Date(year, now.getMonth(), 1);
        endDate = new Date(year, now.getMonth() + 1, 0);
    }

    // Filter bookings by date range
    const periodBookings = bookings.filter(booking => 
      booking.createdAt >= startDate && booking.createdAt <= endDate
    );

    // Calculate earnings
    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const thisMonthEarnings = periodBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const pendingPayouts = bookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const completedPayouts = bookings
      .filter(booking => booking.status === 'completed')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    // Platform fee calculation (10%)
    const platformFee = totalEarnings * 0.1;
    const netEarnings = totalEarnings - platformFee;

    // Recent transactions
    const transactions = bookings.slice(0, 10).map(booking => ({
      id: booking._id,
      date: booking.createdAt,
      type: 'booking',
      description: booking.tour?.title || 'Tour Booking',
      amount: booking.totalAmount || 0,
      status: booking.status,
      bookingId: booking.bookingId || booking._id.toString().slice(-6)
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalEarnings,
          thisMonth: thisMonthEarnings,
          lastMonth: 0, // Could be calculated with previous period
          pendingPayouts,
          completedPayouts,
          platformFee,
          netEarnings
        },
        transactions,
        period: { startDate, endDate, period }
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ success: false, message: 'Error fetching earnings data' });
  }
};

// Get guide reviews
exports.getMyReviews = async (req, res) => {
  try {
    const { rating, search, page = 1, limit = 10 } = req.query;
    
    // Build filter for reviews
    const filter = { guide: req.user.userId };
    if (rating) filter.rating = parseInt(rating);
    if (search) filter.comment = { $regex: search, $options: 'i' };

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .populate('booking', 'tour')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(filter);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { guide: req.user.userId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: {
              rating: '$rating',
              helpful: '$helpfulCount'
            }
          }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats.ratingDistribution.forEach(item => {
      if (distribution[item.rating] !== undefined) {
        distribution[item.rating]++;
      }
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalReviews / limit),
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        },
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          ratingDistribution: distribution,
          responseRate: 95 // Could be calculated based on actual responses
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// Get guide analytics
exports.getMyAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    
    // Get guide's bookings for analytics
    const bookings = await TourBooking.find({ guide: req.user.userId })
      .populate('tour', 'title')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate overview stats
    const totalBookings = bookings.length;
    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    // Get reviews for rating calculation
    const reviews = await Review.find({ guide: req.user.userId });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    const totalReviews = reviews.length;
    const conversionRate = 12.5; // Could be calculated based on inquiries vs bookings
    const responseRate = 95.2; // Could be calculated based on actual response times

    // Calculate trends (monthly data for the past 6 months)
    const trends = {
      bookings: [],
      earnings: [],
      ratings: []
    };

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthBookings = bookings.filter(booking => 
        booking.createdAt >= monthStart && booking.createdAt <= monthEnd
      );
      
      const monthEarnings = monthBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const monthReviews = reviews.filter(review => 
        review.createdAt >= monthStart && review.createdAt <= monthEnd
      );
      const monthRating = monthReviews.length > 0 
        ? monthReviews.reduce((sum, review) => sum + review.rating, 0) / monthReviews.length 
        : 0;

      trends.bookings.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        value: monthBookings.length
      });
      
      trends.earnings.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        value: monthEarnings
      });
      
      trends.ratings.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(monthRating * 10) / 10
      });
    }

    // Demographics analysis
    const demographics = {
      ageGroups: [
        { group: '18-25', count: Math.floor(totalBookings * 0.16), percentage: 16 },
        { group: '26-35', count: Math.floor(totalBookings * 0.29), percentage: 29 },
        { group: '36-45', count: Math.floor(totalBookings * 0.24), percentage: 24 },
        { group: '46-55', count: Math.floor(totalBookings * 0.18), percentage: 18 },
        { group: '55+', count: Math.floor(totalBookings * 0.13), percentage: 13 }
      ],
      countries: [
        { country: 'United States', count: Math.floor(totalBookings * 0.29), percentage: 29 },
        { country: 'United Kingdom', count: Math.floor(totalBookings * 0.21), percentage: 21 },
        { country: 'Australia', count: Math.floor(totalBookings * 0.18), percentage: 18 },
        { country: 'Canada', count: Math.floor(totalBookings * 0.16), percentage: 16 },
        { country: 'Germany', count: Math.floor(totalBookings * 0.16), percentage: 16 }
      ]
    };

    // Performance metrics
    const performance = {
      popularTours: [], // Could be calculated from actual tour data
      peakHours: [
        { hour: '9:00 AM', bookings: Math.floor(totalBookings * 0.08) },
        { hour: '10:00 AM', bookings: Math.floor(totalBookings * 0.12) },
        { hour: '11:00 AM', bookings: Math.floor(totalBookings * 0.10) },
        { hour: '2:00 PM', bookings: Math.floor(totalBookings * 0.14) },
        { hour: '3:00 PM', bookings: Math.floor(totalBookings * 0.12) },
        { hour: '4:00 PM', bookings: Math.floor(totalBookings * 0.10) }
      ],
      seasonalTrends: [
        { season: 'Spring', bookings: Math.floor(totalBookings * 0.29), revenue: Math.floor(totalEarnings * 0.29) },
        { season: 'Summer', bookings: Math.floor(totalBookings * 0.33), revenue: Math.floor(totalEarnings * 0.33) },
        { season: 'Autumn', bookings: Math.floor(totalBookings * 0.24), revenue: Math.floor(totalEarnings * 0.24) },
        { season: 'Winter', bookings: Math.floor(totalBookings * 0.14), revenue: Math.floor(totalEarnings * 0.14) }
      ]
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          totalEarnings,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          conversionRate,
          responseRate
        },
        trends,
        demographics,
        performance
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics data' });
  }
};

// Review management methods
exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if the review is for this guide
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide || review.guide.toString() !== guide._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this review' });
    }

    review.guideReply = {
      reply,
      repliedAt: new Date()
    };

    await review.save();

    res.json({ success: true, message: 'Reply posted successfully', data: review });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({ success: false, message: 'Error posting reply' });
  }
};

exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if the review is for this guide
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide || review.guide.toString() !== guide._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to report this review' });
    }

    review.reported = {
      reportedBy: req.user.userId,
      reason,
      reportedAt: new Date()
    };

    await review.save();

    res.json({ success: true, message: 'Review reported successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ success: false, message: 'Error reporting review' });
  }
};

exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if the review is for this guide
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide || review.guide.toString() !== guide._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark this review as helpful' });
    }

    // Increment helpful count
    review.helpfulCount = (review.helpfulCount || 0) + 1;

    await review.save();

    res.json({ success: true, message: 'Review marked as helpful', data: { helpfulCount: review.helpfulCount } });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ success: false, message: 'Error marking review as helpful' });
  }
};

// Settings management methods
exports.updateNotificationSettings = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    guide.settings = {
      ...guide.settings,
      notifications: req.body
    };

    await guide.save();

    res.json({ success: true, message: 'Notification settings updated successfully', data: guide.settings.notifications });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ success: false, message: 'Error updating notification settings' });
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    guide.settings = {
      ...guide.settings,
      privacy: req.body
    };

    await guide.save();

    res.json({ success: true, message: 'Privacy settings updated successfully', data: guide.settings.privacy });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ success: false, message: 'Error updating privacy settings' });
  }
};

exports.updatePaymentSettings = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    guide.settings = {
      ...guide.settings,
      payment: req.body
    };

    await guide.save();

    res.json({ success: true, message: 'Payment settings updated successfully', data: guide.settings.payment });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ success: false, message: 'Error updating payment settings' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Delete guide profile
    await Guide.findOneAndDelete({ user: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account deletion initiated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Error deleting account' });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const guide = await Guide.findOne({ user: req.user.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    // Update profile image URL (assuming file is uploaded to cloud storage)
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    guide.profileImage = imageUrl;
    await guide.save();

    res.json({ success: true, message: 'Profile image uploaded successfully', data: { imageUrl } });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile image' });
  }
};