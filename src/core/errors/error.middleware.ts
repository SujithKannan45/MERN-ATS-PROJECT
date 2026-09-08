import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, HttpStatusCode } from './app-error.js';
import { logger } from '../logger/logger.js';
import { envConfig } from '../../config/env.config.js';

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error = err;

  // 1. Handle Mongoose / MongoDB CastError (Invalid ObjectId parameter)
  if (error.name === 'CastError') {
    const castErr = error as unknown as { path: string; value: unknown };
    error = new AppError(
      `Invalid parameter for '${castErr.path}': '${castErr.value}'`,
      HttpStatusCode.BAD_REQUEST
    );
  }

  // 2. Handle MongoDB Duplicate Key Error (E11000)
  if ('code' in error && (error as MongoDuplicateKeyError).code === 11000) {
    const dupErr = error as MongoDuplicateKeyError;
    const field = Object.keys(dupErr.keyValue || {})[0] || 'field';
    const value = dupErr.keyValue ? dupErr.keyValue[field] : 'unknown';
    error = new AppError(
      `Duplicate value entered for ${field}: '${value}'. Resource must be unique.`,
      HttpStatusCode.CONFLICT
    );
  }

  // 3. Handle Mongoose Schema Validation Error
  if (error.name === 'ValidationError' && !('issues' in error)) {
    const validationErr = error as unknown as { errors: Record<string, { message: string }> };
    const messages = Object.values(validationErr.errors).map((el) => el.message);
    error = new AppError(
      `Validation error: ${messages.join('. ')}`,
      HttpStatusCode.UNPROCESSABLE_ENTITY
    );
  }

  // 4. Handle Zod Schema Validation Error
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    error = new AppError(
      'Request input validation failed',
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      true,
      formattedErrors
    );
  }

  // 5. Handle JSON Syntax Error in request body
  if (error instanceof SyntaxError && 'status' in error && error.status === 400 && 'body' in error) {
    error = new AppError('Malformed JSON payload in request body', HttpStatusCode.BAD_REQUEST);
  }

  // 6. Handle Request Payload / Entity Too Large (Multer / Express body-parser)
  if (
    error.name === 'PayloadTooLargeError' ||
    ('type' in error && (error as unknown as { type: string }).type === 'entity.too.large') ||
    ('code' in error && (error as unknown as { code: string }).code === 'LIMIT_FILE_SIZE')
  ) {
    error = new AppError(
      'Request payload exceeds maximum allowed size.',
      HttpStatusCode.BAD_REQUEST
    );
  }

  // 7. Handle JWT Authentication Errors
  if (error.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token.', HttpStatusCode.UNAUTHORIZED);
  }

  if (error.name === 'TokenExpiredError') {
    error = new AppError(
      'Authentication token has expired. Please log in again.',
      HttpStatusCode.UNAUTHORIZED
    );
  }

  // 8. Handle MongoDB Network / Server Selection Failures
  if (
    error.name === 'MongoServerSelectionError' ||
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError'
  ) {
    logger.database('Database connection error in request handler', { error: error.message });
    error = new AppError(
      'Database service is temporarily unavailable. Please retry in a few moments.',
      HttpStatusCode.SERVICE_UNAVAILABLE
    );
  }

  // 9. Handle Google Gemini AI Quota / Rate-limit / Timeout Errors
  if (
    error.message.includes('RESOURCE_EXHAUSTED') ||
    error.message.includes('quota') ||
    error.message.includes('429')
  ) {
    logger.ai('Gemini AI quota / rate-limit encountered in request', { error: error.message });
    error = new AppError(
      'AI service quota temporarily exhausted. Please wait a moment before retrying.',
      HttpStatusCode.TOO_MANY_REQUESTS
    );
  } else if (
    error.message.includes('Gemini API request timed out') ||
    error.message.includes('ETIMEDOUT')
  ) {
    logger.ai('Gemini AI request timeout', { error: error.message });
    error = new AppError(
      'AI evaluation request timed out. Please retry with a shorter prompt or description.',
      HttpStatusCode.GATEWAY_TIMEOUT
    );
  }

  // 10. Handle Email / SMTP Errors
  if (
    error.message.includes('ECONNREFUSED') &&
    (error.message.includes('SMTP') || error.message.includes('587') || error.message.includes('465'))
  ) {
    logger.email('SMTP server connection refused', { error: error.message });
    error = new AppError(
      'Email notification delivery is temporarily unavailable.',
      HttpStatusCode.SERVICE_UNAVAILABLE
    );
  }

  const appError =
    error instanceof AppError
      ? error
      : new AppError(
          envConfig.NODE_ENV === 'production' ? 'Internal server error' : error.message,
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false
        );

  // Log error details with sensitive data masked
  if (appError.statusCode >= 500) {
    logger.error(
      `[Unhandled/Server Error] ${req.method} ${req.originalUrl}: ${appError.message}`,
      {
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        statusCode: appError.statusCode,
        userId: (req as Request & { user?: { userId?: string } }).user?.userId || 'anonymous',
      }
    );
  } else {
    logger.warn(
      `[Client/Operational Error] ${req.method} ${req.originalUrl}: ${appError.message}`,
      {
        statusCode: appError.statusCode,
        details: appError.details,
        ip: req.ip,
      }
    );
  }

  // Standardized response payload for Development
  if (envConfig.NODE_ENV === 'development') {
    res.status(appError.statusCode).json({
      success: false,
      status: appError.status,
      statusCode: appError.statusCode,
      message: appError.message,
      details: appError.details || null,
      stack: error.stack,
    });
    return;
  }

  // Standardized response payload for Production
  if (appError.isOperational) {
    res.status(appError.statusCode).json({
      success: false,
      status: appError.status,
      statusCode: appError.statusCode,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    });
    return;
  }

  // Obfuscate internal programming bugs in Production
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    status: 'error',
    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: 'An unexpected internal error occurred. Please contact support.',
  });
};
