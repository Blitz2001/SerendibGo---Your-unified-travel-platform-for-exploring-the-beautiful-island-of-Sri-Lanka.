import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import hotelService from '../services/hotelService';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStarRating, setSelectedStarRating] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Load hotels when component mounts
  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hotelService.getHotels();
      
      if (response.success) {
        setHotels(response.data.hotels);
      } else {
        setError(response.message || 'Failed to load hotels');
      }
    } catch (err) {
      setError('Error loading hotels. Please try again.');
      console.error('Load hotels error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter hotels based on search criteria
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || hotel.category === selectedCategory;
    const matchesStarRating = !selectedStarRating || hotel.starRating >= parseInt(selectedStarRating);
    const matchesPrice = !priceRange.min || hotel.averageRoomPrice >= parseInt(priceRange.min);
    const matchesMaxPrice = !priceRange.max || hotel.averageRoomPrice <= parseInt(priceRange.max);
    
    return matchesSearch && matchesCategory && matchesStarRating && matchesPrice && matchesMaxPrice;
  });

  const categories = ['luxury', 'business', 'resort', 'boutique', 'budget', 'family'];
  const starRatings = [5, 4, 3, 2, 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadHotels}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Hotels</h1>
          <p className="text-xl text-gray-600">Find the perfect accommodation for your stay in Sri Lanka</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Hotels</label>
              <input
                type="text"
                placeholder="Search by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
              <select
                value={selectedStarRating}
                onChange={(e) => setSelectedStarRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ratings</option>
                {starRatings.map(rating => (
                  <option key={rating} value={rating}>{rating}+ Stars</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (LKR)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredHotels.length} of {hotels.length} hotels
          </p>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedStarRating('');
                setPriceRange({ min: '', max: '' });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <motion.div
                key={hotel._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Hotel Image */}
                <div className="relative h-48">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0].url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  
                  {/* Star Rating Badge */}
                  <div className="absolute top-3 right-3 bg-yellow-400 text-white px-2 py-1 rounded-full text-sm font-medium">
                    ⭐ {hotel.starRating}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {hotel.category?.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <span className="mr-2">📍</span>
                    <span>
                      {hotel.location?.address?.city}, {hotel.location?.address?.state}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {hotel.description}
                  </p>

                  {/* Amenities Preview */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            {hotelService.formatAmenityName(amenity)}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {hotel.averageRoomPrice ? `LKR ${hotel.averageRoomPrice.toLocaleString()}` : 'Price on request'}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                    
                    <Link
                      to={`/hotels/${hotel._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;
