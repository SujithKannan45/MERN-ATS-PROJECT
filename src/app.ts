import express, { Express } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { envConfig } from './config/env.config.js';
import { configureSecurityMiddlewares } from './core/middlewares/security.middleware.js';
import { morganMiddleware } from './core/middlewares/morgan.middleware.js';
import { globalRateLimiter } from './core/middlewares/rate-limiter.middleware.js';
import { globalErrorHandler } from './core/errors/error.middleware.js';
import { NotFoundError } from './core/errors/app-error.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { apiRouter } from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // Enable trust proxy for AWS ALB / CloudFront / Nginx reverse proxies
  app.set('trust proxy', 1);

  // 1. HTTP Request Logging (Morgan + Winston)
  app.use(morganMiddleware);

  // 2. Security Middlewares (Helmet, CORS, Mongo Sanitize, HPP)
  configureSecurityMiddlewares(app);

  // 3. Performance Compression (Gzip / Deflate)
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  // 4. Request Body Parsers & Cookie Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(envConfig.COOKIE_SECRET));

  // 5. Global Rate Limiter
  app.use(globalRateLimiter);

  // 6. Direct Root Health Check (Commonly polled by AWS ALB & Kubernetes Liveness Probes)
  app.use('/health', healthRoutes);

  // 7. Versioned API Routes (/api/v1)
  app.use(envConfig.API_PREFIX, apiRouter);

  // 8. 404 Handler for Unhandled Routes
  app.use('*', (req, _res, next) => {
    next(new NotFoundError(`Resource not found on this server: [${req.method}] ${req.originalUrl}`));
  });

  // 9. Global Centralized Error Handling Middleware
  app.use(globalErrorHandler);

  return app;
};
