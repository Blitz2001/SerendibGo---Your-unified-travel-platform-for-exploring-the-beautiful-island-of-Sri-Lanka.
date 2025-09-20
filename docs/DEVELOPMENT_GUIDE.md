# 🚀 SerendibGo Development Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Development Setup](#development-setup)
3. [Architecture & Structure](#architecture--structure)
4. [Development Workflow](#development-workflow)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

## 🏝️ Project Overview

**SerendibGo** is a unified travel platform for Sri Lanka that connects travelers with hotels, vehicles, guides, and tour packages. The platform addresses the fragmentation in the tourism industry by providing a single interface for all travel-related services.

### 🎯 Key Features

- **Multi-Role User Management**: Tourists, Hotel Owners, Tour Guides, Vehicle Providers, Admins
- **Unified Booking System**: Hotels, vehicles, guides, and tour packages
- **AI-Powered Chatbot**: Instant tourist assistance and recommendations
- **Real-Time Tracking**: GPS integration for tourist safety
- **Secure Payments**: PayHere integration for Sri Lankan payment processing
- **Mobile-First Design**: Responsive design for all devices
- **Multilingual Support**: English, Sinhala, and Tamil

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Redis**: Local installation or Redis Cloud account
- **Git**: For version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serendibgo
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Install dependencies**
   ```bash
   npm run install-all
   ```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/serendibgo
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# External APIs
PAYHERE_API_KEY=your-payhere-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENDGRID_API_KEY=your-sendgrid-key
OPENAI_API_KEY=your-openai-key

# File Storage
BACKBLAZE_APPLICATION_KEY=your-backblaze-key
BACKBLAZE_APPLICATION_KEY_ID=your-backblaze-key-id
BACKBLAZE_BUCKET_ID=your-bucket-id
```

## 🏗️ Architecture & Structure

### Technology Stack

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB
- **Authentication**: JWT tokens
- **Payment**: PayHere API
- **Maps**: Google Maps API
- **Storage**: Backblaze B2
- **AI Chatbot**: OpenAI API

### Project Structure

```
serendibgo/
├── client/                 # React.js Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js Backend
│   ├── routes/            # API route definitions
│   ├── controllers/       # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── utils/             # Utility functions
├── docs/                  # Project documentation
├── diagrams/              # UML, DFD, System diagrams
└── package.json           # Root dependencies
```

## 🔄 Development Workflow

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/user-authentication
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: implement user authentication system"
   ```

3. **Push and create pull request**
   ```bash
   git push origin feature/user-authentication
   # Create PR on GitHub/GitLab
   ```

### Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Install all dependencies
npm run install-all

# Build frontend for production
npm run build

# Run tests
npm test
```

### Code Standards

- **Frontend**: Use functional components with hooks
- **Backend**: Follow RESTful API conventions
- **Database**: Use Mongoose schemas with validation
- **Testing**: Write unit tests for all functions
- **Documentation**: Comment complex logic and API endpoints

## 📡 API Documentation

### Authentication Endpoints

```javascript
// POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "tourist"
}

// POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Tour Endpoints

```javascript
// GET /api/tours
// Query parameters: location, date, price, duration

// POST /api/tours
{
  "title": "Cultural Heritage Tour",
  "description": "Explore ancient temples and cultural sites",
  "duration": 3,
  "price": 15000,
  "location": "Kandy",
  "inclusions": ["Guide", "Transport", "Meals"]
}
```

### Booking Endpoints

```javascript
// POST /api/bookings
{
  "tourId": "tour_id_here",
  "userId": "user_id_here",
  "startDate": "2024-02-15",
  "endDate": "2024-02-17",
  "participants": 2,
  "totalAmount": 30000
}
```

## 🗄️ Database Schema

### User Model

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['tourist', 'hotel_owner', 'guide', 'driver', 'admin'],
    default: 'tourist'
  },
  profile: {
    phone: String,
    address: String,
    preferences: [String]
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

### Tour Model

```javascript
const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: Number, required: true }, // days
  price: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  inclusions: [String],
  exclusions: [String],
  images: [String],
  availability: [{
    date: Date,
    availableSlots: Number
  }],
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});
```

### Booking Model

```javascript
const bookingSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now }
});
```

## 🧪 Testing Strategy

### Testing Levels

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database operations
3. **End-to-End Tests**: Test complete user workflows
4. **User Acceptance Tests**: Test with real users

### Testing Tools

- **Backend**: Jest + Supertest
- **Frontend**: React Testing Library + Jest
- **API Testing**: Postman collections
- **Database Testing**: MongoDB test database

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment Guide

### Development Deployment

```bash
# Start development servers
npm run dev
```

### Production Deployment

1. **Build frontend**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   NODE_ENV=production
   ```

3. **Deploy to cloud platform**
   - Heroku
   - AWS
   - DigitalOcean
   - Vercel (frontend)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
REDIS_URL=your-production-redis-url
JWT_SECRET=your-production-jwt-secret
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in .env
   - Check network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:5000 | xargs kill -9`

3. **Dependencies Installation Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Frontend Build Errors**
   - Check for syntax errors in components
   - Verify all imports are correct
   - Check Tailwind CSS configuration

### Getting Help

1. Check the project documentation
2. Review error logs in console
3. Search for similar issues on Stack Overflow
4. Create an issue in the project repository
5. Contact team members for assistance

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/)

---

**Happy Coding! 🚀**

For questions or support, contact the development team or create an issue in the repository.
