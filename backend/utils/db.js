import mongoose from 'mongoose';

// Track the connection state
const STATES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
};

// Cache the database connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    console.log('Connection attempt started...');
    console.log('Current connection state:', mongoose.connection.readyState);
    
    if (cached.conn) {
      if (cached.conn.readyState === STATES.connected) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
      }
      console.log('Cached connection exists but not in connected state, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Add additional connection parameters to URI if they don't exist
    let uri = process.env.MONGODB_URI;
    if (!uri.includes('retryWrites=')) {
      uri += (uri.includes('?') ? '&' : '?') + 'retryWrites=true';
    }
    if (!uri.includes('w=')) {
      uri += '&w=majority';
    }
    if (!uri.includes('connectTimeoutMS=')) {
      uri += '&connectTimeoutMS=10000';
    }
    if (!uri.includes('socketTimeoutMS=')) {
      uri += '&socketTimeoutMS=45000';
    }

    console.log('MongoDB URI format check:', uri.startsWith('mongodb+srv://') ? 'Valid srv format' : 'Invalid format');

    if (!cached.promise) {
      const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 60000,
        compressors: 'zlib',
        keepAlive: true,
        keepAliveInitialDelay: 300000
      };

      console.log('Attempting new connection with options:', JSON.stringify(opts));

      // Add event listeners before connecting
      mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
      mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
      mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

      cached.promise = mongoose.connect(uri, opts)
        .then((mongoose) => {
          console.log('MongoDB Connected Successfully');
          console.log('Connection state after connect:', mongoose.connection.readyState);
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            state: mongoose.connection.readyState
          });
          cached.promise = null;
          throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Connection error in connectDB:', error);
    cached.promise = null;
    throw error;
  }
};

// Middleware to ensure DB connection
const ensureDbConnected = async (req, res, next) => {
  try {
    console.log('ensureDbConnected: Starting connection check');
    
    // Add request timeout
    const timeout = setTimeout(() => {
      console.error('Connection timeout in middleware');
      res.status(500).json({
        success: false,
        message: 'Database connection timeout'
      });
    }, 9000); // Set to 9s to be under Vercel's function timeout

    await connectDB();
    clearTimeout(timeout);
    
    console.log('ensureDbConnected: Connection successful');
    next();
  } catch (error) {
    console.error('Database connection middleware error:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
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
      if (cached.conn) {
        await cached.conn.disconnect();
        console.log('MongoDB disconnected through app termination');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });
});

export { connectDB, ensureDbConnected }; 