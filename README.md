# 🌴 SerendibGo - Your Unified Travel Platform for Sri Lanka

**SerendibGo** is a comprehensive travel platform that connects travelers with local guides, hotels, tours, and vehicle rentals across the beautiful island of Sri Lanka. Built with modern web technologies, it provides a seamless experience for both travelers and service providers.

## 🚀 Features

### For Travelers
- **🏨 Hotel Booking**: Browse and book accommodations across Sri Lanka
- **🗺️ Tour Packages**: Discover curated tours and experiences
- **👨‍🏫 Local Guides**: Connect with certified local guides
- **🚗 Vehicle Rentals**: Rent cars, bikes, and other vehicles
- **💳 Secure Payments**: Multiple payment options including Stripe integration
- **⭐ Reviews & Ratings**: Read and write reviews for services
- **📱 Responsive Design**: Works perfectly on all devices

### For Service Providers
- **🏨 Hotel Management**: Complete hotel management dashboard
- **👨‍🏫 Guide Portal**: Manage bookings, earnings, and profile
- **🚗 Vehicle Owner Portal**: Manage vehicle rentals and bookings
- **📊 Analytics Dashboard**: Comprehensive analytics and reporting
- **💰 Payment Management**: Track payments and process refunds
- **🔔 Notifications**: Real-time notifications and email alerts

### For Administrators
- **👥 User Management**: Manage all users and their roles
- **📈 Analytics**: Platform-wide analytics and insights
- **🔧 System Management**: Monitor system health and performance
- **💬 Support System**: Handle customer support requests
- **📧 Email Management**: Automated email notifications

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **Winston** - Logging
- **Helmet** - Security
- **CORS** - Cross-origin resource sharing

### Additional Services
- **Google Gemini AI** - Chatbot and AI features
- **Cron Jobs** - Automated reminders
- **Docker** - Containerization
- **Nginx** - Reverse proxy

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v5 or higher) or MongoDB Atlas account
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Blitz2001/SerendibGo---Your-unified-travel-platform-for-exploring-the-beautiful-island-of-Sri-Lanka..git
cd SerendibGo---Your-unified-travel-platform-for-exploring-the-beautiful-island-of-Sri-Lanka.
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install-all

# Or install individually:
npm install                    # Root dependencies
cd server && npm install      # Server dependencies
cd ../client && npm install   # Client dependencies
```

### 3. Environment Setup

Create environment files in the root directory:

#### `env.local` (Development)
```env
# Server Configuration
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/serendibgo

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:3000

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### `env.production` (Production)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/serendibgo
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
GEMINI_API_KEY=your-production-gemini-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
# Windows: Start MongoDB service from Services
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your environment file

### 5. Start the Application

#### Development Mode
```bash
# Start both client and server concurrently
npm run dev

# Or start individually:
npm run server    # Starts server on port 5001
npm run client    # Starts client on port 3000
```

#### Production Mode
```bash
# Build the application
npm run build:prod

# Start production server
npm run start:prod
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start all services:**
```bash
docker-compose up --build
```

2. **Run in background:**
```bash
docker-compose up -d --build
```

3. **Stop services:**
```bash
docker-compose down
```

### Manual Docker Build

```bash
# Build the Docker image
docker build -t serendibgo .

# Run the container
docker run -p 5001:5001 -p 80:80 serendibgo
```

## 📁 Project Structure

```
serendibgo/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/           # Utility functions
│   ├── tests/           # Test files
│   └── package.json
├── docs/                 # Documentation
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Docker image definition
├── nginx.conf           # Nginx configuration
└── package.json         # Root package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5001` | Yes |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` | Yes |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` | Yes |
| `SMTP_USER` | Email username | - | Yes |
| `SMTP_PASS` | Email password | - | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | - | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | - | Yes |

### Database Models

- **User**: User accounts and authentication
- **Hotel**: Hotel information and rooms
- **Tour**: Tour packages and itineraries
- **Guide**: Guide profiles and services
- **Vehicle**: Vehicle rental information
- **Booking**: Hotel bookings
- **TourBooking**: Tour bookings
- **GuideBooking**: Guide bookings
- **VehicleBooking**: Vehicle bookings
- **Payment**: Payment transactions
- **Review**: Reviews and ratings
- **Notification**: User notifications

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests only
cd server && npm test

# Run client tests only
cd client && npm test
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Reset password

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel (Admin/Hotel Owner)
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/:id` - Get tour by ID
- `POST /api/tours` - Create tour (Admin)
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Delete tour

### Guides
- `GET /api/guides` - Get all guides
- `GET /api/guides/:id` - Get guide by ID
- `GET /api/guides/my-profile` - Get my guide profile
- `PUT /api/guides/my-profile` - Update my profile

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/modify` - Modify booking
- `GET /api/bookings/:id/modification-history` - Get modification history

### Payments
- `POST /api/payments/create` - Create payment
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/:id/invoice` - Generate invoice

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/read` - Mark as read
- `GET /api/notifications/unread-count` - Get unread count

### Analytics (Admin Only)
- `GET /api/analytics/platform` - Platform analytics
- `GET /api/analytics/bookings` - Booking analytics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/users` - User analytics

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request validation
- **SQL Injection Protection**: Mongoose ODM
- **XSS Protection**: Input sanitization

## 📧 Email Features

- **Password Reset**: Automated password reset emails
- **Email Verification**: Account verification emails
- **Booking Confirmations**: Booking confirmation emails
- **Payment Confirmations**: Payment receipt emails
- **Booking Reminders**: Automated reminder emails
- **Refund Notifications**: Refund confirmation emails

## 🔔 Notification System

- **Real-time Notifications**: In-app notifications
- **Email Notifications**: Email alerts
- **Priority Levels**: Low, Medium, High, Urgent
- **Admin Broadcasting**: System-wide announcements
- **Read/Unread Tracking**: Notification status tracking

## 📈 Analytics & Reporting

- **Platform Analytics**: Overall platform metrics
- **Booking Analytics**: Booking trends and statistics
- **Revenue Analytics**: Financial reporting
- **User Analytics**: User behavior and demographics
- **Real-time Dashboards**: Live data visualization

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB
- [ ] Set up production email service
- [ ] Configure Stripe live keys
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Deployment Options

1. **Traditional VPS/Cloud Server**
2. **Docker Containers**
3. **Kubernetes**
4. **Serverless (AWS Lambda, Vercel)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Blitz2001/SerendibGo---Your-unified-travel-platform-for-exploring-the-beautiful-island-of-Sri-Lanka./issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Express.js Team** - For the robust backend framework
- **MongoDB Team** - For the flexible database
- **Tailwind CSS Team** - For the utility-first CSS framework
- **Stripe Team** - For the payment processing platform

## 📞 Contact

**Project Maintainer**: [Blitz2001](https://github.com/Blitz2001)

**Email**: [Your Email]

**Project Link**: [https://github.com/Blitz2001/SerendibGo---Your-unified-travel-platform-for-exploring-the-beautiful-island-of-Sri-Lanka.](https://github.com/Blitz2001/SerendibGo---Your-unified-travel-platform-for-exploring-the-beautiful-island-of-Sri-Lanka.)

---

**Made with ❤️ for Sri Lanka Tourism**