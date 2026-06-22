import mongoose from 'mongoose';
import initializeDatabase from './initDb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dharshan:grove123@cluster0.cqnmwfz.mongodb.net/?appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, initialized: false };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Initialize database on first connection
    if (!cached.initialized) {
      await initializeDatabase();
      cached.initialized = true;
    }
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
