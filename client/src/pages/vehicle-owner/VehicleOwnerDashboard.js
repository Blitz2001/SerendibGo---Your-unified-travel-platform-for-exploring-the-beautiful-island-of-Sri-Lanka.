import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  Eye,
  MessageSquare,
  BarChart3,
  Settings,
  Car,
  UserCheck,
  XCircle,
  Plus,
  Search,
  Activity,
  Headphones,
  Bed,
  Star,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  X,
  Wrench,
  Fuel
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import vehicleRentalService from '../../services/vehicleRentalService';
import VehicleOwnerLayout from '../../components/layout/VehicleOwnerLayout';
import { toast } from 'react-hot-toast';

const VehicleOwnerDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Set active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/vehicles')) {
      setActiveTab('vehicles');
    } else if (path.includes('/rentals')) {
      setActiveTab('rentals');
    } else if (path.includes('/availability')) {
      setActiveTab('availability');
    } else if (path.includes('/maintenance')) {
      setActiveTab('maintenance');
    } else if (path.includes('/analytics')) {
      setActiveTab('analytics');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Rentals
  const [rentals, setRentals] = useState([]);
  const [pendingRentals, setPendingRentals] = useState([]);
  
  // Availability Management
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showManualRentalModal, setShowManualRentalModal] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({
    date: '',
    isAvailable: true,
    reason: '',
    price: ''
  });
  const [manualRentalData, setManualRentalData] = useState({
    date: '',
    endDate: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleType: '',
    duration: 1,
    totalAmount: '',
    notes: ''
  });
  
  // Statistics
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalRentals: 0,
    totalRevenue: 0,
    pendingRentals: 0,
    utilizationRate: 0,
    averageRating: 0
  });
  
  // Filters and Search
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load vehicles
      const vehiclesResponse = await vehicleService.getMyVehicles();
      if (vehiclesResponse.success) {
        const vehicles = vehiclesResponse.vehicles || [];
        setVehicles(vehicles);
        if (vehicles.length > 0) {
          setSelectedVehicle(vehicles[0]);
        }
      }

      // Load rentals
      const rentalsResponse = await vehicleRentalService.getMyRentals({ 
        page: 1, 
        limit: 100 
      });
      if (rentalsResponse.success) {
        const rentals = rentalsResponse.rentals || [];
        setRentals(rentals);
        setPendingRentals(rentals.filter(rental => rental.status === 'pending'));
      }

      // Calculate statistics
      const vehiclesData = vehiclesResponse.success ? (vehiclesResponse.vehicles || []) : [];
      const rentalsData = rentalsResponse.success ? (rentalsResponse.rentals || []) : [];
      calculateStats(vehiclesData, rentalsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (vehiclesData, rentalsData) => {
    const totalVehicles = vehiclesData.length;
    const totalRentals = rentalsData.length;
    const pendingRentals = rentalsData.filter(r => r.status === 'pending').length;
    
    const totalRevenue = rentalsData
      .filter(r => r.status === 'confirmed')
      .reduce((sum, rental) => sum + (rental.totalAmount || 0), 0);
    
    const utilizationRate = totalRentals > 0 ? 
      (rentalsData.filter(r => r.status === 'confirmed').length / totalRentals) * 100 : 0;
    
    const averageRating = vehiclesData.length > 0 ? 
      vehiclesData.reduce((sum, vehicle) => sum + (vehicle.rating || 0), 0) / vehiclesData.length : 0;

    setStats({
      totalVehicles,
      totalRentals,
      totalRevenue,
      pendingRentals,
      utilizationRate: Math.round(utilizationRate),
      averageRating: Math.round(averageRating * 10) / 10
    });
  };

  const handleAvailabilityChange = async () => {
    if (!selectedVehicle || !availabilityData.date) {
      toast.error('Please select a vehicle and date');
      return;
    }

    try {
      const response = await vehicleService.updateAvailability(selectedVehicle._id, {
        date: availabilityData.date,
        isAvailable: availabilityData.isAvailable,
        reason: availabilityData.reason,
        price: availabilityData.price
      });

      if (response.success) {
        toast.success('Availability updated successfully');
        setShowAvailabilityModal(false);
        setAvailabilityData({ date: '', isAvailable: true, reason: '', price: '' });
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleManualRental = async () => {
    if (!selectedVehicle || !manualRentalData.date || !manualRentalData.customerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const rentalData = {
        vehicle: selectedVehicle._id,
        startDate: manualRentalData.date,
        endDate: manualRentalData.endDate,
        duration: manualRentalData.duration,
        totalAmount: parseFloat(manualRentalData.totalAmount) || 0,
        customerName: manualRentalData.customerName,
        customerEmail: manualRentalData.customerEmail,
        customerPhone: manualRentalData.customerPhone,
        notes: manualRentalData.notes,
        status: 'confirmed',
        rentalType: 'manual'
      };

      const response = await vehicleRentalService.createRental(rentalData);

      if (response.success) {
        toast.success('Manual rental created successfully');
        setShowManualRentalModal(false);
        setManualRentalData({
          date: '',
          endDate: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          vehicleType: '',
          duration: 1,
          totalAmount: '',
          notes: ''
        });
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to create rental');
      }
    } catch (error) {
      console.error('Error creating manual rental:', error);
      toast.error('Failed to create rental');
    }
  };

  const handleRentalAction = async (rentalId, action) => {
    try {
      const response = await vehicleRentalService.updateRentalStatus(rentalId, { status: action });
      
      if (response.success) {
        toast.success(`Rental ${action} successfully`);
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to update rental');
      }
    } catch (error) {
      console.error('Error updating rental:', error);
      toast.error('Failed to update rental');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter functions
  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = !searchTerm || 
      rental.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || rental.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <VehicleOwnerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Owner Dashboard</h1>
          <p className="text-gray-600">
            Manage your vehicles, rentals, and availability
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3, path: '/vehicle-owner/dashboard' },
                { id: 'vehicles', label: 'My Vehicles', icon: Car, path: '/vehicle-owner/vehicles' },
                { id: 'rentals', label: 'Rentals', icon: Calendar, path: '/vehicle-owner/rentals' },
                { id: 'availability', label: 'Availability', icon: CalendarIcon, path: '/vehicle-owner/availability' },
                { id: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/vehicle-owner/maintenance' }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rentals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRentals}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.utilizationRate}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <CalendarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Set Availability</p>
                  <p className="text-sm text-gray-600">Block or open dates</p>
                </button>

                <button
                  onClick={() => setShowManualRentalModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Manual Rental</p>
                  <p className="text-sm text-gray-600">Add walk-in rentals</p>
                </button>

                <Link
                  to="/vehicle-owner/add-vehicle"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Car className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Add Vehicle</p>
                  <p className="text-sm text-gray-600">Register new vehicle</p>
                </Link>

                <Link
                  to="/vehicle-owner/settings"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-600">Manage account</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Vehicles ({vehicles.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {vehicles.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No vehicles found. <Link to="/vehicle-owner/add-vehicle" className="text-blue-600 hover:text-blue-700">Add your first vehicle</Link>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div key={vehicle._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                              {vehicle.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{vehicle.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📍 {vehicle.location?.city}</span>
                            <span>⭐ {vehicle.rating || 'No rating'}</span>
                            <span>💰 ${vehicle.pricing?.daily || 'N/A'}/day</span>
                            <span>⛽ {vehicle.fuelType || 'N/A'}</span>
                            <span>👥 {vehicle.capacity} seats</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search rentals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rentals List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Rentals ({filteredRentals.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredRentals.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No rentals found
                  </div>
                ) : (
                  filteredRentals.map((rental) => (
                    <div key={rental._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{rental.customerName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                              {rental.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{rental.customerEmail}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📅 {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}</span>
                            <span>🚗 {rental.vehicle?.brand} {rental.vehicle?.model}</span>
                            <span>💰 ${rental.totalAmount}</span>
                            <span>⏱️ {rental.duration} {rental.rentalType}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {rental.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRentalAction(rental._id, 'confirmed')}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleRentalAction(rental._id, 'cancelled')}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Availability Management</h3>
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Set Availability
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your vehicle availability by blocking dates or setting special pricing.
              </p>
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No availability settings configured yet.</p>
                <p className="text-sm">Click "Set Availability" to get started.</p>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Maintenance</h3>
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No maintenance records yet.</p>
                <p className="text-sm">Track your vehicle maintenance and service history.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Set Availability</h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle
                  </label>
                  <select
                    value={selectedVehicle?._id || ''}
                    onChange={(e) => {
                      const vehicle = vehicles.find(v => v._id === e.target.value);
                      setSelectedVehicle(vehicle);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>{vehicle.brand} {vehicle.model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={availabilityData.date}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={availabilityData.isAvailable}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Available</option>
                    <option value="false">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={availabilityData.reason}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Maintenance, Service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={availabilityData.price}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Override default price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAvailabilityChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Rental Modal */}
      {showManualRentalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Manual Rental</h3>
              <button
                onClick={() => setShowManualRentalModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle
                  </label>
                  <select
                    value={selectedVehicle?._id || ''}
                    onChange={(e) => {
                      const vehicle = vehicles.find(v => v._id === e.target.value);
                      setSelectedVehicle(vehicle);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>{vehicle.brand} {vehicle.model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={manualRentalData.date}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={manualRentalData.endDate}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={manualRentalData.customerName}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={manualRentalData.customerEmail}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={manualRentalData.customerPhone}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualRentalData.duration}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualRentalData.totalAmount}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={manualRentalData.notes}
                    onChange={(e) => setManualRentalData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about this rental"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowManualRentalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualRental}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Rental
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VehicleOwnerLayout>
  );
};

export default VehicleOwnerDashboard;