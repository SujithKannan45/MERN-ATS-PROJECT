import express, { Express } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { envConfig } from './config/env.config.js';
import { configureSecurityMiddlewares } from './core/middlewares/security.middleware.js';
import { morganMiddleware } from './core/middlewares/morgan.middleware.js';
import { requestTimer } from './core/middlewares/request-timer.middleware.js';
import { globalRateLimiter } from './core/middlewares/rate-limiter.middleware.js';
import { globalErrorHandler } from './core/errors/error.middleware.js';
import { NotFoundError } from './core/errors/app-error.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { apiRouter } from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // Enable trust proxy for AWS ALB / CloudFront / Nginx reverse proxies
  app.set('trust proxy', 1);

  // 1. High-resolution Request Duration & Slow Request Tracker
  app.use(requestTimer);

  // 2. HTTP Request Logging (Morgan + Winston)
  app.use(morganMiddleware);

  // 3. Security Middlewares (Hardened Helmet, CSP, CORS, NoSQL injection, XSS clean, HPP)
  configureSecurityMiddlewares(app);

  // 4. Performance Compression (Gzip / Deflate)
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

  // 5. Request Body Parsers with Strict Size Limits (1MB default to prevent payload DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(envConfig.COOKIE_SECRET));

  // 6. Global Rate Limiter
  app.use(globalRateLimiter);

  // 7. Direct Root Health Check (Polled by AWS ALB & Kubernetes Liveness Probes)
  app.use('/health', healthRoutes);

  // 8. Versioned API Routes (/api/v1)
  app.use(envConfig.API_PREFIX, apiRouter);

  // 9. 404 Handler for Unhandled Routes
  app.use('*', (req, _res, next) => {
    next(new NotFoundError(`Resource not found on this server: [${req.method}] ${req.originalUrl}`));
  });

  // 10. Global Centralized Error Handling Middleware
  app.use(globalErrorHandler);

  return app;
};
