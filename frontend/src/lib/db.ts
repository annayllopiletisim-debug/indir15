import mongoose from 'mongoose';

// Use ONLY MONGO_URL provided by Emergent - ignore MONGODB_URI completely
const MONGODB_URI = process.env.MONGO_URL || '';

// Database name
const DB_NAME = process.env.DB_NAME || 'indirimci-2-savvy_saver_db';

if (!MONGODB_URI) {
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
  // Return early if no URI configured
  if (!MONGODB_URI) {
    console.error('Database connection failed: No MONGODB_URI configured');
    throw new Error('Database not configured');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
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
