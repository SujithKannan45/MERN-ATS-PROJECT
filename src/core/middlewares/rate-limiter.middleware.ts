import rateLimit from 'express-rate-limit';
import { envConfig } from '../../config/env.config.js';
import { TooManyRequestsError } from '../errors/app-error.js';

export const globalRateLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
  max: envConfig.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError(`Too many requests. Please try again after ${Math.ceil(envConfig.RATE_LIMIT_WINDOW_MS / 60000)} minutes.`));
  },
  skip: () => envConfig.NODE_ENV === 'test',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many authentication attempts. Please try again after 15 minutes.'));
  },
  skip: () => envConfig.NODE_ENV === 'test',
});
