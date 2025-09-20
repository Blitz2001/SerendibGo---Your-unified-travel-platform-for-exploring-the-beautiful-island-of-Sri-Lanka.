import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Download
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalUsers: 0,
      totalBookings: 0,
      conversionRate: 0
    },
    revenue: {
      current: 0,
      previous: 0,
      change: 0
    },
    users: {
      current: 0,
      previous: 0,
      change: 0
    },
    bookings: {
      current: 0,
      previous: 0,
      change: 0
    }
  });

  const [chartData, setChartData] = useState({
    revenue: [],
    bookings: [],
    users: []
  });

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const metrics = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-600' },
    { value: 'bookings', label: 'Bookings', icon: Calendar, color: 'text-blue-600' },
    { value: 'users', label: 'Users', icon: Users, color: 'text-purple-600' }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, these would be API calls
      const mockAnalytics = {
        overview: {
          totalRevenue: 125000,
          totalUsers: 1247,
          totalBookings: 892,
          conversionRate: 12.5
        },
        revenue: {
          current: 125000,
          previous: 98000,
          change: 27.6
        },
        users: {
          current: 1247,
          previous: 1156,
          change: 7.9
        },
        bookings: {
          current: 892,
          previous: 756,
          change: 18.0
        }
      };

      const mockChartData = {
        revenue: [
          { date: '2024-01-01', value: 8500 },
          { date: '2024-01-02', value: 9200 },
          { date: '2024-01-03', value: 7800 },
          { date: '2024-01-04', value: 10500 },
          { date: '2024-01-05', value: 11200 },
          { date: '2024-01-06', value: 9800 },
          { date: '2024-01-07', value: 12300 }
        ],
        bookings: [
          { date: '2024-01-01', value: 45 },
          { date: '2024-01-02', value: 52 },
          { date: '2024-01-03', value: 38 },
          { date: '2024-01-04', value: 67 },
          { date: '2024-01-05', value: 71 },
          { date: '2024-01-06', value: 58 },
          { date: '2024-01-07', value: 89 }
        ],
        users: [
          { date: '2024-01-01', value: 12 },
          { date: '2024-01-02', value: 18 },
          { date: '2024-01-03', value: 15 },
          { date: '2024-01-04', value: 22 },
          { date: '2024-01-05', value: 28 },
          { date: '2024-01-06', value: 19 },
          { date: '2024-01-07', value: 35 }
        ]
      };

      setAnalytics(mockAnalytics);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const SimpleChart = ({ data, type }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => {
          const height = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t ${
                  type === 'revenue' ? 'bg-green-500' :
                  type === 'bookings' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}
                style={{ height: `${height}%` }}
                title={`${item.date}: ${item.value}`}
              />
              <span className="text-xs text-gray-500 mt-2">
                {new Date(item.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const TopPerformers = () => (
    <div className="space-y-6">
      {/* Top Tours */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Tours</h3>
        <div className="space-y-3">
          {[
            { name: 'Sigiriya Rock Fortress Tour', bookings: 45, revenue: 6750 },
            { name: 'Ella Scenic Train Journey', bookings: 32, revenue: 2400 },
            { name: 'Yala National Park Safari', bookings: 28, revenue: 5600 },
            { name: 'Kandy Temple Tour', bookings: 25, revenue: 3750 },
            { name: 'Galle Fort Walking Tour', bookings: 22, revenue: 2200 }
          ].map((tour, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tour.name}</p>
                  <p className="text-xs text-gray-500">{tour.bookings} bookings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">${tour.revenue}</p>
                <p className="text-xs text-gray-500">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Hotels */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Hotels</h3>
        <div className="space-y-3">
          {[
            { name: 'Grand Oriental Hotel', bookings: 156, revenue: 39000 },
            { name: 'Ella Mountain View Hotel', bookings: 89, revenue: 10680 },
            { name: 'Beach Paradise Resort', bookings: 67, revenue: 12060 },
            { name: 'Colombo City Hotel', bookings: 54, revenue: 10800 },
            { name: 'Kandy Heritage Hotel', bookings: 43, revenue: 8600 }
          ].map((hotel, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{hotel.name}</p>
                  <p className="text-xs text-gray-500">{hotel.bookings} bookings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">${hotel.revenue}</p>
                <p className="text-xs text-gray-500">revenue</p>
              </div>
            </div>
          ))}
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Platform performance and business insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
            change={analytics.revenue.change}
            icon={DollarSign}
            color="bg-green-500"
            subtitle="This month"
          />
          <StatCard
            title="Total Users"
            value={analytics.overview.totalUsers.toLocaleString()}
            change={analytics.users.change}
            icon={Users}
            color="bg-blue-500"
            subtitle="Registered users"
          />
          <StatCard
            title="Total Bookings"
            value={analytics.overview.totalBookings.toLocaleString()}
            change={analytics.bookings.change}
            icon={Calendar}
            color="bg-purple-500"
            subtitle="Completed bookings"
          />
          <StatCard
            title="Conversion Rate"
            value={`${analytics.overview.conversionRate}%`}
            icon={BarChart3}
            color="bg-orange-500"
            subtitle="Visitor to booking"
          />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Trends</h2>
              <div className="flex space-x-2">
                {metrics.map(metric => {
                  const Icon = metric.icon;
                  return (
                    <button
                      key={metric.value}
                      onClick={() => setSelectedMetric(metric.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        selectedMetric === metric.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{metric.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <SimpleChart 
              data={chartData[selectedMetric]} 
              type={selectedMetric}
            />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing data for the last 7 days
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Booking Value</span>
                  <span className="text-sm font-medium text-gray-900">$140</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Booking Day</span>
                  <span className="text-sm font-medium text-gray-900">Saturday</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Popular Tour</span>
                  <span className="text-sm font-medium text-gray-900">Sigiriya</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="text-sm font-medium text-gray-900">4.7/5</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Tours</span>
                  <span className="text-sm font-medium text-green-600">45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Hotels</span>
                  <span className="text-sm font-medium text-green-600">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Vehicles</span>
                  <span className="text-sm font-medium text-green-600">67</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified Guides</span>
                  <span className="text-sm font-medium text-green-600">34</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopPerformers />
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'New booking received', user: 'John Doe', time: '2 minutes ago', type: 'booking' },
                { action: 'Hotel verification completed', user: 'Grand Oriental Hotel', time: '15 minutes ago', type: 'verification' },
                { action: 'New guide application', user: 'Mike Johnson', time: '1 hour ago', type: 'application' },
                { action: 'Payment processed', user: 'Sarah Wilson', time: '2 hours ago', type: 'payment' },
                { action: 'Tour review submitted', user: 'David Brown', time: '3 hours ago', type: 'review' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'booking' ? 'bg-green-500' :
                    activity.type === 'verification' ? 'bg-blue-500' :
                    activity.type === 'application' ? 'bg-yellow-500' :
                    activity.type === 'payment' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

export default AnalyticsDashboard;
