import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourService from '../services/tourService';

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    minPrice: '',
    maxPrice: '',
    duration: ''
  });

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      const response = await tourService.getTours();
      if (response.success) {
        setTours(response.data.tours);
      } else {
        setError('Failed to load tours');
      }
    } catch (err) {
      setError('Failed to load tours');
      console.error('Error loading tours:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.easy;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      cultural: '🏛️',
      adventure: '🏔️',
      beach: '🏖️',
      wildlife: '🦁',
      historical: '📜',
      religious: '🙏',
      nature: '🌿',
      food: '🍽️',
      shopping: '🛍️',
      wellness: '🧘'
    };
    return icons[category] || '🗺️';
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading amazing tours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTours}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🗺️ Discover Amazing Tours
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the beauty of Sri Lanka with our carefully curated tour packages. 
            From cultural experiences to adventure activities, we have something for everyone.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Tours</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="cultural">Cultural</option>
                <option value="adventure">Adventure</option>
                <option value="beach">Beach</option>
                <option value="wildlife">Wildlife</option>
                <option value="historical">Historical</option>
                <option value="religious">Religious</option>
                <option value="nature">Nature</option>
                <option value="food">Food</option>
                <option value="shopping">Shopping</option>
                <option value="wellness">Wellness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                name="duration"
                value={filters.duration}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Duration</option>
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="4">4 Days</option>
                <option value="5">5+ Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tours Grid */}
        {tours.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 text-lg">No tours available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour._id}
                to={`/tours/${tour._id}`}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={tour.images && tour.images[0] ? tour.images[0].url : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                    alt={tour.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-2xl">{getCategoryIcon(tour.category)}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                  </div>
                  {tour.rating && (
                    <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-1">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-xs font-medium">{tour.rating.average}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tour.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(tour.price, tour.currency)}
                    </span>
                    <span className="text-sm text-gray-500">{tour.duration} day{tour.duration > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 capitalize">{tour.location}</span>
                    <span className="text-sm text-gray-500 capitalize">{tour.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600">
          Showing {tours.length} tour{tours.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  );
};

export default ToursPage;
