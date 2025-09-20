// Export utilities for generating downloadable files

// Convert data to CSV format
export const convertToCSV = (data, headers = []) => {
  if (!data || data.length === 0) {
    return '';
  }

  // If headers are provided, use them; otherwise extract from first object
  const csvHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = csvHeaders.map(header => 
    typeof header === 'string' ? `"${header}"` : `"${header.label || header.key}"`
  ).join(',');

  // Create CSV data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const key = typeof header === 'string' ? header : header.key;
      const value = row[key];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return `"${value}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Export bookings data
export const exportBookings = (bookings, filename = 'bookings.csv') => {
  const headers = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'tourTitle', label: 'Tour Title' },
    { key: 'participants', label: 'Participants' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'currency', label: 'Currency' },
    { key: 'status', label: 'Status' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'createdAt', label: 'Created At' }
  ];

  const csvData = bookings.map(booking => ({
    bookingId: booking._id || booking.id,
    tourTitle: booking.tour?.title || booking.guide?.user?.name || 'N/A',
    participants: booking.participants || 1,
    startDate: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A',
    endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A',
    totalAmount: booking.totalAmount || 0,
    currency: booking.currency || 'LKR',
    status: booking.status || 'pending',
    paymentStatus: booking.paymentStatus || 'pending',
    createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'
  }));

  const csvContent = convertToCSV(csvData, headers);
  downloadCSV(csvContent, filename);
};

// Export analytics data
export const exportAnalytics = (analyticsData, filename = 'analytics.csv') => {
  const headers = [
    { key: 'period', label: 'Period' },
    { key: 'bookings', label: 'Total Bookings' },
    { key: 'earnings', label: 'Total Earnings' },
    { key: 'averageRating', label: 'Average Rating' },
    { key: 'reviews', label: 'Total Reviews' }
  ];

  const csvData = analyticsData.map(data => ({
    period: data.period || data.label,
    bookings: data.bookings || data.value || 0,
    earnings: data.earnings || data.amount || 0,
    averageRating: data.averageRating || 0,
    reviews: data.reviews || data.count || 0
  }));

  const csvContent = convertToCSV(csvData, headers);
  downloadCSV(csvContent, filename);
};

// Export messages data
export const exportMessages = (messages, filename = 'messages.csv') => {
  const headers = [
    { key: 'messageId', label: 'Message ID' },
    { key: 'sender', label: 'Sender' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status' },
    { key: 'isRead', label: 'Read' },
    { key: 'createdAt', label: 'Sent At' }
  ];

  const csvData = messages.map(message => ({
    messageId: message._id || message.id,
    sender: message.sender?.name || 'Unknown',
    recipient: message.recipient?.name || 'Unknown',
    subject: message.subject || '',
    message: message.message || '',
    status: message.status || 'sent',
    isRead: message.isRead ? 'Yes' : 'No',
    createdAt: message.createdAt ? new Date(message.createdAt).toLocaleString() : 'N/A'
  }));

  const csvContent = convertToCSV(csvData, headers);
  downloadCSV(csvContent, filename);
};

// Format currency for display
export const formatCurrency = (amount, currency = 'LKR') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Format date for display
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format date and time for display
export const formatDateTime = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
};
