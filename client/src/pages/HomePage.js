import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourService from '../services/tourService';
import vehicleService from '../services/vehicleService';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tours and vehicles in parallel
        const [toursResponse, vehiclesResponse] = await Promise.all([
          tourService.getTours({ limit: 6 }),
          vehicleService.getVehicles({ limit: 6 })
        ]);

        if (toursResponse.success) {
          setTours(toursResponse.data.tours);
        }

        if (vehiclesResponse.success) {
          setVehicles(vehiclesResponse.data?.vehicles || vehiclesResponse.vehicles || []);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">SerendibGo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your unified travel platform for exploring the beautiful island of Sri Lanka. 
            Discover amazing tours, book hotels, hire guides, rent vehicles, and create unforgettable memories.
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/tours" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              🗺️ Explore Tours
            </Link>
            <Link to="/hotels" className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              🏨 Find Hotels
            </Link>
            <Link to="/vehicles" className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              🚗 Rent Vehicles
            </Link>
            <Link to="/guides" className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
              👨‍💼 Hire Guides
            </Link>
            <Link to="/plan-trip" className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              🎯 Plan Your Trip
            </Link>
          </div>
          
          {/* Featured Tours Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
              🗺️ Featured Tours from Database
            </h2>
            {tours.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🗺️</div>
                <p className="text-gray-600 text-lg">No tours available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <Link key={tour._id} to={`/tours/${tour._id}`} className="block">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                      <img
                        src={tour.images && tour.images[0] ? tour.images[0].url : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                        alt={tour.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {tour.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {tour.description}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {tour.currency} {tour.price?.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">{tour.duration} day{tour.duration > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 capitalize">{tour.category}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm text-gray-600 ml-1">
                              {tour.rating?.average || 0} ({tour.rating?.count || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Featured Vehicles Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
              🚗 Featured Vehicles for Rent
            </h2>
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <p className="text-gray-600 text-lg">No vehicles available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => {
                  const vehicleIcon = vehicleService.getVehicleTypeIcon(vehicle.type);
                  const vehicleTypeName = vehicleService.getVehicleTypeDisplayName(vehicle.type);
                  
                  return (
                    <Link key={vehicle._id} to={`/vehicles/${vehicle._id}`} className="block">
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                          {vehicle.images && vehicle.images[0] ? (
                            <img 
                              src={vehicle.images[0].url}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-6xl">{vehicleIcon}</div>
                            </div>
                          )}
                          
                          {/* Vehicle Type Badge */}
                          <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {vehicleIcon} {vehicleTypeName}
                          </div>
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              vehicle.status === 'active' 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'
                            }`}>
                              {vehicle.status === 'active' ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm">
                            {vehicle.year} • {vehicle.capacity} passenger{vehicle.capacity > 1 ? 's' : ''}
                          </p>
                          
                          {vehicle.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                              {vehicle.description}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-2xl font-bold text-purple-600">
                              LKR {vehicle.pricing?.daily?.toLocaleString() || 0}
                            </span>
                            <span className="text-sm text-gray-500">per day</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{vehicle.location?.city || 'Location'}</span>
                            <div className="flex items-center">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm text-gray-600 ml-1">
                                {vehicle.rating?.average?.toFixed(1) || 0.0} ({vehicle.rating?.count || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* View All Vehicles Button */}
            <div className="text-center mt-8">
              <Link
                to="/vehicles"
                className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🚗 View All Vehicles
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Status Info */}
          <div className="mt-20 p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🚀 Development Status
            </h3>
            <p className="text-green-700">
              <strong>Backend:</strong> ✅ Running with MongoDB Atlas on port 5001<br/>
              <strong>Frontend:</strong> ✅ React app loaded successfully<br/>
              <strong>Database:</strong> ✅ MongoDB Atlas connected with real data<br/>
              <strong>API:</strong> ✅ Real-time data fetching working<br/>
              <strong>Vehicles:</strong> ✅ New vehicle system fully implemented
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
