import http from 'http';
import { createApp } from './app.js';
import { envConfig } from './config/env.config.js';
import { dbConnection } from './config/db.config.js';
import { logger } from './core/logger/logger.js';
import { cronScheduler } from './core/schedulers/cron.scheduler.js';
import { emailQueue } from './core/queue/email.queue.js';
import { notificationQueue } from './core/queue/notification.queue.js';

// Catch Uncaught Synchronous Exceptions early
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down process immediately...', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

async function bootstrap() {
  try {
    // 1. Establish MongoDB Connection
    logger.info('Connecting to MongoDB database...');
    await dbConnection.connect();

    // 2. Initialize Background Cron Scheduler
    cronScheduler.init();

    // 3. Initialize Express Application
    const app = createApp();
    const server = http.createServer(app);

    // 4. Start HTTP Server
    server.listen(envConfig.PORT, () => {
      logger.info(`🚀 Server running in [${envConfig.NODE_ENV}] mode on port ${envConfig.PORT}`);
      logger.info(`📡 API Base URL: http://localhost:${envConfig.PORT}${envConfig.API_PREFIX}`);
      logger.info(`🩺 Health Check: http://localhost:${envConfig.PORT}/health`);
    });

    // 5. Graceful Shutdown Management
    const shutdown = async (signal: string) => {
      logger.warn(`🛑 Received ${signal}. Starting graceful shutdown...`);

      // Set force exit safety timeout
      const forceExitTimer = setTimeout(() => {
        logger.error('⚠️ Graceful shutdown timed out. Forcing process exit.');
        process.exit(1);
      }, 10000);

      try {
        // Stop scheduled cron tasks
        cronScheduler.stopAll();

        // Drain active queue jobs
        await Promise.allSettled([
          emailQueue.queue.shutdown(3000),
          notificationQueue.queue.shutdown(3000),
        ]);
      } catch (queueErr) {
        logger.warn('Warning during background queue shutdown:', { queueErr });
      }

      // Stop accepting incoming HTTP connections
      server.close(async () => {
        logger.info('HTTP server closed.');

        try {
          // Disconnect from database
          await dbConnection.disconnect();
          clearTimeout(forceExitTimer);
          logger.info('Clean shutdown completed successfully.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database disconnection during shutdown:', { err });
          clearTimeout(forceExitTimer);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle Unhandled Asynchronous Promise Rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('💥 UNHANDLED REJECTION! Shutting down server gracefully...', { reason });
      shutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    logger.error('❌ Failed to bootstrap application server:', { error });
    process.exit(1);
  }
}

void bootstrap();
