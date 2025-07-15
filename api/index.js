// Vercel serverless function entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from '../backend/routes/auth.js';
import productRoutes from '../backend/routes/products.js';
import orderRoutes from '../backend/routes/orders.js';
import paymentRoutes from '../backend/routes/payments.js';
import adminRoutes from '../backend/routes/admin.js';
import uploadRoutes from '../backend/routes/upload.js';
import scraperRoutes from '../backend/routes/scraper.js';
import analyticsRoutes from '../backend/routes/analytics.js';

// Import database connection
import { connectDB, ensureDbConnected } from '../backend/utils/db.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy - required for rate limiting behind Vercel
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      // Add common Vercel patterns
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/viraldeals.*\.vercel\.app$/,
      'https://viraldeals.online',
      'https://www.viraldeals.online'
    ].filter(Boolean);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Initialize database connection
connectDB()
  .then(() => {
    console.log('Initial MongoDB connection successful');
  })
  .catch(error => {
    console.error('Initial database connection error:', error);
  });

// Add connection check middleware
app.use(ensureDbConnected);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ViralDeals.online API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoStatus: mongoose.connections[0].readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint for environment info
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured',
    jwtSecret: process.env.JWT_SECRET ? 'configured' : 'not configured',
    frontendUrl: process.env.FRONTEND_URL || 'not configured',
    mongoStatus: mongoose.connections[0].readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Export for Vercel
export default app;
