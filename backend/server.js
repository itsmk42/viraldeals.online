import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cacheService from './utils/cache.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Maintain at least 1 socket connection
  maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
  retryWrites: true,
  retryReads: true
};

// Keep track of the connection
let cachedDb = null;

// MongoDB connection
const connectDB = async () => {
  try {
    // If we have a cached connection, and it's connected, reuse it
    if (cachedDb && mongoose.connection.readyState === 1) {
      console.log('Using cached database connection');
      return cachedDb;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viraldeals', mongooseOptions);
    
    // Cache the connection
    cachedDb = conn;
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    // In Lambda, we don't want to exit the process on connection failure
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress responses larger than 1KB
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ViralDeals API!',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'ViralDeals API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import scraperRoutes from './routes/scraper.js';

// Serve static files
app.use('/uploads', express.static('uploads'));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/scraper', scraperRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server gracefully...');

  try {
    await cacheService.close();
    await mongoose.connection.close();
    console.log('Database and cache connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Modify startServer to handle Lambda environment
const startServer = async () => {
  await connectDB();
  
  // Only start the Express server if we're not in Lambda
  if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Cache service initialized`);
    });
  }
};

// Export the app and connection function for Lambda handler
export { app, connectDB };

// Start server if we're not in Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}
