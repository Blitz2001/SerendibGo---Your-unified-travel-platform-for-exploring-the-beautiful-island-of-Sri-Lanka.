import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Star, Globe, BookOpen, Camera, Mountain, Utensils, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GuidesPage = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    language: '',
    tourType: ''
  });
  const [sortBy, setSortBy] = useState('rating');

  const specializations = [
    { value: 'cultural', label: 'Cultural', icon: BookOpen },
    { value: 'historical', label: 'Historical', icon: Globe },
    { value: 'wildlife', label: 'Wildlife', icon: Mountain },
    { value: 'adventure', label: 'Adventure', icon: Mountain },
    { value: 'culinary', label: 'Culinary', icon: Utensils },
    { value: 'photography', label: 'Photography', icon: Camera },
    { value: 'nature', label: 'Nature', icon: Heart },
    { value: 'religious', label: 'Religious', icon: BookOpen },
    { value: 'archaeological', label: 'Archaeological', icon: Globe },
    { value: 'eco-tourism', label: 'Eco-Tourism', icon: Heart }
  ];

  const tourTypes = [
    'private', 'group', 'custom', 'day-trip', 'multi-day', 'luxury', 'budget', 'family', 'couple', 'solo'
  ];

  const languages = [
    'English', 'Sinhala', 'Tamil', 'German', 'French', 'Spanish', 'Italian', 'Chinese', 'Japanese', 'Korean'
  ];

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.specialization) queryParams.append('specialization', filters.specialization);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.language) queryParams.append('language', filters.language);
      if (filters.tourType) queryParams.append('tourType', filters.tourType);
      queryParams.append('sortBy', sortBy);

      const response = await fetch(`/api/guides?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setGuides(data.guides || []);
      } else {
        toast.error('Failed to fetch guides');
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      toast.error('Error loading guides');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGuideSelect = (guideId) => {
    navigate(`/guides/${guideId}`);
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      language: '',
      tourType: ''
    });
    setSortBy('rating');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Find Your Perfect Guide
        </h1>
          <p className="text-xl text-center mb-8 max-w-2xl mx-auto">
            Discover Sri Lanka with expert local guides. Choose from our certified professionals for an unforgettable experience.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-2 flex items-center shadow-lg">
              <Search className="text-gray-400 ml-4 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search for guides, specializations, or locations..."
                className="flex-1 p-3 text-gray-800 outline-none"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
              <button
                onClick={fetchGuides}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
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
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Clear All
                </button>
              </div>

              {/* Specialization Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Specialization</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {specializations.map((spec) => {
                    const IconComponent = spec.icon;
                    return (
                      <label key={spec.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="specialization"
                          value={spec.value}
                          checked={filters.specialization === spec.value}
                          onChange={(e) => handleFilterChange('specialization', e.target.value)}
                          className="text-green-600"
                        />
                        <IconComponent size={16} />
                        <span>{spec.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tour Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Tour Type</h4>
                <select
                  value={filters.tourType}
                  onChange={(e) => handleFilterChange('tourType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Any Tour Type</option>
                  {tourTypes.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Language</h4>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Any Language</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
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
                  <option value="experience">Most Experienced</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guides Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Available Guides ({guides.length})
              </h2>
            </div>

            {guides.length === 0 ? (
              <div className="text-center py-12">
                <Globe size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No guides found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <div
                    key={guide._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleGuideSelect(guide._id)}
                  >
                    {/* Guide Image */}
                    <div className="relative h-48 bg-gray-200">
                      {guide.profile?.profileImage?.url ? (
                        <img
                          src={guide.profile.profileImage.url}
                          alt={guide.profile.profileImage.caption}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Globe size={48} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                        {guide.profile?.specializations?.[0]?.toUpperCase() || 'GUIDE'}
                      </div>
                    </div>

                    {/* Guide Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {guide.user?.name || 'Professional Guide'}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span>
                          {guide.services?.locations?.[0]?.city || 'Location not specified'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-1" />
                          <span>
                            {guide.services?.groupSize?.min}-{guide.services?.groupSize?.max} people
                          </span>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star size={16} className="mr-1" />
                          <span>{guide.rating?.average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {guide.profile?.bio || 'Professional tour guide with extensive experience.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-green-600">
                          LKR {guide.pricing?.daily?.toLocaleString()}
                        </div>
                        <span className="text-gray-500 text-sm">per day</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/guides/${guide._id}`);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/guides/${guide._id}/book`);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Book Now
                        </button>
                      </div>

                      {/* Specializations Tags */}
                      {guide.profile?.specializations && guide.profile.specializations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {guide.profile.specializations.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs capitalize"
                            >
                              {spec.replace('-', ' ')}
                            </span>
                          ))}
                          {guide.profile.specializations.length > 3 && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                              +{guide.profile.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Languages */}
                      {guide.profile?.languages && guide.profile.languages.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Languages: {guide.profile.languages.map(l => l.language).join(', ')}
                          </span>
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

export default GuidesPage;
