import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign,
  Star,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';
import DemographicsChart from '../../components/charts/DemographicsChart';
import LineChart from '../../components/charts/LineChart';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalBookings: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalReviews: 0,
      conversionRate: 0,
      responseRate: 0
    },
    trends: {
      bookings: [],
      earnings: [],
      ratings: []
    },
    demographics: {
      ageGroups: [],
      countries: [],
      languages: []
    },
    performance: {
      popularTours: [],
      peakHours: [],
      seasonalTrends: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMetric, setSelectedMetric] = useState('bookings');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedYear]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        year: selectedYear
      };
      const response = await guideService.getMyAnalytics(params);
      
      if (response.success) {
        // Ensure all data structures exist with default values
        const analyticsData = {
          overview: {
            totalBookings: 0,
            totalEarnings: 0,
            averageRating: 0,
            totalReviews: 0,
            conversionRate: 0,
            responseRate: 0,
            ...response.data.overview
          },
          trends: {
            bookings: [],
            earnings: [],
            ratings: [],
            ...response.data.trends
          },
          demographics: {
            ageGroups: [],
            countries: [],
            languages: [],
            ...response.data.demographics
          },
          performance: {
            popularTours: [],
            peakHours: [],
            seasonalTrends: [],
            ...response.data.performance
          }
        };
        setAnalytics(analyticsData);
      } else {
        // Set default empty state if API call fails
        setAnalytics({
          overview: { totalBookings: 0, totalEarnings: 0, averageRating: 0, totalReviews: 0, conversionRate: 0, responseRate: 0 },
          trends: { bookings: [], earnings: [], ratings: [] },
          demographics: { ageGroups: [], countries: [], languages: [] },
          performance: { popularTours: [], peakHours: [], seasonalTrends: [] }
        });
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Failed to load analytics data');
      // Set default empty state on error
      setAnalytics({
        overview: { totalBookings: 0, totalEarnings: 0, averageRating: 0, totalReviews: 0, conversionRate: 0, responseRate: 0 },
        trends: { bookings: [], earnings: [], ratings: [] },
        demographics: { ageGroups: [], countries: [], languages: [] },
        performance: { popularTours: [], peakHours: [], seasonalTrends: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleExport = () => {
    try {
      // Create CSV data
      const csvData = [];
      
      // Add overview data
      csvData.push(['Analytics Overview']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Total Bookings', analytics.overview.totalBookings]);
      csvData.push(['Total Earnings', `$${analytics.overview.totalEarnings.toFixed(2)}`]);
      csvData.push(['Average Rating', analytics.overview.averageRating.toFixed(1)]);
      csvData.push(['Total Reviews', analytics.overview.totalReviews]);
      csvData.push(['Conversion Rate', `${analytics.overview.conversionRate.toFixed(1)}%`]);
      csvData.push(['Response Rate', `${analytics.overview.responseRate.toFixed(1)}%`]);
      csvData.push([]);
      
      // Add trends data
      csvData.push(['Booking Trends']);
      csvData.push(['Period', 'Bookings']);
      analytics.trends.bookings.forEach(trend => {
        csvData.push([trend.period, trend.value]);
      });
      csvData.push([]);
      
      csvData.push(['Earnings Trends']);
      csvData.push(['Period', 'Earnings']);
      analytics.trends.earnings.forEach(trend => {
        csvData.push([trend.period, `$${trend.value.toFixed(2)}`]);
      });
      csvData.push([]);
      
      // Add demographics data
      csvData.push(['Demographics - Age Groups']);
      csvData.push(['Age Group', 'Count']);
      analytics.demographics.ageGroups.forEach(group => {
        csvData.push([group.ageGroup, group.count]);
      });
      csvData.push([]);
      
      csvData.push(['Demographics - Countries']);
      csvData.push(['Country', 'Count']);
      analytics.demographics.countries.forEach(country => {
        csvData.push([country.country, country.count]);
      });
      csvData.push([]);
      
      // Convert to CSV string
      const csvString = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${selectedPeriod}-${selectedYear}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Analytics data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track your performance and business insights</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalBookings}</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.overview.totalBookings, 140)}
                <span className={`text-sm ${getTrendColor(analytics.overview.totalBookings, 140)}`}>
                  +11.4%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalEarnings)}</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.overview.totalEarnings, 16800)}
                <span className={`text-sm ${getTrendColor(analytics.overview.totalEarnings, 16800)}`}>
                  +11.6%
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating}</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.overview.averageRating, 4.6)}
                <span className={`text-sm ${getTrendColor(analytics.overview.averageRating, 4.6)}`}>
                  +0.1
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalReviews}</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.overview.totalReviews, 82)}
                <span className={`text-sm ${getTrendColor(analytics.overview.totalReviews, 82)}`}>
                  +8.5%
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversionRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.overview.conversionRate, 11.2)}
                <span className={`text-sm ${getTrendColor(analytics.overview.conversionRate, 11.2)}`}>
                  +1.3%
                </span>
              </div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.responseRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.overview.responseRate, 94.8)}
                <span className={`text-sm ${getTrendColor(analytics.overview.responseRate, 94.8)}`}>
                  +0.4%
                </span>
              </div>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bookings Trend Chart */}
        <LineChart 
          data={analytics.trends.bookings || []} 
          title="Booking Trends" 
          color="blue" 
        />

        {/* Earnings Trend Chart */}
        <LineChart 
          data={analytics.trends.earnings || []} 
          title="Earnings Trends" 
          color="green" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Popular Tours */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tours</h3>
          <div className="space-y-4">
            {analytics.performance.popularTours.map((tour, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{tour.name}</p>
                  <p className="text-sm text-gray-600">{tour.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(tour.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Demographics */}
        <DemographicsChart 
          data={analytics.demographics.ageGroups || []} 
          title="Age Demographics" 
        />

        {/* Peak Hours */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Booking Hours</h3>
          <div className="space-y-3">
            {analytics.performance.peakHours.map((hour, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{hour.hour}</span>
                  <span className="text-gray-900">{hour.bookings} bookings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(hour.bookings / 22) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {analytics.performance.seasonalTrends.map((season, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">{season.season}</h4>
              <p className="text-sm text-gray-600">{season.bookings} bookings</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(season.revenue)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
