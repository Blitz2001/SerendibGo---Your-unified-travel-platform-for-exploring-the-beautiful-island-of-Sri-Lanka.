import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, Star, Calendar, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import vehicleService from '../../services/vehicleService';
import { useAuth } from '../../contexts/AuthContext';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicleById(id);
        
        if (response.success) {
          setVehicle(response.vehicle);
        } else {
          setError(response.message || 'Failed to load vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a vehicle');
      navigate('/login', { state: { from: location } });
      return;
    }

    // Navigate to booking page with vehicle ID
    navigate(`/vehicles/${id}/book`);
  };

  const formatPrice = (price, currency = 'LKR') => {
    if (!price) return `${currency} 0`;
    return `${currency} ${price.toLocaleString()}`;
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The vehicle you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/vehicles')} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const formattedVehicle = vehicleService.formatVehicleData(vehicle);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/vehicles')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                🚗 Vehicles
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-sm font-medium text-gray-500">{vehicle.brand} {vehicle.model}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
              {vehicle.images && vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[selectedImage]?.url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                  <div className="text-8xl">🚗</div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {formattedVehicle.statusDisplay}
                </span>
              </div>

              {/* Rating Badge */}
              {vehicle.rating && vehicle.rating.average > 0 && (
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-800">
                    {formattedVehicle.ratingDisplay}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${vehicle.brand} ${vehicle.model} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {vehicle.year}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {vehicle.capacity} passengers
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {vehicle.location?.city || 'Location not specified'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(vehicle.pricing?.daily, vehicle.pricing?.currency)}
                  </span>
                </div>
                {vehicle.pricing?.weekly && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weekly Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(vehicle.pricing.weekly, vehicle.pricing.currency)}
                    </span>
                  </div>
                )}
                {vehicle.pricing?.monthly && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(vehicle.pricing.monthly, vehicle.pricing.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 capitalize">{feature.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Insurance */}
            {vehicle.insurance?.hasInsurance && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Fully Insured</span>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  This vehicle is fully insured for your safety and peace of mind.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/vehicles')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Vehicles
              </button>
              
              <button
                onClick={handleBookNow}
                disabled={!formattedVehicle.isAvailable}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  formattedVehicle.isAvailable
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {formattedVehicle.isAvailable ? 'Book Now' : 'Not Available'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;

