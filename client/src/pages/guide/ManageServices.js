import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, MapPin, Users, Clock } from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';

const ManageServices = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState({
    locations: [],
    tourTypes: [],
    groupSize: { min: 1, max: 20 },
    duration: { min: 1, max: 14 }
  });

  const [pricing, setPricing] = useState({
    hourly: 0,
    daily: 0,
    weekly: 0,
    currency: 'LKR',
    includes: [],
    additionalCosts: []
  });

  const [newLocation, setNewLocation] = useState({ city: '', areas: [] });
  const [newArea, setNewArea] = useState('');
  const [newAdditionalCost, setNewAdditionalCost] = useState({ description: '', amount: 0, currency: 'LKR' });

  const tourTypeOptions = ['private', 'group', 'custom', 'day-trip', 'multi-day', 'luxury', 'budget', 'family', 'couple', 'solo'];
  const includesOptions = ['transportation', 'meals', 'entrance_fees', 'equipment', 'insurance', 'accommodation', 'none'];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await guideService.getMyProfile();
      if (response.success && response.data.services) {
        setServices(response.data.services);
        setPricing(response.data.pricing || pricing);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    }
  };

  const handleTourTypeToggle = (tourType) => {
    setServices(prev => ({
      ...prev,
      tourTypes: (prev.tourTypes || []).includes(tourType)
        ? (prev.tourTypes || []).filter(t => t !== tourType)
        : [...(prev.tourTypes || []), tourType]
    }));
  };

  const handleIncludesToggle = (include) => {
    setPricing(prev => ({
      ...prev,
      includes: (prev.includes || []).includes(include)
        ? (prev.includes || []).filter(i => i !== include)
        : [...(prev.includes || []), include]
    }));
  };

  const addArea = () => {
    if (newArea.trim()) {
      setNewLocation(prev => ({
        ...prev,
        areas: [...prev.areas, newArea.trim()]
      }));
      setNewArea('');
    }
  };

  const removeArea = (index) => {
    setNewLocation(prev => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index)
    }));
  };

  const addLocation = () => {
    if (newLocation.city.trim()) {
      setServices(prev => ({
        ...prev,
        locations: [...(prev.locations || []), { ...newLocation }]
      }));
      setNewLocation({ city: '', areas: [] });
    }
  };

  const removeLocation = (index) => {
    setServices(prev => ({
      ...prev,
      locations: (prev.locations || []).filter((_, i) => i !== index)
    }));
  };

  const addAdditionalCost = () => {
    if (newAdditionalCost.description.trim()) {
      setPricing(prev => ({
        ...prev,
        additionalCosts: [...(prev.additionalCosts || []), { ...newAdditionalCost }]
      }));
      setNewAdditionalCost({ description: '', amount: 0, currency: 'LKR' });
    }
  };

  const removeAdditionalCost = (index) => {
    setPricing(prev => ({
      ...prev,
      additionalCosts: (prev.additionalCosts || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await guideService.updateServices({ services, pricing });
      if (response.success) {
        toast.success('Services updated successfully!');
        navigate('/guide/dashboard');
      } else {
        toast.error(response.message || 'Failed to update services');
      }
    } catch (error) {
      console.error('Error updating services:', error);
      toast.error('Failed to update services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/guide/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
          <p className="text-gray-600 mt-2">Update your tour offerings and pricing</p>
        </div>

        <div className="space-y-8">
          {/* Locations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Service Locations
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(services.locations || []).map((location, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{location.city}</h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">Areas:</p>
                          <div className="flex flex-wrap gap-2">
                            {(location.areas || []).map((area, areaIndex) => (
                              <span key={areaIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLocation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Location</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={newLocation.city || ''}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Colombo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Areas</label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newArea || ''}
                        onChange={(e) => setNewArea(e.target.value)}
                        placeholder="e.g., Fort"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addArea()}
                      />
                      <button
                        type="button"
                        onClick={addArea}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Area
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(newLocation.areas || []).map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded flex items-center">
                          {area}
                          <button
                            onClick={() => removeArea(index)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addLocation}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Location
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Types */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Tour Types</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {tourTypeOptions.map((type) => (
                  <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(services.tourTypes || []).includes(type)}
                        onChange={() => handleTourTypeToggle(type)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    <span className="text-sm text-gray-700 capitalize">{type.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Group Size & Duration */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Group Size & Duration
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={services.groupSize.min}
                      onChange={(e) => setServices(prev => ({
                        ...prev,
                        groupSize: { ...prev.groupSize, min: parseInt(e.target.value) || 1 }
                      }))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      value={services.groupSize.max}
                      onChange={(e) => setServices(prev => ({
                        ...prev,
                        groupSize: { ...prev.groupSize, max: parseInt(e.target.value) || 20 }
                      }))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={services.duration.min}
                      onChange={(e) => setServices(prev => ({
                        ...prev,
                        duration: { ...prev.duration, min: parseInt(e.target.value) || 1 }
                      }))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      value={services.duration.max}
                      onChange={(e) => setServices(prev => ({
                        ...prev,
                        duration: { ...prev.duration, max: parseInt(e.target.value) || 14 }
                      }))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={pricing.hourly || 0}
                      onChange={(e) => setPricing(prev => ({ ...prev, hourly: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                      {pricing.currency}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={pricing.daily || 0}
                      onChange={(e) => setPricing(prev => ({ ...prev, daily: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                      {pricing.currency}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rate</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={pricing.weekly || 0}
                      onChange={(e) => setPricing(prev => ({ ...prev, weekly: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                      {pricing.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">What's Included</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {includesOptions.map((include) => (
                    <label key={include} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(pricing.includes || []).includes(include)}
                        onChange={() => handleIncludesToggle(include)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{include.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Costs</label>
                <div className="space-y-2 mb-4">
                  {(pricing.additionalCosts || []).map((cost, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{cost.description} - {cost.amount} {cost.currency}</span>
                      <button
                        onClick={() => removeAdditionalCost(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAdditionalCost.description || ''}
                    onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={newAdditionalCost.amount || 0}
                    onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    placeholder="Amount"
                    min="0"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addAdditionalCost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate('/guide/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
