import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  CheckCircle,
  Eye,
  BarChart3,
  Settings,
  Car,
  Hotel,
  UserCheck,
  XCircle,
  Search,
  Activity,
  Headphones
} from 'lucide-react';
import tripRequestService from '../../services/tripRequestService';
import vehicleService from '../../services/vehicleService';
import hotelService from '../../services/hotelService';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  // Admin Dashboard Component - Modern Design
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Trip Requests
  const [tripRequests, setTripRequests] = useState([]);
  const [pendingTripRequests, setPendingTripRequests] = useState([]);
  
  // Vehicle Registrations
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [vehicleRegistrations, setVehicleRegistrations] = useState([]);
  
  // Customer Support
  const [supportTickets, setSupportTickets] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  
  // Site Statistics
  const [siteStats, setSiteStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeVehicles: 0,
    activeHotels: 0,
    activeGuides: 0,
    tripRequests: 0,
    supportTickets: 0,
    pendingTickets: 0
  });
  
  // Filters and Search
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const loadSiteStatistics = useCallback(async () => {
    try {
      // Load various statistics
      const [vehiclesResponse, hotelsResponse, guidesResponse] = await Promise.all([
        vehicleService.getVehicles({ limit: 1000 }),
        hotelService.getHotels({ limit: 1000 }),
        guideService.getGuides({ limit: 1000 })
      ]);

      const stats = {
        totalUsers: 0, // Would need user service
        totalBookings: 0, // Would need booking service
        totalRevenue: 0, // Would need payment service
        pendingApprovals: pendingTripRequests.length + pendingVehicles.length,
        activeVehicles: vehiclesResponse.success ? vehiclesResponse.vehicles.filter(v => v.status === 'active').length : 0,
        activeHotels: hotelsResponse.success ? hotelsResponse.hotels.filter(h => h.status === 'active').length : 0,
        activeGuides: guidesResponse.success ? guidesResponse.guides.filter(g => g.status === 'active').length : 0,
        tripRequests: tripRequests.length,
        supportTickets: supportTickets.length,
        pendingTickets: pendingTickets.length
      };

      setSiteStats(stats);
    } catch (error) {
      console.error('Error loading site statistics:', error);
    }
  }, [pendingTripRequests.length, pendingVehicles.length, tripRequests.length, supportTickets.length, pendingTickets.length]);

  const loadTripRequests = useCallback(async () => {
    try {
      const response = await tripRequestService.getAllTripRequests({ 
        page: 1, 
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.success) {
        setTripRequests(response.data.tripRequests);
        setPendingTripRequests(response.data.tripRequests.filter(req => req.status === 'pending'));
      }
    } catch (error) {
      console.error('Error loading trip requests:', error);
    }
  }, []);

  const loadVehicleRegistrations = useCallback(async () => {
    try {
      // Load vehicles (for registration approval)
      const vehicleResponse = await vehicleService.getVehicles({ 
        page: 1, 
        limit: 50
      });
      
      if (vehicleResponse.success) {
        setPendingVehicles(vehicleResponse.vehicles.filter(v => v.status === 'pending'));
        setVehicleRegistrations(vehicleResponse.vehicles);
      }

      // Load site statistics
      await loadSiteStatistics();

      // Load customer support data (mock data for now)
      await loadSupportData();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSupportData = async () => {
    // Mock support data - in real implementation, this would come from support service
    const mockTickets = [
      {
        _id: '1',
        customer: { name: 'John Doe', email: 'john@example.com' },
        subject: 'Booking Issue',
        priority: 'high',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        customer: { name: 'Jane Smith', email: 'jane@example.com' },
        subject: 'Payment Problem',
        priority: 'medium',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        customer: { name: 'Bob Johnson', email: 'bob@example.com' },
        subject: 'Cancellation Request',
        priority: 'low',
        status: 'resolved',
        createdAt: new Date().toISOString(),
      }
    ];

    setSupportTickets(mockTickets);
    setPendingTickets(mockTickets.filter(ticket => ticket.status === 'pending'));
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load trip requests
      await loadTripRequests();

      // Load vehicle registrations
      await loadVehicleRegistrations();

      // Load site statistics
      await loadSiteStatistics();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [loadTripRequests, loadVehicleRegistrations, loadSiteStatistics]);

  // Handle trip request actions
  const handleTripRequestAction = async (requestId, action) => {
    try {
      const response = await tripRequestService.updateTripRequest(requestId, { 
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      if (response.success) {
        toast.success(`Trip request ${action} successfully`);
        await loadDashboardData(); // Reload data
      } else {
        toast.error(response.message || 'Failed to update trip request');
      }
    } catch (error) {
      console.error('Error updating trip request:', error);
      toast.error('Failed to update trip request');
    }
  };

  // Handle vehicle approval actions
  const handleVehicleAction = async (vehicleId, action) => {
    try {
      const response = await vehicleService.updateVehicle(vehicleId, { 
        status: action === 'approve' ? 'active' : 'rejected'
      });
      
      if (response.success) {
        toast.success(`Vehicle ${action}d successfully`);
        await loadDashboardData(); // Reload data
      } else {
        toast.error(response.message || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    }
  };

  // Handle support ticket actions
  const handleTicketAction = async (ticketId, action) => {
    // Mock implementation - in real app, this would call support service
    toast.success(`Ticket ${action} successfully`);
    await loadSupportData(); // Reload mock data
  };

  // Utility functions for styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter functions
  const filteredTripRequests = tripRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesPriority = filters.priority === 'all' || request.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredVehicles = vehicleRegistrations.filter(vehicle => {
    const matchesSearch = !searchTerm || 
      vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || vehicle.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
    const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage trip requests, vehicle registrations, customer support, and platform operations</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'trip-requests', label: 'Trip Requests', icon: MapPin },
              { id: 'vehicles', label: 'Vehicle Registrations', icon: Car },
              { id: 'support', label: 'Customer Support', icon: Headphones },
              { id: 'management', label: 'Platform Management', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
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
                  <p className="text-sm font-medium text-gray-600">Pending Trip Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTripRequests.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Vehicle Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingVehicles.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Support Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTickets.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Headphones className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{siteStats.activeVehicles}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/admin/trip-requests"
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Review Trip Requests</p>
                  <p className="text-xs text-gray-500">{pendingTripRequests.length} pending</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/vehicles"
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approve Vehicles</p>
                  <p className="text-xs text-gray-500">{pendingVehicles.length} pending</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/support"
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Support</p>
                  <p className="text-xs text-gray-500">{pendingTickets.length} pending</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Headphones className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/settings"
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Site Management</p>
                  <p className="text-xs text-gray-500">View site statistics</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Link>
          </div>

        </div>
      )}

      {/* Trip Requests Tab */}
        {activeTab === 'trip-requests' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search trip requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trip Requests List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Trip Requests</h3>
                  <Link
                    to="/admin/trip-requests"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTripRequests.length > 0 ? (
                  filteredTripRequests.slice(0, 10).map((request) => (
                    <div key={request._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{request.destination}</h4>
                          <p className="text-sm text-gray-600">
                            {request.user?.name} • {new Date(request.startDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleTripRequestAction(request._id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTripRequestAction(request._id, 'reject')}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/trip-requests/${request._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No trip requests found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicles List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Registrations</h3>
                  <Link
                    to="/admin/vehicles"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.slice(0, 10).map((vehicle) => (
                    <div key={vehicle._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                          <p className="text-sm text-gray-600">
                            {vehicle.year} • {vehicle.type} • {vehicle.location?.city}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                              {vehicle.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {vehicle.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVehicleAction(vehicle._id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVehicleAction(vehicle._id, 'reject')}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/vehicles/${vehicle._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No vehicles found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search support tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Support Tickets List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
                  <Link
                    to="/admin/support"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTickets.length > 0 ? (
                  filteredTickets.slice(0, 10).map((ticket) => (
                    <div key={ticket._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600">
                            {ticket.customer?.name} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {ticket.status === 'pending' && (
                            <button
                              onClick={() => handleTicketAction(ticket._id, 'resolve')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/admin/support/${ticket._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No support tickets found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Management Tab */}
        {activeTab === 'management' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Management</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <Link
                      to="/admin/users"
                      className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Users className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">User Management</p>
                        <p className="text-sm text-gray-600">Manage all platform users</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/settings"
                      className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Settings className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Platform Settings</p>
                        <p className="text-sm text-gray-600">Configure platform options</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/analytics"
                      className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Analytics</p>
                        <p className="text-sm text-gray-600">View platform analytics</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <Link
                      to="/admin/hotels"
                      className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <Hotel className="w-6 h-6 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Hotel Management</p>
                        <p className="text-sm text-gray-600">Manage hotel listings</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/guides"
                      className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <UserCheck className="w-6 h-6 text-indigo-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Guide Management</p>
                        <p className="text-sm text-gray-600">Manage tour guides</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/vehicles"
                      className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <Car className="w-6 h-6 text-teal-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Vehicle Management</p>
                        <p className="text-sm text-gray-600">Manage vehicle fleet</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default AdminDashboard;