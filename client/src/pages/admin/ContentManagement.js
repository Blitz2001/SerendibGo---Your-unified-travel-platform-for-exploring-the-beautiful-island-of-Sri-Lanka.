import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Building2, 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Search,
  DollarSign,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import tourService from '../../services/tourService';
import hotelService from '../../services/hotelService';
import vehicleService from '../../services/vehicleService';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('tours');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const tabs = [
    { id: 'tours', label: 'Tours', icon: MapPin, count: tours.length },
    { id: 'hotels', label: 'Hotels', icon: Building2, count: hotels.length },
    { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    loadContent();
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Content Management - State Updated:', {
      tours: tours.length,
      hotels: hotels.length,
      vehicles: vehicles.length
    });
  }, [tours, hotels, vehicles]);


  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API - use same parameters as tourist view with cache busting
      const timestamp = Date.now();
      const [toursResponse, hotelsResponse, vehiclesResponse] = await Promise.all([
        tourService.getTours({ limit: 100, _t: timestamp }), // Same as tourist view + cache bust
        hotelService.getHotels({ limit: 100, _t: timestamp }), // Same as tourist view + cache bust
        vehicleService.getVehicles({ limit: 100, _t: timestamp }) // Same as tourist view + cache bust
      ]);

      // Extract data from responses
      const toursData = toursResponse?.data?.tours || [];
      const hotelsData = hotelsResponse?.data?.hotels || [];
      const vehiclesData = vehiclesResponse?.vehicles || [];
      
      // Debug logging
      console.log('Content Management - API Responses:', {
        toursCount: toursData.length,
        hotelsCount: hotelsData.length,
        vehiclesCount: vehiclesData.length
      });

      // Transform data to match the expected format
      const transformedTours = toursData.map(tour => ({
        _id: tour._id,
        title: tour.title,
        description: tour.description,
        duration: `${tour.duration} day${tour.duration > 1 ? 's' : ''}`,
        price: tour.price,
        status: tour.isActive ? 'active' : 'inactive',
        location: tour.location,
        category: tour.category,
        rating: tour.rating?.average || 0,
        bookings: tour.bookings?.length || 0,
        createdAt: tour.createdAt,
        image: tour.images?.[0]?.url || '/images/placeholder-tour.jpg'
      }));

      const transformedHotels = hotelsData.map(hotel => ({
        _id: hotel._id,
        name: hotel.name,
        description: hotel.description,
        location: hotel.location?.address?.city || hotel.location?.city || 'Unknown',
        starRating: hotel.starRating,
        pricePerNight: hotel.rooms?.[0]?.price || 0,
        status: hotel.isActive ? 'active' : 'inactive',
        rooms: hotel.rooms?.length || 0,
        amenities: hotel.amenities || [],
        rating: hotel.rating?.average || 0,
        bookings: hotel.bookings?.length || 0,
        createdAt: hotel.createdAt,
        image: hotel.images?.[0]?.url || '/images/placeholder-hotel.jpg'
      }));

      const transformedVehicles = vehiclesData.map(vehicle => ({
        _id: vehicle._id,
        name: `${vehicle.brand} ${vehicle.model}`,
        type: vehicle.type,
        capacity: vehicle.capacity,
        pricePerDay: vehicle.pricing?.daily || 0,
        status: vehicle.status === 'active' ? 'active' : 'inactive',
        location: vehicle.location?.city || 'Unknown',
        features: vehicle.features || [],
        rating: vehicle.rating?.average || 0,
        bookings: vehicle.bookings?.length || 0,
        createdAt: vehicle.createdAt,
        image: vehicle.images?.[0]?.url || '/images/placeholder-vehicle.jpg'
      }));

      console.log('Content Management - Setting State:', {
        transformedTours: transformedTours.length,
        transformedHotels: transformedHotels.length,
        transformedVehicles: transformedVehicles.length
      });
      
      setTours(transformedTours);
      setHotels(transformedHotels);
      setVehicles(transformedVehicles);
      
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content from database');
      
      // Fallback to empty arrays if API fails
      setTours([]);
      setHotels([]);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      // Mock API call - in real implementation, this would be an actual API call
      switch (type) {
        case 'tours':
          setTours(tours.map(tour => 
            tour._id === id ? { ...tour, status: newStatus } : tour
          ));
          break;
        case 'hotels':
          setHotels(hotels.map(hotel => 
            hotel._id === id ? { ...hotel, status: newStatus } : hotel
          ));
          break;
        case 'vehicles':
          setVehicles(vehicles.map(vehicle => 
            vehicle._id === id ? { ...vehicle, status: newStatus } : vehicle
          ));
          break;
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Mock API call - in real implementation, this would be an actual API call
        switch (type) {
          case 'tours':
            setTours(tours.filter(tour => tour._id !== id));
            break;
          case 'hotels':
            setHotels(hotels.filter(hotel => hotel._id !== id));
            break;
          case 'vehicles':
            setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
            break;
        }
        toast.success('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'tours': return tours;
      case 'hotels': return hotels;
      case 'vehicles': return vehicles;
      default: return [];
    }
  };

  const getFilteredData = () => {
    let data = getCurrentData();
    
    if (searchTerm) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }
    
    return data;
  };

  const ContentCard = ({ item, type }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Image Placeholder</span>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {item.title || item.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {item.location}
            </span>
            {item.rating && (
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {item.rating}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            {item.price || item.pricePerNight || item.pricePerDay}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusChange(item._id, 'active', type)}
              className="text-green-600 hover:text-green-800"
              title="Approve"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleStatusChange(item._id, 'rejected', type)}
              className="text-red-600 hover:text-red-800"
              title="Reject"
            >
              <XCircle className="h-4 w-4" />
            </button>
            <button
              className="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              className="text-yellow-600 hover:text-yellow-800"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(item._id, type)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {item.bookings} bookings
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage tours, hotels, and vehicles on the platform</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New {activeTab.slice(0, -1)}</span>
          </button>
          <button 
            onClick={loadContent}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredData().map((item) => (
            <ContentCard key={item._id} item={item} type={activeTab} />
          ))}
        </div>

        {getFilteredData().length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === 'tours' && <MapPin className="h-12 w-12 mx-auto" />}
              {activeTab === 'hotels' && <Building2 className="h-12 w-12 mx-auto" />}
              {activeTab === 'vehicles' && <Car className="h-12 w-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : `No ${activeTab} have been added yet.`
              }
            </p>
          </div>
        )}
    </div>
  );
};

export default ContentManagement;
