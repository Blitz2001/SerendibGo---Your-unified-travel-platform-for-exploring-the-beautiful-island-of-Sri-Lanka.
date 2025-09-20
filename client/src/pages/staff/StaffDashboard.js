import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Hotel,
  UserCheck,
  XCircle,
  Plus,
  Search,
  Activity,
  Headphones,
  Ticket,
  UserPlus
} from 'lucide-react';
import tripRequestService from '../../services/tripRequestService';
import vehicleService from '../../services/vehicleService';
import hotelService from '../../services/hotelService';
import guideService from '../../services/guideService';
import StaffLayout from '../../components/layout/StaffLayout';
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
  // Staff Dashboard Component - Fixed duplicate function issue
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
  const [customerMessages, setCustomerMessages] = useState([]);
  
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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all trip requests (staff can see all)
      const tripResponse = await tripRequestService.getAllTripRequests({ 
        page: 1, 
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (tripResponse.success) {
        setTripRequests(tripResponse.data.tripRequests);
        setPendingTripRequests(tripResponse.data.tripRequests.filter(req => req.status === 'pending'));
      }

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
        category: 'booking'
      },
      {
        _id: '2',
        customer: { name: 'Jane Smith', email: 'jane@example.com' },
        subject: 'Payment Problem',
        priority: 'medium',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        category: 'payment'
      },
      {
        _id: '3',
        customer: { name: 'Bob Johnson', email: 'bob@example.com' },
        subject: 'Vehicle Rental Question',
        priority: 'low',
        status: 'resolved',
        createdAt: new Date().toISOString(),
        category: 'vehicle'
      }
    ];

    const mockMessages = [
      {
        _id: '1',
        customer: { name: 'Alice Brown', email: 'alice@example.com' },
        message: 'I need help with my booking confirmation',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        _id: '2',
        customer: { name: 'Charlie Wilson', email: 'charlie@example.com' },
        message: 'Can I modify my trip dates?',
        timestamp: new Date().toISOString(),
        read: true
      }
    ];

    setSupportTickets(mockTickets);
    setPendingTickets(mockTickets.filter(ticket => ticket.status === 'pending'));
    setCustomerMessages(mockMessages);
  };

  // Handle trip request actions
  const handleTripRequestAction = async (requestId, action, notes = '') => {
    try {
      const response = await tripRequestService.updateTripRequestStatus(requestId, { 
        status: action,
        notes: notes
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

  return (
    <StaffLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">
            Manage trip requests, vehicle registrations, customer support, and site operations
          </p>
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
                { id: 'management', label: 'Site Management', icon: Settings }
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/staff/trip-requests"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Review Trip Requests</p>
                      <p className="text-sm text-gray-600">{pendingTripRequests.length} pending</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/staff/vehicle-approvals"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Approve Vehicles</p>
                      <p className="text-sm text-gray-600">{pendingVehicles.length} pending</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/staff/support"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Headphones className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Customer Support</p>
                      <p className="text-sm text-gray-600">{pendingTickets.length} pending</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/staff/analytics"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Site Management</p>
                      <p className="text-sm text-gray-600">View site statistics</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trip Requests Tab */}
        {activeTab === 'trip-requests' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search trip requests..."
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
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Trip Requests ({filteredTripRequests.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTripRequests.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No trip requests found
                  </div>
                ) : (
                  filteredTripRequests.map((request) => (
                    <div key={request._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{request.destination}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{request.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By: {request.user?.name}</span>
                            <span>Budget: ${request.budget}</span>
                            <span>Duration: {request.duration} days</span>
                            <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleTripRequestAction(request._id, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleTripRequestAction(request._id, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                          >
                            Reject
                          </button>
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

        {/* Vehicle Registrations Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
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
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicles List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Registrations ({filteredVehicles.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredVehicles.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No vehicle registrations found
                  </div>
                ) : (
                  filteredVehicles.map((vehicle) => (
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
                            <span>Year: {vehicle.year}</span>
                            <span>Capacity: {vehicle.capacity}</span>
                            <span>Price: ${vehicle.pricing?.daily}/day</span>
                            <span>Location: {vehicle.location?.city}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleVehicleAction(vehicle._id, 'approve')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVehicleAction(vehicle._id, 'reject')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                          >
                            Reject
                          </button>
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

        {/* Customer Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Support Tickets */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Support Tickets ({filteredTickets.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No support tickets found
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div key={ticket._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{ticket.subject}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">From: {ticket.customer.name} ({ticket.customer.email})</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {ticket.category}</span>
                            <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleTicketAction(ticket._id, 'resolved')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                          >
                            Resolve
                          </button>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Customer Messages */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customer Messages ({customerMessages.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {customerMessages.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No customer messages found
                  </div>
                ) : (
                  customerMessages.map((message) => (
                    <div key={message._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{message.customer.name}</h4>
                            <span className="text-sm text-gray-500">{message.customer.email}</span>
                            {!message.read && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{message.message}</p>
                          <div className="text-sm text-gray-500">
                            <span>{new Date(message.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            Reply
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

        {/* Site Management Tab */}
        {activeTab === 'management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{siteStats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{siteStats.totalBookings}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{siteStats.totalRevenue}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{siteStats.activeVehicles}</div>
                  <div className="text-sm text-gray-600">Active Vehicles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{siteStats.activeHotels}</div>
                  <div className="text-sm text-gray-600">Active Hotels</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{siteStats.activeGuides}</div>
                  <div className="text-sm text-gray-600">Active Guides</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Management Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to="/staff/users"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">User Management</p>
                  <p className="text-sm text-gray-600">Manage user accounts</p>
                </Link>

                <Link
                  to="/staff/analytics"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View detailed analytics</p>
                </Link>

                <Link
                  to="/staff/settings"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-600">Configure site settings</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;