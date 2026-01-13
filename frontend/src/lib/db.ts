import mongoose from 'mongoose';

// Use MONGO_URL (Emergent production) first, then MONGODB_URI (local/preview) as fallback
const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || '';

// Database name extraction:
// 1. Use DB_NAME env if set
// 2. For production (MONGO_URL), use 'indirimci-2-savvy_saver_db'
// 3. For local (MONGODB_URI), extract from connection string or use default
function getDbName(): string {
  if (process.env.DB_NAME) {
    return process.env.DB_NAME;
  }
  
  // If using MONGO_URL (production), use hardcoded production db name
  if (process.env.MONGO_URL) {
    return 'indirimci-2-savvy_saver_db';
  }
  
  // For local development, extract from MONGODB_URI or use default
  if (process.env.MONGODB_URI) {
    try {
      const url = new URL(process.env.MONGODB_URI);
      const pathDb = url.pathname.replace('/', '');
      if (pathDb) return pathDb;
    } catch (e) {
      // Invalid URL, use default
    }
  }
  
  return 'savvy_saver_db';
}

const DB_NAME = getDbName();

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
  // Check build phase at runtime (not module load time)
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  
  // During build phase, skip database connection entirely
  if (isBuildPhase) {
    console.log('[BUILD] Skipping database connection during build phase');
    return null as any;
  }
  
  // Return early if no URI configured
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
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      dbName: DB_NAME,
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
