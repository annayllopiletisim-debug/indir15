import mongoose from 'mongoose';

// Connection string from environment
const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || '';

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
    // Determine database name based on environment
    // For Emergent production (MONGO_URL), use 'indirimci-2'
    // For local development (MONGODB_URI with localhost), use 'savvy_saver_db'
    const isProduction = MONGODB_URI.includes('mongodb.net');
    const dbName = isProduction ? 'indirimci-2' : 'savvy_saver_db';
    
    console.log('Connecting to MongoDB:', isProduction ? 'Production (Atlas)' : 'Local');
    console.log('Database name:', dbName);
    
    const opts = {
      bufferCommands: false,
      dbName: dbName,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully to:', dbName);
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
