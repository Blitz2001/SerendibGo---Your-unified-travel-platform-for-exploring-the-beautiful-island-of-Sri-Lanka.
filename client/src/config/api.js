// API Configuration
const API_CONFIG = {
  // Backend server URL
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      ME: '/api/auth/me',
      LOGOUT: '/api/auth/logout',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      SEND_VERIFICATION: '/api/auth/send-verification',
      VERIFY_EMAIL: '/api/auth/verify-email'
    },
    
    // Tours
    TOURS: {
      LIST: '/api/tours',
      DETAIL: (id) => `/api/tours/${id}`,
      CREATE: '/api/tours',
      UPDATE: (id) => `/api/tours/${id}`,
      DELETE: (id) => `/api/tours/${id}`,
      BOOK: (id) => `/api/tours/${id}/book`,
      MY_BOOKINGS: '/api/tours/bookings/my',
      GET_BOOKING: (id) => `/api/tours/bookings/${id}`,
      CANCEL_BOOKING: (id) => `/api/tours/bookings/${id}/cancel`,
      UPDATE_BOOKING_STATUS: (id) => `/api/tours/bookings/${id}/status`
    },
    
    // Users
    USERS: {
      LIST: '/api/users',
      DETAIL: (id) => `/api/users/${id}`,
      UPDATE: (id) => `/api/users/${id}`,
      DELETE: (id) => `/api/users/${id}`
    },
    
    // Bookings
    BOOKINGS: {
      GET_ALL: '/api/bookings',
      CREATE: '/api/bookings',
      GET_BY_ID: (id) => `/api/bookings/${id}`,
      UPDATE: (id) => `/api/bookings/${id}`,
      CANCEL: (id) => `/api/bookings/${id}/cancel`,
      UPDATE_STATUS: (id) => `/api/bookings/${id}/status`,
      GET_HOTEL_BOOKINGS: (hotelId) => `/api/bookings/hotel/${hotelId}`,
      CHECK_AVAILABILITY: '/api/bookings/check-availability'
    },
    
    // Hotels
    HOTELS: {
      GET_ALL: '/api/hotels',
      GET_BY_ID: (id) => `/api/hotels/${id}`,
      CREATE: '/api/hotels',
      UPDATE: (id) => `/api/hotels/${id}`,
      DELETE: (id) => `/api/hotels/${id}`,
      MY_HOTELS: '/api/hotels/owner/my-hotels',
      ADD_REVIEW: (id) => `/api/hotels/${id}/reviews`,
      SEARCH_NEARBY: '/api/hotels/search/nearby',
      STATS: (id) => `/api/hotels/${id}/stats`,
      UPLOAD_IMAGES: (id) => `/api/hotels/${id}/images`
    },
    
    // Guides
    GUIDES: {
      LIST: '/api/guides',
      DETAIL: (id) => `/api/guides/${id}`,
      SEARCH: '/api/guides/search'
    },
    
    // Vehicles
    VEHICLES: {
      LIST: '/api/vehicles',
      DETAIL: (id) => `/api/vehicles/${id}`,
      SEARCH: '/api/vehicles/search'
    },
    
    // Reviews
    REVIEWS: {
      LIST: '/api/reviews',
      CREATE: '/api/reviews',
      UPDATE: (id) => `/api/reviews/${id}`,
      DELETE: (id) => `/api/reviews/${id}`
    },

    // Payments
    PAYMENTS: {
      CREATE: '/api/payments/create',
      VERIFY: '/api/payments/verify',
      HISTORY: '/api/payments/history',
      DETAIL: (id) => `/api/payments/${id}`,
      REFUND: '/api/payments/refund',
      STATS: '/api/payments/stats'
    },

    // Support
    SUPPORT: {
      CONTACT: '/api/support/contact',
      CATEGORIES: '/api/support/categories',
      MY_REQUESTS: '/api/support/my-requests',
      DETAIL: (id) => `/api/support/requests/${id}`,
      RESPOND: (id) => `/api/support/requests/${id}/respond`,
      UPDATE_STATUS: (id) => `/api/support/requests/${id}/status`
    },

    // Trip Requests
    TRIP_REQUESTS: {
      CREATE: '/api/trip-requests',
      MY_REQUESTS: '/api/trip-requests/my',
      DETAIL: (id) => `/api/trip-requests/${id}`,
      ADMIN_ALL: '/api/trip-requests/admin/all',
      UPDATE_STATUS: (id) => `/api/trip-requests/${id}/status`,
      ASSIGN: (id) => `/api/trip-requests/${id}/assign`,
      ADD_COMMUNICATION: (id) => `/api/trip-requests/${id}/communication`,
      STATS: '/api/trip-requests/stats/overview'
    }
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default API_CONFIG;
