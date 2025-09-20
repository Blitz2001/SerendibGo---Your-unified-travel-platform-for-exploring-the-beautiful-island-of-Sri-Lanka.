const Hotel = require('../models/Hotel');
const User = require('../models/User');

// @route   GET /api/hotels
// @desc    Get all hotels with filtering and pagination
// @access  Public
const getHotels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      starRating,
      city,
      minPrice,
      maxPrice,
      amenities,
      checkIn,
      checkOut,
      guests = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - show all hotels for admin, active only for public
    const filter = {};
    
    // Only filter by isActive if showAll is not requested (for admin content management)
    if (!req.query.showAll) {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (starRating) filter.starRating = { $gte: parseInt(starRating) };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };

    // Price filtering
    if (minPrice || maxPrice) {
      filter['rooms.price'] = {};
      if (minPrice) filter['rooms.price'].$gte = parseInt(minPrice);
      if (maxPrice) filter['rooms.price'].$lte = parseInt(maxPrice);
    }

    // Amenities filtering
    if (amenities) {
      const amenityArray = amenities.split(',');
      filter.amenities = { $all: amenityArray };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build aggregation pipeline - simplified for debugging
    const pipeline = [
      { $match: filter },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    // Add availability check if dates are provided
    if (checkIn && checkOut) {
      pipeline.push({
        $addFields: {
          availableRoomsForDates: {
            $sum: {
              $map: {
                input: '$rooms',
                as: 'room',
                in: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$$room.isAvailable', true] },
                        { $gte: ['$$room.availableRooms', parseInt(guests)] }
                      ]
                    },
                    '$$room.availableRooms',
                    0
                  ]
                }
              }
            }
          }
        }
      });

      pipeline.push({
        $match: {
          availableRoomsForDates: { $gt: 0 }
        }
      });
    }

    // Add sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortOptions });

    // Pagination already added to pipeline above

    // Test basic match first
    console.log('Hotel filter:', JSON.stringify(filter, null, 2));
    const basicMatch = await Hotel.find(filter);
    console.log('Basic find result:', basicMatch.length, 'hotels found');
    
    // Execute aggregation
    console.log('Hotel pipeline:', JSON.stringify(pipeline, null, 2));
    const hotels = await Hotel.aggregate(pipeline);
    console.log('Aggregation result:', hotels.length, 'hotels found');

    // Get total count for pagination
    const totalCount = await Hotel.countDocuments(filter);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalHotels: totalCount,
          hotelsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// @access  Public
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('rating.reviews.user', 'name');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel is not available'
      });
    }

    res.json({
      success: true,
      data: {
        hotel: hotel.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Get hotel by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/hotels
// @desc    Create a new hotel
// @access  Private (Hotel owners only)
const createHotel = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      starRating,
      location,
      contact,
      amenities,
      images,
      rooms,
      policies
    } = req.body;

    // Check if user is a hotel owner
    if (req.user.role !== 'hotel_owner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only hotel owners can create hotels.'
      });
    }

    // Create new hotel
    const hotel = new Hotel({
      name,
      description,
      category,
      starRating,
      location,
      contact,
      amenities,
      images,
      rooms,
      policies,
      owner: req.user.userId
    });

    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: {
        hotel: hotel.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Create hotel error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/hotels/:id
// @desc    Update hotel
// @access  Private (Hotel owner or admin only)
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check if user owns the hotel or is admin
    if (hotel.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own hotels.'
      });
    }

    // Update hotel fields
    const updateFields = req.body;
    delete updateFields.owner; // Prevent changing ownership
    delete updateFields.isVerified; // Only admins can change verification status

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        hotel[key] = updateFields[key];
      }
    });

    await hotel.save();

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: {
        hotel: hotel.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update hotel error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel
// @access  Private (Hotel owner or admin only)
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check if user owns the hotel or is admin
    if (hotel.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own hotels.'
      });
    }

    // Soft delete - set isActive to false
    hotel.isActive = false;
    await hotel.save();

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });

  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/hotels/owner/my-hotels
