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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('Using existing MongoDB connection');
      return;
    }

    // Log the MongoDB URI (without sensitive data) for debugging
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/viraldeals';
    console.log('Connecting to MongoDB:', mongoURI.replace(/:([^:@]{4,}@)/g, ':****@'));
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
    });
    
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error Details:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    if (error.reason) console.error('Error Reason:', error.reason);
    
    // Check if it's a connection string issue
    if (error.message.includes('ENOTFOUND') || error.message.includes('Invalid connection string')) {
      console.error('Invalid MongoDB connection string. Please check your MONGODB_URI environment variable.');
    }
    
    throw error; // Re-throw to be handled by error middleware
  }
};

// Initialize database connection with retry logic
const initDB = async (retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectDB();
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.error('Failed to connect to MongoDB after', retries, 'attempts');
        throw error;
      }
      console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize database connection
initDB().catch(error => {
  console.error('Database connection error:', error);
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ViralDeals.online API is running!',
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
