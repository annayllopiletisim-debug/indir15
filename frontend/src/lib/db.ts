import mongoose from 'mongoose';

// Use MONGO_URL (Emergent production) first, then MONGODB_URI (local/preview) as fallback
const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || '';

// Get database name - called at runtime each time
function getDbName(): string {
  // Explicit DB_NAME from environment always wins (required for Emergent deployment)
  if (process.env.DB_NAME) {
    return process.env.DB_NAME;
  }
  
  // Try to extract from connection URI
  const uri = process.env.MONGO_URL || process.env.MONGODB_URI || '';
  if (uri) {
    // Extract database name from mongodb://host:port/dbname or mongodb+srv://...
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Fail fast if no database name can be determined
  throw new Error('DB_NAME environment variable is required');
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

  // Get db name at runtime to handle preview vs production correctly
  const dbName = getDbName();

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      dbName: dbName,
    };

    console.log(`Connecting to MongoDB (database: ${dbName})...`);
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
