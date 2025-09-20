import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet
} from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';
import LineChart from '../../components/charts/LineChart';

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingPayouts: 0,
    completedPayouts: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadEarningsData();
  }, [selectedPeriod, selectedYear]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        year: selectedYear
      };
      const response = await guideService.getMyEarnings(params);
      
      if (response.success) {
        setEarnings(response.data.overview);
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Error loading earnings data:', err);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExportReport = () => {
    try {
      // Create CSV data
      const csvData = [];
      
      // Add earnings overview
      csvData.push(['Earnings Report']);
      csvData.push(['Period', `${selectedPeriod} ${selectedYear}`]);
      csvData.push(['Generated', new Date().toLocaleDateString()]);
      csvData.push([]);
      
      // Add overview metrics
      csvData.push(['Overview']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Total Earnings', formatCurrency(earnings?.overview?.totalEarnings || 0)]);
      csvData.push(['Completed Bookings', earnings?.overview?.completedBookings || 0]);
      csvData.push(['Pending Payments', formatCurrency(earnings?.overview?.pendingPayments || 0)]);
      csvData.push(['Average per Booking', formatCurrency(earnings?.overview?.averagePerBooking || 0)]);
      csvData.push(['Commission Rate', `${earnings?.overview?.commissionRate || 0}%`]);
      csvData.push(['Net Earnings', formatCurrency(earnings?.overview?.netEarnings || 0)]);
      csvData.push([]);
      
      // Add transaction history
      csvData.push(['Transaction History']);
      csvData.push(['Date', 'Booking ID', 'Amount', 'Status', 'Commission', 'Net Amount']);
      (earnings?.transactions || []).forEach(transaction => {
        csvData.push([
          formatDate(transaction?.date || ''),
          transaction?.bookingId || '',
          formatCurrency(transaction?.amount || 0),
          transaction?.status || '',
          formatCurrency(transaction?.commission || 0),
          formatCurrency(transaction?.netAmount || 0)
        ]);
      });
      csvData.push([]);
      
      // Add monthly breakdown if available
      if (earnings?.monthlyBreakdown && earnings.monthlyBreakdown.length > 0) {
        csvData.push(['Monthly Breakdown']);
        csvData.push(['Month', 'Bookings', 'Earnings', 'Commission', 'Net']);
        earnings.monthlyBreakdown.forEach(month => {
          csvData.push([
            month?.month || '',
            month?.bookings || 0,
            formatCurrency(month?.earnings || 0),
            formatCurrency(month?.commission || 0),
            formatCurrency(month?.net || 0)
          ]);
        });
        csvData.push([]);
      }
      
      // Add payment methods breakdown if available
      if (earnings?.paymentMethods && earnings.paymentMethods.length > 0) {
        csvData.push(['Payment Methods']);
        csvData.push(['Method', 'Count', 'Amount', 'Percentage']);
        earnings.paymentMethods.forEach(method => {
          csvData.push([
            method?.method || '',
            method?.count || 0,
            formatCurrency(method?.amount || 0),
            `${method?.percentage || 0}%`
          ]);
        });
      }
      
      // Convert to CSV string
      const csvString = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `earnings-report-${selectedPeriod}-${selectedYear}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Earnings report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export earnings report');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
        <p className="text-gray-600">Track your tour earnings and payouts</p>
      </div>

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.totalEarnings)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.thisMonth)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.pendingPayouts)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Wallet className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Payouts</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.completedPayouts)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  <PieChart className="w-4 h-4" />
                </button>
              </div>
            </div>
            <LineChart 
              data={earnings.monthlyTrend || []} 
              title="Monthly Earnings Trend" 
              color="green" 
            />
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Tours</span>
              <span className="font-semibold">{formatCurrency(earnings.completedPayouts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Tours</span>
              <span className="font-semibold">{formatCurrency(earnings.pendingPayouts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform Fee (10%)</span>
              <span className="font-semibold text-red-600">-{formatCurrency(earnings.totalEarnings * 0.1)}</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-semibold">Net Earnings</span>
              <span className="font-bold text-green-600">{formatCurrency(earnings.totalEarnings * 0.9)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Booking ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{formatDate(transaction.date)}</td>
                  <td className="py-3 px-4 text-gray-900">{transaction.description}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{transaction.bookingId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