// @desc    Get hotels owned by current user
// @access  Private (Hotel owners only)
const getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.userId })
      .select('name category starRating location images rating isActive isVerified createdAt');

    res.json({
      success: true,
      data: {
        hotels
      }
    });

  } catch (error) {
    console.error('Get my hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/hotels/:id/reviews
// @desc    Add review to hotel
// @access  Private (Authenticated users only)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const hotelId = req.params.id;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review inactive hotel'
      });
    }

    // Check if user already reviewed this hotel
    const existingReview = hotel.rating.reviews.find(
      review => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }

    // Add review
    hotel.rating.reviews.push({
      user: req.user.userId,
      rating,
      comment,
      date: new Date()
    });

    // Update average rating
    const totalRating = hotel.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
    hotel.rating.average = totalRating / hotel.rating.reviews.length;
    hotel.rating.count = hotel.rating.reviews.length;

    await hotel.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: {
          rating,
          comment,
          date: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/hotels/seed
// @desc    Create sample hotels for development
// @access  Public (development only)
const createSampleHotels = async (req, res) => {
  try {
    // Check if hotels already exist
    const existingHotels = await Hotel.countDocuments();
    if (existingHotels > 0) {
      return res.json({
        success: true,
        message: 'Sample hotels already exist',
        count: existingHotels
      });
    }

    // Create a sample hotel owner user if it doesn't exist
    let sampleOwner = await User.findOne({ email: 'sample.owner@serendibgo.com' });
    if (!sampleOwner) {
      sampleOwner = await User.create({
        name: 'Sample Hotel Owner',
        email: 'sample.owner@serendibgo.com',
        password: 'SampleOwner123!',
        role: 'hotel_owner',
        phone: '+94712345678',
        isVerified: true
      });
    }

    const sampleHotels = [
      {
        name: "Tropical Paradise Resort",
        description: "Luxurious beachfront resort with stunning ocean views, world-class amenities, and exceptional service. Perfect for romantic getaways and family vacations.",
        category: "luxury",
        starRating: 5,
        location: {
          address: {
            street: "123 Beach Road",
            city: "Galle",
            state: "Southern Province",
            zipCode: "80000",
            country: "Sri Lanka"
          },
          coordinates: {
            latitude: 6.0535,
            longitude: 80.2210
          },
          nearbyAttractions: [
            { name: "Galle Fort", distance: 2.5, type: "tourist_attraction" },
            { name: "Unawatuna Beach", distance: 1.0, type: "beach" }
          ]
        },
        owner: sampleOwner._id,
        contact: {
          phone: "+94712223333",
          email: "info@tropicalparadise.com",
          website: "https://tropicalparadise.com"
        },
        amenities: [
          "swimming_pool", "spa", "gym", "restaurant", "bar", "beach_access",
          "room_service", "concierge", "parking"
        ],
        rooms: [
          {
            name: "Deluxe Ocean View",
            type: "deluxe",
            capacity: 2,
            price: 25000,
            description: "Spacious room with panoramic ocean views",
            totalRooms: 20,
            availableRooms: 15,
            amenities: ["air_conditioning", "tv", "minibar", "balcony", "ocean_view"]
          },
          {
            name: "Family Suite",
            type: "suite",
            capacity: 4,
            price: 35000,
            description: "Perfect for families with separate living area",
            totalRooms: 10,
            availableRooms: 8,
            amenities: ["air_conditioning", "tv", "minibar", "balcony", "ocean_view"]
          }
        ],
        policies: {
          cancellation: "Free cancellation up to 24 hours before check-in",
          checkIn: "14:00",
          checkOut: "11:00"
        },
        isVerified: true,
        featured: true
      },
      {
        name: "Mountain View Lodge",
        description: "Cozy mountain retreat surrounded by lush greenery and breathtaking views. Ideal for nature lovers and those seeking tranquility.",
        category: "comfort",
        starRating: 4,
        location: {
          address: {
            street: "456 Mountain Road",
            city: "Nuwara Eliya",
            state: "Central Province",
            zipCode: "22200",
            country: "Sri Lanka"
          },
          coordinates: {
            latitude: 6.9497,
            longitude: 79.8604
          },
          nearbyAttractions: [
            { name: "Tea Gardens", distance: 1.5, type: "tourist_attraction" },
            { name: "Horton Plains", distance: 15.0, type: "mountain" }
          ]
        },
        owner: sampleOwner._id,
        contact: {
          phone: "+94724445555",
          email: "info@mountainviewlodge.com",
          website: "https://mountainviewlodge.com"
        },
        amenities: [
          "restaurant", "bar", "garden", "terrace", "mountain_view",
          "parking", "room_service"
        ],
        rooms: [
          {
            name: "Standard Room",
            type: "double",
            capacity: 2,
            price: 12000,
            description: "Comfortable room with mountain views",
            totalRooms: 25,
            availableRooms: 20,
            amenities: ["air_conditioning", "tv", "balcony", "mountain_view"]
          },
          {
            name: "Deluxe Suite",
            type: "deluxe",
            capacity: 3,
            price: 18000,
            description: "Luxurious suite with fireplace",
            totalRooms: 8,
            availableRooms: 6,
            amenities: ["air_conditioning", "tv", "minibar", "balcony", "mountain_view"]
          }
        ],
        policies: {
          cancellation: "Free cancellation up to 48 hours before check-in",
          checkIn: "15:00",
          checkOut: "10:00"
        },
        isVerified: true
      },
      {
        name: "City Center Hotel",
        description: "Modern hotel in the heart of Colombo, perfect for business travelers and tourists. Close to shopping, dining, and cultural attractions.",
        category: "first_class",
        starRating: 4,
        location: {
          address: {
            street: "789 City Street",
            city: "Colombo",
            state: "Western Province",
            zipCode: "10000",
            country: "Sri Lanka"
          },
          coordinates: {
            latitude: 6.9271,
            longitude: 79.8612
          },
          nearbyAttractions: [
            { name: "Galle Face Green", distance: 0.5, type: "tourist_attraction" },
            { name: "Colombo Fort", distance: 1.0, type: "city_center" }
          ]
        },
        owner: sampleOwner._id,
        contact: {
          phone: "+94716667777",
          email: "info@citycenterhotel.com",
          website: "https://citycenterhotel.com"
        },
        amenities: [
          "restaurant", "bar", "gym", "business_center", "conference_room",
          "parking", "room_service", "concierge"
        ],
        rooms: [
          {
            name: "Business Room",
            type: "double",
            capacity: 2,
            price: 15000,
            description: "Efficient room for business travelers",
            totalRooms: 30,
            availableRooms: 20,
            amenities: ["air_conditioning", "tv", "desk", "city_view"]
          },
          {
            name: "Executive Suite",
            type: "suite",
            capacity: 2,
            price: 25000,
            description: "Premium suite with city skyline views",
            totalRooms: 12,
            availableRooms: 10,
            amenities: ["air_conditioning", "tv", "minibar", "balcony", "city_view"]
          }
        ],
        policies: {
          cancellation: "Free cancellation up to 24 hours before check-in",
          checkIn: "14:00",
          checkOut: "11:00"
        },
        isVerified: true
      }
    ];

    // Create hotels with sample owner
    const createdHotels = await Hotel.insertMany(sampleHotels);

    res.status(201).json({
      success: true,
      message: 'Sample hotels created successfully',
      count: createdHotels.length,
      hotels: createdHotels
    });

  } catch (error) {
    console.error('Create sample hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating sample hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/hotels/search/nearby
// @desc    Search hotels near specific coordinates
// @access  Public
const searchNearbyHotels = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const hotels = await Hotel.find({
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    })
    .limit(parseInt(limit))
    .select('name category starRating location images rating averageRoomPrice');

    res.json({
      success: true,
      data: {
        hotels,
        searchParams: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius: parseFloat(radius),
          resultsCount: hotels.length
        }
      }
    });

  } catch (error) {
    console.error('Search nearby hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching nearby hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getMyHotels,
  addReview,
  searchNearbyHotels,
  createSampleHotels
};
