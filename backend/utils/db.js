import mongoose from 'mongoose';

// Track the connection state
const STATES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
};

// Cache the database connection globally
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    isConnecting: false,
    lastConnectionAttempt: 0
  };
}

// Minimum time between connection attempts (5 seconds)
const MIN_INTERVAL = 5000;

const connectDB = async () => {
  try {
    // Check if we're already connecting
    if (cached.isConnecting) {
      console.log('Connection attempt already in progress, waiting...');
      return cached.promise;
    }

    // Check if we have a recent connection attempt
    const now = Date.now();
    if (now - cached.lastConnectionAttempt < MIN_INTERVAL) {
      console.log('Too many connection attempts, waiting...');
      return cached.promise || Promise.reject(new Error('Connection throttled'));
    }

    // Check existing connection
    if (cached.conn) {
      if (cached.conn.readyState === STATES.connected) {
        console.log('Using existing MongoDB connection');
        return cached.conn;
      }
      console.log('Cached connection exists but not in connected state, reconnecting...');
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Update connection attempt timestamp
    cached.lastConnectionAttempt = now;
    cached.isConnecting = true;

    // Parse and update connection string
    const uri = new URL(process.env.MONGODB_URI);
    uri.searchParams.set('retryWrites', 'true');
    uri.searchParams.set('w', 'majority');
    uri.searchParams.set('maxPoolSize', '10');
    uri.searchParams.set('minPoolSize', '5');
    uri.searchParams.set('maxIdleTimeMS', '60000');
    uri.searchParams.set('connectTimeoutMS', '30000');
    uri.searchParams.set('socketTimeoutMS', '45000');
    uri.searchParams.set('serverSelectionTimeoutMS', '30000');
    uri.searchParams.set('appName', 'ViralDeals');

    const opts = {
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    };

    // Create new connection promise
    cached.promise = mongoose
      .connect(uri.toString(), opts)
      .then((mongoose) => {
        console.log('New MongoDB connection established');
        cached.conn = mongoose.connection;
        return mongoose.connection;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', {
          name: error.name,
          message: error.message,
          code: error.code
        });
        cached.promise = null;
        throw error;
      })
      .finally(() => {
        cached.isConnecting = false;
      });

    return cached.promise;
  } catch (error) {
    console.error('Connection error in connectDB:', error);
    cached.isConnecting = false;
    cached.promise = null;
    throw error;
  }
};

// Middleware to ensure DB connection
const ensureDbConnected = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Handle process termination
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected through app termination');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });
});

export { connectDB, ensureDbConnected }; 