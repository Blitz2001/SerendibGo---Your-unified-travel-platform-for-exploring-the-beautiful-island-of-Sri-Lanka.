import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, Calendar, Shield } from 'lucide-react';
import vehicleService from '../../services/vehicleService';

const VehicleCard = ({ vehicle, onBookNow }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const formattedVehicle = vehicleService.formatVehicleData(vehicle);
  const vehicleIcon = vehicleService.getVehicleTypeIcon(vehicle.type);
  const vehicleTypeName = vehicleService.getVehicleTypeDisplayName(vehicle.type);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getFeatureIcon = (feature) => {
    const iconMap = {
      ac: '❄️',
      wifi: '📶',
      gps: '🧭',
      entertainment: '🎵',
      wheelchair: '♿',
      child_seat: '👶',
      luggage_rack: '🎒',
      roof_rack: '📦',
      '4wd': '🚙',
      automatic: '⚙️',
      manual: '🔄'
    };
    return iconMap[feature] || '✓';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {!imageError && vehicle.images && vehicle.images[0] ? (
          <img
            src={vehicle.images[0].url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className={`w-full h-full object-cover ${isImageLoading ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
            <div className="text-6xl">{vehicleIcon}</div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
            {formattedVehicle.statusDisplay}
          </span>
        </div>

        {/* Rating Badge */}
        {vehicle.rating && vehicle.rating.average > 0 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-800">
              {formattedVehicle.ratingDisplay}
            </span>
          </div>
        )}

        {/* Vehicle Type Badge */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {vehicleIcon} {vehicleTypeName}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Vehicle Title and Brand */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-gray-600 text-sm">
            {vehicle.year} • {formattedVehicle.formattedCapacity}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{formattedVehicle.formattedLocation}</span>
        </div>

        {/* Features Preview */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {vehicle.features.slice(0, 4).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  title={feature.replace('_', ' ')}
                >
                  <span className="mr-1">{getFeatureIcon(feature)}</span>
                  {feature.replace('_', ' ')}
                </span>
              ))}
              {vehicle.features.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{vehicle.features.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-600">
              {formattedVehicle.formattedPrice}
            </span>
            <span className="text-gray-500 text-sm">per day</span>
          </div>
          
          {/* Additional pricing options */}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            {vehicle.pricing?.weekly && (
              <span>Weekly: {vehicleService.formatPrice(vehicle.pricing.weekly, vehicle.pricing.currency)}</span>
            )}
            {vehicle.pricing?.monthly && (
              <span>Monthly: {vehicleService.formatPrice(vehicle.pricing.monthly, vehicle.pricing.currency)}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Insurance Status */}
        {vehicle.insurance?.hasInsurance && (
          <div className="flex items-center text-green-600 text-sm mb-4">
            <Shield className="w-4 h-4 mr-2" />
            <span>Fully Insured</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Link
              to={`/vehicles/${vehicle._id}`}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
            >
              View Details
            </Link>
            
            <button
              onClick={() => onBookNow(vehicle)}
              disabled={!formattedVehicle.isAvailable}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                formattedVehicle.isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {formattedVehicle.isAvailable ? 'Book Now' : 'Not Available'}
            </button>
          </div>

          {/* Rental Options */}
          {formattedVehicle.isAvailable && (
            <div className="grid grid-cols-2 gap-2">
              {vehicle.pricing?.hourly && (
                <button
                  onClick={() => onBookNow(vehicle, 'rental', 'hourly')}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  ⏰ Hourly Rent
                </button>
              )}
              {vehicle.pricing?.daily && (
                <button
                  onClick={() => onBookNow(vehicle, 'rental', 'daily')}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  📅 Daily Rent
                </button>
              )}
              {vehicle.pricing?.weekly && (
                <button
                  onClick={() => onBookNow(vehicle, 'rental', 'weekly')}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                >
                  📆 Weekly Rent
                </button>
              )}
              {vehicle.pricing?.monthly && (
                <button
                  onClick={() => onBookNow(vehicle, 'rental', 'monthly')}
                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  🗓️ Monthly Rent
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{vehicle.capacity} seats</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{vehicle.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
