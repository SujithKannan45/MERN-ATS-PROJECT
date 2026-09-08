import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger.js';

const SLOW_REQUEST_THRESHOLD_MS = 1000;

export const requestTimer = (req: Request, res: Response, next: NextFunction): void => {
  const startHrTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endHrTime = process.hrtime.bigint();
    const durationMs = Number(endHrTime - startHrTime) / 1_000_000;
    const roundedDuration = Math.round(durationMs * 100) / 100;

    // Set header if headers have not already been sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${roundedDuration}ms`);
    }

    // Detect and log slow requests
    if (roundedDuration >= SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn(`⚠️ [SLOW REQUEST DETECTED] ${req.method} ${req.originalUrl} took ${roundedDuration}ms (HTTP ${res.statusCode})`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: roundedDuration,
        ip: req.ip,
        userId: (req as Request & { user?: { userId?: string } }).user?.userId || 'anonymous',
      });
    }
  });

  next();
};
