import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import vehicleService from '../../services/vehicleService';
import VehicleSearchFilters from '../../components/vehicles/VehicleSearchFilters';
import VehicleCard from '../../components/vehicles/VehicleCard';
import VehicleRentalModal from '../../components/vehicles/VehicleRentalModal';
import { useAuth } from '../../contexts/AuthContext';

const VehiclesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
    features: [],
    checkIn: '',
    checkOut: '',
    rentalDuration: '', // New: rental duration filter
    rentalType: 'daily', // New: hourly, daily, weekly, monthly
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVehicles: 0,
    vehiclesPerPage: 12
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Load vehicles based on current filters and pagination
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.vehiclesPerPage
      };

      // Remove empty filters
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || 
            (Array.isArray(searchParams[key]) && searchParams[key].length === 0)) {
          delete searchParams[key];
        }
      });

      const response = await vehicleService.getVehicles(searchParams);

      if (response.success) {
        setVehicles(response.data?.vehicles || response.vehicles || []);
        
        // Update pagination if the API provides it
        if (response.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.data.pagination,
            totalVehicles: response.data.pagination.totalVehicles || 0
          }));
        } else if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.pagination,
            totalVehicles: response.pagination.totalVehicles || 0
          }));
        } else {
          // Fallback: set totalVehicles to the length of vehicles array
          setPagination(prev => ({
            ...prev,
            totalVehicles: (response.data?.vehicles || response.vehicles || []).length
          }));
        }
      } else {
        setError(response.message || 'Failed to load vehicles');
        toast.error(response.message || 'Failed to load vehicles');
        setVehicles([]);
        setPagination(prev => ({ ...prev, totalVehicles: 0 }));
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Failed to load vehicles. Please try again.');
      toast.error('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.vehiclesPerPage]);

  // Load vehicles on component mount and when filters change
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadVehicles();
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle booking
  const handleBookNow = (vehicle, bookingType = 'booking', type = null) => {
    if (bookingType === 'rental') {
      // Open rental modal
      if (!isAuthenticated) {
        toast.error('Please log in to rent a vehicle');
        navigate('/login');
        return;
      }
      
      setSelectedVehicle(vehicle);
      setShowRentalModal(true);
    } else {
      // Regular booking flow
      if (filters.checkIn && filters.checkOut) {
        // Navigate to vehicle booking page with dates
        navigate(`/vehicles/${vehicle._id}/book`, {
          state: {
            checkIn: filters.checkIn,
            checkOut: filters.checkOut
          }
        });
      } else {
        // Navigate to vehicle detail page
        navigate(`/vehicles/${vehicle._id}`);
      }
    }
  };

  // Handle rental confirmation
  const handleConfirmRental = async (rentalInfo) => {
    try {
      // Here you would typically call a rental service
      // For now, we'll simulate the rental process
      toast.success('Rental request submitted successfully!');
      setShowRentalModal(false);
      
      // Navigate to rental confirmation or booking page
      navigate(`/vehicles/${rentalInfo.vehicleId}/rental-confirmation`, {
        state: { rentalInfo }
      });
    } catch (error) {
      console.error('Error confirming rental:', error);
      toast.error('Failed to submit rental request. Please try again.');
    }
  };

  // Handle vehicle type filter change
  const handleVehicleTypeChange = (type) => {
    handleFiltersChange({ ...filters, type, currentPage: 1 });
  };

  // Quick filter buttons for popular vehicle types
  const popularTypes = [
    { value: 'car', label: '🚗 Cars', count: 0 },
    { value: 'van', label: '🚐 Vans', count: 0 },
    { value: 'jeep', label: '🚙 Jeeps', count: 0 },
    { value: 'motorcycle', label: '🏍️ Motorcycles', count: 0 }
  ];

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading amazing vehicles...</p>
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚗 Find Your Perfect Vehicle
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from a wide selection of vehicles including cars, vans, jeeps, motorcycles, and more. 
              All vehicles are carefully maintained and fully insured for your safety.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Type Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleVehicleTypeChange('')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                filters.type === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🚗 All Vehicles
            </button>
            {popularTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleVehicleTypeChange(type.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  filters.type === type.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <VehicleSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : `${pagination.totalVehicles} Vehicles Found`}
            </h2>
            {filters.type && (
              <p className="text-gray-600 mt-1">
                Showing {vehicleService.getVehicleTypeDisplayName(filters.type)}s
              </p>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {/* Vehicles Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : vehicles.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No vehicles found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search criteria or browse all available vehicles.
              </p>
              <button
                onClick={() => {
                  setFilters({
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
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="vehicles-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {vehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onBookNow={handleBookNow}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === pagination.currentPage;
                const isNearCurrent = Math.abs(page - pagination.currentPage) <= 2;
                
                if (isCurrentPage || isNearCurrent || page === 1 || page === pagination.totalPages) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        isCurrentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === 2 || page === pagination.totalPages - 1) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Rental Modal */}
        <VehicleRentalModal
          isOpen={showRentalModal}
          onClose={() => setShowRentalModal(false)}
          vehicle={selectedVehicle}
          onConfirmRental={handleConfirmRental}
        />
      </div>
    </div>
  );
};

export default VehiclesPage;
