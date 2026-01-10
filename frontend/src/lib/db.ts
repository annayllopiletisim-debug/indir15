import mongoose from 'mongoose';

// Try MONGO_URL first (Emergent's Atlas), then fall back to MONGODB_URI
const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || '';

// Database name - use the app name for Emergent Atlas
const DB_NAME = process.env.DB_NAME || 'indirimci-2';

if (!MONGODB_URI) {
  console.error('Please define MONGO_URL or MONGODB_URI environment variable');
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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
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
