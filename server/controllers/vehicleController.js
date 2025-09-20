const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Get all vehicles with filters
exports.getVehicles = async (req, res) => {
  try {
    const {
      type,
      city,
      minPrice,
      maxPrice,
      capacity,
      features,
      sortBy = 'rating',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filters = {};
    
    // Only filter by status if showAll is not requested (for admin content management)
    if (!req.query.showAll) {
      filters.status = 'active';
    }
    
    if (type) filters.type = type;
    if (city) filters['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filters['pricing.daily'] = {};
      if (minPrice) filters['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) filters['pricing.daily'].$lte = Number(maxPrice);
    }
    if (capacity) {
      const [min, max] = capacity.split('-').map(Number);
      if (max) {
        filters.capacity = { $gte: min, $lte: max };
      } else {
        filters.capacity = { $gte: min };
      }
    }
    if (features && features.length > 0) {
      filters.features = { $in: features.split(',') };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { 'pricing.daily': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.daily': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popularity':
        sort = { 'rating.count': -1 };
        break;
      default:
        sort = { 'rating.average': -1 };
    }

    const skip = (page - 1) * limit;
    
    const vehicles = await Vehicle.find(filters)
      .populate('owner', 'name email phone')
      .populate('driver', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Vehicle.countDocuments(filters);

    res.json({
      success: true,
      vehicles,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalVehicles: total,
        vehiclesPerPage: Number(limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ success: false, message: 'Error fetching vehicles' });
  }
};

// Get single vehicle by ID
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('driver', 'name email phone');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ success: false, message: 'Error fetching vehicle' });
  }
};

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      owner: req.user.userId
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'License plate already exists' });
    }
    res.status(500).json({ success: false, message: 'Error creating vehicle' });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, vehicle: updatedVehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ success: false, message: 'Error updating vehicle' });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ success: false, message: 'Error deleting vehicle' });
  }
};

// Get vehicles by owner
exports.getVehiclesByOwner = async (req, res) => {
  try {
    let ownerId = req.params.ownerId;
    
    // If the request is for "my-vehicles", use the authenticated user's ID
    if (ownerId === 'my-vehicles') {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      ownerId = req.user.userId;
    }

    const vehicles = await Vehicle.find({ owner: ownerId })
      .populate('owner', 'name email phone')
      .populate('driver', 'name email phone');

    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('Get vehicles by owner error:', error);
    res.status(500).json({ success: false, message: 'Error fetching vehicles' });
  }
};

// Update vehicle availability
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, availableFrom, availableTo, blackoutDates } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
    }

    vehicle.availability = {
      ...vehicle.availability,
      isAvailable,
      availableFrom,
      availableTo,
      blackoutDates
    };

    await vehicle.save();
    res.json({ success: true, vehicle });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, message: 'Error updating availability' });
  }
};

// Get vehicle statistics
exports.getVehicleStats = async (req, res) => {
  try {
    const stats = await Vehicle.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          avgPrice: { $avg: '$pricing.daily' },
          avgRating: { $avg: '$rating.average' },
          byType: {
            $push: {
              type: '$type',
              price: '$pricing.daily',
              rating: '$rating.average'
            }
          }
        }
      }
    ]);

    res.json({ success: true, stats: stats[0] || {} });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
};
