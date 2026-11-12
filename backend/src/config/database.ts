import mongoose from 'mongoose';
import { env } from './env';

const sanitizeUri = (uri: string): string => {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

export const connectDatabase = async (uri?: string): Promise<typeof mongoose> => {
  const mongoUri = uri || env.MONGODB_URI;

  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB connected successfully to ${sanitizeUri(mongoUri)}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message || err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting to reconnect...');
    });

    const conn = await mongoose.connect(mongoUri, {
      dbName: env.DB_NAME,
      autoIndex: true
    });

    return conn;
  } catch (error: any) {
    console.error(`[Database] Failed to connect to MongoDB (${sanitizeUri(mongoUri)}):`, error.message);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed');
  } catch (error: any) {
    console.error('[Database] Error closing MongoDB connection:', error.message);
  }
};

