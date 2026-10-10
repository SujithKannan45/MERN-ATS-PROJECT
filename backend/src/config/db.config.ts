import mongoose from 'mongoose';
import { envConfig } from './env.config.js';
import { logger } from '../core/logger/logger.js';

interface DatabaseHealthStatus {
  isConnected: boolean;
  readyState: number;
  host?: string;
  name?: string;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnecting: boolean = false;

  private constructor() {
    this.registerConnectionEvents();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private registerConnectionEvents(): void {
    mongoose.connection.on('connected', () => {
      logger.info(` MongoDB connection established successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err: Error) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`, { error: err });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB connection lost. Disconnected from database.');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected successfully.');
    });
  }

  public async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB is already connected.');
      return;
    }

    if (this.isConnecting) {
      logger.warn('MongoDB connection is already in progress.');
      return;
    }

    this.isConnecting = true;

    try {
      const options: mongoose.ConnectOptions = {
        maxPoolSize: envConfig.MONGODB_MAX_POOL_SIZE,
        minPoolSize: envConfig.MONGODB_MIN_POOL_SIZE,
        connectTimeoutMS: envConfig.MONGODB_CONNECT_TIMEOUT_MS,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        autoIndex: envConfig.NODE_ENV !== 'production',
      };

      await mongoose.connect(envConfig.MONGODB_URI, options);
      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      logger.error('❌ Failed to connect to MongoDB on startup:', { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
        logger.info('MongoDB connection closed gracefully.');
      } catch (error) {
        logger.error('Error during MongoDB disconnection:', { error });
        throw error;
      }
    }
  }

  public getStatus(): DatabaseHealthStatus {
    const readyState = mongoose.connection.readyState;
    return {
      isConnected: readyState === 1,
      readyState,
      host: mongoose.connection.host || undefined,
      name: mongoose.connection.name || undefined,
    };
  }
}

export const dbConnection = DatabaseConnection.getInstance();
