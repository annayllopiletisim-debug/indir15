import mongoose from 'mongoose';

// Connection string from environment
let MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('Please define MONGO_URL or MONGODB_URI environment variable');
}

// For production, append database name to connection string if not present
const isProduction = MONGODB_URI.includes('mongodb.net');
if (isProduction && !MONGODB_URI.includes('mongodb.net/indirimci-2-savvy_saver_db')) {
  // Insert database name into the connection string
  MONGODB_URI = MONGODB_URI.replace('mongodb.net/', 'mongodb.net/indirimci-2-savvy_saver_db');
  MONGODB_URI = MONGODB_URI.replace('mongodb.net?', 'mongodb.net/indirimci-2-savvy_saver_db?');
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
