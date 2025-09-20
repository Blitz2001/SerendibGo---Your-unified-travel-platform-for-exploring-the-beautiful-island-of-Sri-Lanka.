import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, Search, Plane, Hotel, Car, Map, Heart, Plus, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import tourService from '../services/tourService';
import hotelService from '../services/hotelService';
import vehicleService from '../services/vehicleService';
import tripRequestService from '../services/tripRequestService';
import { useAuth } from '../contexts/AuthContext';

const TripPlanningPage = () => {
  const { user } = useAuth();
  
  const [searchParams, setSearchParams] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    guests: 1,
    budget: '',
    interests: []
  });

  const [recommendations, setRecommendations] = useState({
    tours: [],
    hotels: [],
    vehicles: []
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Custom Trip Request State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTripData, setCustomTripData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    travelers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    budget: {
      minBudget: '',
      maxBudget: '',
      currency: 'LKR'
    },
    destinations: [{ name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }],
    preferences: {
      accommodation: 'any',
      transportation: 'any',
      mealPlan: 'any',
      specialRequirements: [],
      interests: []
    },
    contactInfo: {
      phone: '',
      preferredContactMethod: 'email',
      timeZone: 'Asia/Colombo'
    },
    tags: []
  });
  const [submittingCustomTrip, setSubmittingCustomTrip] = useState(false);

  const interestOptions = [
    'cultural', 'adventure', 'nature', 'beach', 'wildlife', 'historical', 'religious', 'food', 'shopping'
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const [toursRes, hotelsRes, vehiclesRes] = await Promise.all([
        tourService.getTours({ location: searchParams.destination, limit: 6 }),
        hotelService.getHotels({ city: searchParams.destination, limit: 6 }),
        vehicleService.getVehicles({ limit: 6 })
      ]);

      setRecommendations({
        tours: toursRes.success ? (toursRes.data?.tours || []) : [],
        hotels: hotelsRes.success ? (hotelsRes.data?.hotels || []) : [],
        vehicles: vehiclesRes.success ? (vehiclesRes.data?.vehicles || vehiclesRes.vehicles || []) : []
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setSearchParams(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const calculateTripDuration = () => {
    if (searchParams.startDate && searchParams.endDate) {
      const start = new Date(searchParams.startDate);
      const end = new Date(searchParams.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const estimatedBudget = () => {
    const duration = calculateTripDuration();
    if (duration === 0) return 0;
    
    let total = 0;
    // Hotel cost (assuming average $50-100 per night)
    total += duration * 75 * searchParams.guests;
    // Food cost (assuming $30-50 per day per person)
    total += duration * 40 * searchParams.guests;
    // Transportation (assuming $20-40 per day)
    total += duration * 30;
    // Activities (assuming $50-100 per day)
    total += duration * 75;
    
    return Math.round(total);
  };

  // Custom Trip Request Functions
  const handleCustomTripSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a custom trip request');
      return;
    }

    setSubmittingCustomTrip(true);
    try {
      const response = await tripRequestService.createTripRequest(customTripData);
      
      if (response.success) {
        toast.success('Custom trip request submitted successfully! Our team will review it and contact you soon.');
        setShowCustomForm(false);
        setCustomTripData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          travelers: { adults: 1, children: 0, infants: 0 },
          budget: { minBudget: '', maxBudget: '', currency: 'LKR' },
          destinations: [{ name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }],
          preferences: { accommodation: 'any', transportation: 'any', mealPlan: 'any', specialRequirements: [], interests: [] },
          contactInfo: { phone: '', preferredContactMethod: 'email', timeZone: 'Asia/Colombo' },
          tags: []
        });
      } else {
        toast.error(response.message || 'Failed to submit trip request');
      }
    } catch (error) {
      console.error('Error submitting custom trip:', error);
      toast.error('Error submitting trip request. Please try again.');
    } finally {
      setSubmittingCustomTrip(false);
    }
  };

  const addDestination = () => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }]
    }));
  };

  const removeDestination = (index) => {
    if (customTripData.destinations.length > 1) {
      setCustomTripData(prev => ({
        ...prev,
        destinations: prev.destinations.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDestination = (index, field, value) => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
  };

  const addActivity = (destIndex) => {
    const activity = prompt('Enter activity name:');
    if (activity) {
      updateDestination(destIndex, 'activities', [...customTripData.destinations[destIndex].activities, activity]);
    }
  };

  const removeActivity = (destIndex, activityIndex) => {
    updateDestination(destIndex, 'activities', 
      customTripData.destinations[destIndex].activities.filter((_, i) => i !== activityIndex)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🗺️ Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing destinations, find the best accommodations, and plan your dream vacation with our comprehensive trip planning tools.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              {showCustomForm ? 'Hide Custom Trip Request' : 'Request Custom Trip'}
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Destination
              </label>
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={searchParams.destination}
                onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Travel Dates
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={searchParams.startDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-2" />
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={searchParams.guests}
                onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What interests you?
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    searchParams.interests.includes(interest)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Search className="w-5 h-5 mr-2" />
                  Plan My Trip
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Custom Trip Request Form */}
        {showCustomForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ✨ Request Your Custom Trip
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Have a specific trip in mind? Tell us your requirements and our travel experts will create a personalized itinerary just for you. We'll coordinate with hotels, guides, and service providers to make your dream trip a reality.
              </p>
            </div>

            <form onSubmit={handleCustomTripSubmit} className="space-y-8">
              {/* Basic Trip Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTripData.title}
                    onChange={(e) => setCustomTripData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Romantic Beach Getaway to Galle"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customTripData.contactInfo.phone}
                    onChange={(e) => setCustomTripData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={customTripData.description}
                  onChange={(e) => setCustomTripData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your ideal trip, what you want to see, do, and experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Travel Dates and Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={customTripData.startDate}
                    onChange={(e) => setCustomTripData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={customTripData.endDate}
                    onChange={(e) => setCustomTripData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adults *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={customTripData.travelers.adults}
                    onChange={(e) => setCustomTripData(prev => ({ 
                      ...prev, 
                      travelers: { ...prev.travelers, adults: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={customTripData.travelers.children}
                    onChange={(e) => setCustomTripData(prev => ({ 
                      ...prev, 
                      travelers: { ...prev.travelers, children: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget *
                  </label>
                  <input
                    type="number"
                    required
                    value={customTripData.budget.minBudget}
                    onChange={(e) => setCustomTripData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, minBudget: parseInt(e.target.value) }
                    }))}
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget *
                  </label>
                  <input
                    type="number"
                    required
                    value={customTripData.budget.maxBudget}
                    onChange={(e) => setCustomTripData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, maxBudget: parseInt(e.target.value) }
                    }))}
                    placeholder="150000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={customTripData.budget.currency}
                    onChange={(e) => setCustomTripData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, currency: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LKR">LKR (Sri Lankan Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
              </div>

              {/* Destinations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Destinations & Activities</h3>
                  <button
                    type="button"
                    onClick={addDestination}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Destination
                  </button>
                </div>
                
                {customTripData.destinations.map((destination, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Destination {index + 1}</h4>
                      {customTripData.destinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDestination(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={destination.name}
                          onChange={(e) => updateDestination(index, 'name', e.target.value)}
                          placeholder="e.g., Kandy, Galle, Ella"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (days) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={destination.duration}
                          onChange={(e) => updateDestination(index, 'duration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accommodation Type
                        </label>
                        <select
                          value={destination.accommodation}
                          onChange={(e) => updateDestination(index, 'accommodation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="any">Any</option>
                          <option value="hotel">Hotel</option>
                          <option value="guesthouse">Guesthouse</option>
                          <option value="resort">Resort</option>
                          <option value="homestay">Homestay</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget for this destination
                        </label>
                        <input
                          type="number"
                          value={destination.budget}
                          onChange={(e) => updateDestination(index, 'budget', parseInt(e.target.value))}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activities & Interests
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {destination.activities.map((activity, activityIndex) => (
                          <span
                            key={activityIndex}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                          >
                            {activity}
                            <button
                              type="button"
                              onClick={() => removeActivity(index, activityIndex)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addActivity(index)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        + Add Activity
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accommodation Level
                    </label>
                    <select
                      value={customTripData.preferences.accommodation}
                      onChange={(e) => setCustomTripData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, accommodation: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="any">Any</option>
                      <option value="budget">Budget</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transportation
                    </label>
                    <select
                      value={customTripData.preferences.transportation}
                      onChange={(e) => setCustomTripData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, transportation: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="any">Any</option>
                      <option value="public">Public Transport</option>
                      <option value="private">Private Vehicle</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Plan
                    </label>
                    <select
                      value={customTripData.preferences.mealPlan}
                      onChange={(e) => setCustomTripData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, mealPlan: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="any">Any</option>
                      <option value="bed-breakfast">Bed & Breakfast</option>
                      <option value="half-board">Half Board</option>
                      <option value="full-board">Full Board</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submittingCustomTrip}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                  {submittingCustomTrip ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-5 h-5 mr-2" />
                      Submit Custom Trip Request
                    </div>
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-3">
                  Our travel experts will review your request and contact you within 24 hours to discuss your personalized itinerary.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Trip Summary */}
        {searchParams.startDate && searchParams.endDate && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Trip Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Duration</h3>
                <p className="text-2xl font-bold text-blue-600">{calculateTripDuration()} days</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Travelers</h3>
                <p className="text-2xl font-bold text-green-600">{searchParams.guests}</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Map className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Destination</h3>
                <p className="text-lg font-bold text-purple-600">{searchParams.destination || 'Not specified'}</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Interests</h3>
                <p className="text-lg font-bold text-yellow-600">{searchParams.interests.length}</p>
              </div>
            </div>
            
            {calculateTripDuration() > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Estimated Budget</h3>
                <p className="text-3xl font-bold text-blue-600">${estimatedBudget().toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">
                  This includes accommodation, food, transportation, and activities for {searchParams.guests} traveler{searchParams.guests > 1 ? 's' : ''} over {calculateTripDuration()} days.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.tours.length > 0 || recommendations.hotels.length > 0 || recommendations.vehicles.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Personalized Recommendations</h2>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('tours')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'tours'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tours ({recommendations.tours.length})
              </button>
              <button
                onClick={() => setActiveTab('hotels')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'hotels'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hotels ({recommendations.hotels.length})
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'vehicles'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vehicles ({recommendations.vehicles.length})
              </button>
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Tours */}
                {recommendations.tours.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Plane className="w-5 h-5 mr-2 text-blue-600" />
                      Recommended Tours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.tours.slice(0, 3).map((tour) => (
                        <Link key={tour._id} to={`/tours/${tour._id}`} className="block">
                          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                              src={tour.images && tour.images[0] ? tour.images[0].url : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                              alt={tour.title}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{tour.title}</h4>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {tour.duration} days
                                </span>
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  {tour.rating?.average || 'N/A'}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-blue-600 mt-2">
                                {tour.currency} {tour.price?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotels */}
                {recommendations.hotels.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Hotel className="w-5 h-5 mr-2 text-green-600" />
                      Recommended Hotels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.hotels.slice(0, 3).map((hotel) => (
                        <Link key={hotel._id} to={`/hotels/${hotel._id}`} className="block">
                          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                              src={hotel.images && hotel.images[0] ? hotel.images[0].url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'}
                              alt={hotel.name}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{hotel.name}</h4>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  {hotel.starRating} stars
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {hotel.location?.city || hotel.location?.address?.city || 'Location not specified'}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-green-600 mt-2">
                                From {hotel.rooms?.[0]?.currency || 'LKR'} {hotel.rooms?.[0]?.price?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicles */}
                {recommendations.vehicles.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Car className="w-5 h-5 mr-2 text-purple-600" />
                      Recommended Vehicles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.vehicles.slice(0, 3).map((vehicle) => (
                        <Link key={vehicle._id} to={`/vehicles/${vehicle._id}`} className="block">
                          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                              src={vehicle.images && vehicle.images[0] ? vehicle.images[0].url : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500'}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{vehicle.brand} {vehicle.model}</h4>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {vehicle.capacity} seats
                                </span>
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  {vehicle.rating?.average || 'N/A'}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-purple-600 mt-2">
                                {vehicle.pricing?.currency || 'LKR'} {vehicle.pricing?.daily?.toLocaleString() || 'N/A'}/day
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tours' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.tours.map((tour) => (
                  <Link key={tour._id} to={`/tours/${tour._id}`} className="block">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={tour.images && tour.images[0] ? tour.images[0].url : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                        alt={tour.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{tour.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-blue-600">
                            {tour.currency} {tour.price?.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">{tour.duration} days</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.hotels.map((hotel) => (
                  <Link key={hotel._id} to={`/hotels/${hotel._id}`} className="block">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={hotel.images && hotel.images[0] ? hotel.images[0].url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'}
                        alt={hotel.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{hotel.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            From {hotel.rooms?.[0]?.currency || 'LKR'} {hotel.rooms?.[0]?.price?.toLocaleString() || 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500">{hotel.starRating} stars</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.vehicles.map((vehicle) => (
                  <Link key={vehicle._id} to={`/vehicles/${vehicle._id}`} className="block">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={vehicle.images && vehicle.images[0] ? vehicle.images[0].url : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500'}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{vehicle.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-purple-600">
                            {vehicle.pricing?.currency || 'LKR'} {vehicle.pricing?.daily?.toLocaleString() || 'N/A'}/day
                          </span>
                          <span className="text-sm text-gray-500">{vehicle.capacity} seats</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Plan Your Trip?</h3>
            <p className="text-gray-600 mb-6">
              Fill in your travel preferences above and click "Plan My Trip" to get personalized recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Plane className="w-4 h-4 mr-2 text-blue-600" />
                Tours
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Hotel className="w-4 h-4 mr-2 text-green-600" />
                Hotels
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Car className="w-4 h-4 mr-2 text-purple-600" />
                Vehicles
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanningPage;
