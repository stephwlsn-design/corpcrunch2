import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    // If connection exists but is not open, clear it
    if (mongoose.connection.readyState !== 1) {
      cached.conn = null;
      cached.promise = null;
    } else {
      return cached.conn;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      family: 4,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 60000,
      // Add heartbeat to detect dead connections
      heartbeatFrequencyMS: 10000,
      // Auto-reconnect settings
      autoIndex: process.env.NODE_ENV !== 'production',
    };

    console.log('[Database] Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('[Database] ✓ Connected successfully');
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
          console.error('[Database] Connection error:', err.message);
        });
        
        mongoose.connection.on('disconnected', () => {
          console.warn('[Database] Disconnected from MongoDB');
          // Clear cache on disconnect
          cached.conn = null;
          cached.promise = null;
        });
        
        mongoose.connection.on('reconnected', () => {
          console.log('[Database] ✓ Reconnected to MongoDB');
        });
        
        return mongoose;
      })
      .catch((err) => {
        console.error('[Database] ❌ Connection error:', err.message);
        cached.promise = null;
        // Don't throw in production to prevent app crashes
        if (process.env.NODE_ENV === 'production') {
          console.error('[Database] Will retry on next request');
        } else {
          throw err;
        }
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    // In production, log but don't crash
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] Connection failed, will retry:', e.message);
      return null;
    }
    throw e;
  }

  return cached.conn;
}

export function resetConnection() {
  if (cached.conn) {
    mongoose.connection.close().catch(() => {});
  }
  cached.conn = null;
  cached.promise = null;
}

export default connectDB;
