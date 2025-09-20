import React, { useState } from 'react';
import { Search, Filter, MapPin, Calendar, Users } from 'lucide-react';

const VehicleSearchFilters = ({ filters, onFiltersChange, onSearch }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const vehicleTypes = [
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'van', label: 'Van', icon: '🚐' },
    { value: 'bus', label: 'Bus', icon: '🚌' },
    { value: 'jeep', label: 'Jeep', icon: '🚙' },
    { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
    { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
    { value: 'boat', label: 'Boat', icon: '🚤' },
    { value: 'helicopter', label: 'Helicopter', icon: '🚁' }
  ];

  const features = [
    'ac', 'wifi', 'gps', 'entertainment', 'wheelchair', 'child_seat', 
    'luggage_rack', 'roof_rack', '4wd', 'automatic', 'manual'
  ];

  const cities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Polonnaruwa',
    'Sigiriya', 'Mirissa', 'Unawatuna', 'Ella', 'Nuwara Eliya', 'Trincomalee'
  ];

  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = filters.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    onFiltersChange({
      ...filters,
      features: newFeatures
    });
  };

  const handleReset = () => {
    onFiltersChange({
      type: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
      features: [],
      checkIn: '',
      checkOut: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleSearch = () => {
    onSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* Search Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Vehicle</h2>
        </div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>{showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters</span>
        </button>
      </div>

      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Capacity
          </label>
          <select
            value={filters.capacity || ''}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Capacity</option>
            <option value="1">1 passenger</option>
            <option value="2">2 passengers</option>
            <option value="4">4 passengers</option>
            <option value="6">6 passengers</option>
            <option value="8">8+ passengers</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Daily Price
          </label>
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice || ''}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Pick-up Date
              </label>
              <input
                type="date"
                value={filters.checkIn || ''}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Return Date
              </label>
              <input
                type="date"
                value={filters.checkOut || ''}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Daily Price (LKR)
              </label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Daily Price (LKR)
              </label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {features.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.features?.includes(feature) || false}
                    onChange={() => handleFeatureToggle(feature)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {feature.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="capacity">Capacity</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
        <button
          onClick={handleSearch}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
        >
          Search Vehicles
        </button>
      </div>
    </div>
  );
};

export default VehicleSearchFilters;
