import mongoose from 'mongoose';

// Use MONGO_URL (Emergent production) first, then MONGODB_URI (local/preview) as fallback
// In production, ONLY MONGO_URL will be available
const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || '';

// Database name - use from env or extract from connection string
const DB_NAME = process.env.DB_NAME || 'indirimci-2-savvy_saver_db';

// Check if we're in build phase (no DB available)
const IS_BUILD_PHASE = process.env.NODE_ENV === 'production' && !MONGODB_URI;

if (!MONGODB_URI && !IS_BUILD_PHASE) {
  console.error('WARNING: MONGO_URL environment variable not defined');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  // Return early if no URI configured (build phase or missing config)
  if (!MONGODB_URI) {
    const errorMsg = 'Database connection failed: No MONGODB_URI configured';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Reduced timeout for faster failure during build
      connectTimeoutMS: 5000,
      dbName: DB_NAME, // Explicitly specify database name
    };

    console.log(`Connecting to MongoDB (database: ${DB_NAME})...`);
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB connection error:', err.message);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
