import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Users, Star, Car, Van, Bus, Jeep, Motorcycle, Bicycle, Boat, Helicopter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VehiclesPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
    features: []
  });
  const [sortBy, setSortBy] = useState('rating');

  const vehicleTypes = [
    { value: 'car', label: 'Car', icon: Car },
    { value: 'van', label: 'Van', icon: Van },
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'jeep', label: 'Jeep', icon: Jeep },
    { value: 'motorcycle', label: 'Motorcycle', icon: Motorcycle },
    { value: 'bicycle', label: 'Bicycle', icon: Bicycle },
    { value: 'boat', label: 'Boat', icon: Boat },
    { value: 'helicopter', label: 'Helicopter', icon: Helicopter }
  ];

  const features = [
    'ac', 'wifi', 'gps', 'entertainment', 'wheelchair', 'child_seat', 
    'luggage_rack', 'roof_rack', '4wd', 'automatic', 'manual'
  ];

  useEffect(() => {
    fetchVehicles();
  }, [filters, sortBy]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.capacity) queryParams.append('capacity', filters.capacity);
      if (filters.features.length > 0) queryParams.append('features', filters.features.join(','));
      queryParams.append('sortBy', sortBy);

      const response = await fetch(`/api/vehicles?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      } else {
        toast.error('Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Error loading vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleVehicleSelect = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
      features: []
    });
    setSortBy('rating');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Find Your Perfect Vehicle
        </h1>
          <p className="text-xl text-center mb-8 max-w-2xl mx-auto">
            Explore Sri Lanka with comfort and style. Choose from our wide selection of vehicles for every adventure.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-2 flex items-center shadow-lg">
              <Search className="text-gray-400 ml-4 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search for vehicles, locations, or features..."
                className="flex-1 p-3 text-gray-800 outline-none"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
              <button
                onClick={fetchVehicles}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Filter size={20} className="mr-2" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Vehicle Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Vehicle Type</h4>
                <div className="space-y-2">
                  {vehicleTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={filters.type === type.value}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                          className="text-blue-600"
                        />
                        <IconComponent size={16} />
                        <span>{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range (LKR)</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Capacity Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Passenger Capacity</h4>
                <select
                  value={filters.capacity}
                  onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Any Capacity</option>
                  <option value="1-2">1-2 Passengers</option>
                  <option value="3-5">3-5 Passengers</option>
                  <option value="6-10">6-10 Passengers</option>
                  <option value="10+">10+ Passengers</option>
                </select>
              </div>

              {/* Features Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Features</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="text-blue-600"
                      />
                      <span className="capitalize">{feature.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Available Vehicles ({vehicles.length})
              </h2>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No vehicles found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleVehicleSelect(vehicle._id)}
                  >
                    {/* Vehicle Image */}
                    <div className="relative h-48 bg-gray-200">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images.find(img => img.isPrimary)?.url || vehicle.images[0].url}
                          alt={vehicle.brand + ' ' + vehicle.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Car size={48} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                        {vehicle.type.toUpperCase()}
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span>{vehicle.location?.city || 'Location not specified'}</span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-1" />
                          <span>{vehicle.capacity} passengers</span>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star size={16} className="mr-1" />
                          <span>{vehicle.rating?.average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">
                          LKR {vehicle.pricing?.daily?.toLocaleString()}
                        </div>
                        <span className="text-gray-500 text-sm">per day</span>
                      </div>

                      {/* Features Tags */}
                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {vehicle.features.slice(0, 3).map((feature) => (
                            <span
                              key={feature}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs capitalize"
                            >
                              {feature.replace('_', ' ')}
                            </span>
                          ))}
                          {vehicle.features.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                              +{vehicle.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
