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
  if (cached.conn) {
    if (cached.conn.readyState === STATES.connected) {
      console.log('Using cached MongoDB connection');
      return cached.conn;
    }
    // If connection is not in connected state, clear it and reconnect
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 5
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB Connected Successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
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
    res.status(500).json({
      success: false,
      message: 'Database connection error'
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