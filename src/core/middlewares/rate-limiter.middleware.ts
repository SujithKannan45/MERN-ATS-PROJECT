import rateLimit from 'express-rate-limit';
import { envConfig } from '../../config/env.config.js';
import { TooManyRequestsError } from '../errors/app-error.js';
import { logger } from '../logger/logger.js';

export const globalRateLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
  max: envConfig.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, _res, next) => {
    logger.security(`Global rate limit exceeded from IP: ${req.ip} on ${req.method} ${req.originalUrl}`);
    next(
      new TooManyRequestsError(
        `Too many requests. Please try again after ${Math.ceil(envConfig.RATE_LIMIT_WINDOW_MS / 60000)} minutes.`
      )
    );
  },
  skip: () => envConfig.NODE_ENV === 'test',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res, next) => {
    logger.security(`Auth rate limit exceeded from IP: ${req.ip} on ${req.method} ${req.originalUrl}`);
    next(
      new TooManyRequestsError(
        'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
      )
    );
  },
  skip: () => envConfig.NODE_ENV === 'test',
});

export const aiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // 15 AI requests per IP per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res, next) => {
    logger.security(`AI rate limit exceeded from IP: ${req.ip} on ${req.method} ${req.originalUrl}`);
    next(
      new TooManyRequestsError(
        'AI rate limit reached. To prevent quota exhaustion, please wait 5 minutes before submitting new requests.'
      )
    );
  },
  skip: () => envConfig.NODE_ENV === 'test',
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 file uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res, next) => {
    logger.security(`Upload rate limit exceeded from IP: ${req.ip} on ${req.method} ${req.originalUrl}`);
    next(
      new TooManyRequestsError(
        'File upload limit reached. Please wait 15 minutes before uploading additional documents.'
      )
    );
  },
  skip: () => envConfig.NODE_ENV === 'test',
});
