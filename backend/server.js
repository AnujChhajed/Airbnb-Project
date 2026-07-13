require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Connect to MongoDB Database
connectDB();

// 1. Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows browser to load static images from backend
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 2. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Session Storage in MongoDB Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretairbnbkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // Session expiration: 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, // Prevents XSS cookie theft
      secure: false, // Set to true in production if using HTTPS
      sameSite: 'lax', // Required for cross-site cookie settings
    },
  })
);

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/reviews', reviewRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Airbnb MERN API Server' });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// 6. Global Centralized Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Airbnb backend running on port ${PORT}`);
});
