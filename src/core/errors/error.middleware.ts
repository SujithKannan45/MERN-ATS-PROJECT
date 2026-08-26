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

  // Handle Mongoose / MongoDB CastError (Invalid ObjectId)
  if (error.name === 'CastError') {
    const castErr = error as unknown as { path: string; value: unknown };
    error = new AppError(
      `Invalid parameter for '${castErr.path}': '${castErr.value}'`,
      HttpStatusCode.BAD_REQUEST
    );
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if ('code' in error && (error as MongoDuplicateKeyError).code === 11000) {
    const dupErr = error as MongoDuplicateKeyError;
    const field = Object.keys(dupErr.keyValue || {})[0] || 'field';
    const value = dupErr.keyValue ? dupErr.keyValue[field] : 'unknown';
    error = new AppError(
      `Duplicate value entered for ${field}: '${value}'. Resource must be unique.`,
      HttpStatusCode.CONFLICT
    );
  }

  // Handle Mongoose Validation Error
  if (error.name === 'ValidationError' && !('issues' in error)) {
    const validationErr = error as unknown as { errors: Record<string, { message: string }> };
    const messages = Object.values(validationErr.errors).map((el) => el.message);
    error = new AppError(
      `Validation error: ${messages.join('. ')}`,
      HttpStatusCode.UNPROCESSABLE_ENTITY
    );
  }

  // Handle Zod Schema Validation Error
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

  // Handle JSON Syntax Error in request body
  if (error instanceof SyntaxError && 'status' in error && error.status === 400 && 'body' in error) {
    error = new AppError('Malformed JSON payload in request body', HttpStatusCode.BAD_REQUEST);
  }

  // Handle JWT specific errors
  if (error.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token', HttpStatusCode.UNAUTHORIZED);
  }

  if (error.name === 'TokenExpiredError') {
    error = new AppError('Authentication token has expired. Please log in again.', HttpStatusCode.UNAUTHORIZED);
  }

  const appError = error instanceof AppError
    ? error
    : new AppError(
        envConfig.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false
      );

  // Log error details
  if (appError.statusCode >= 500) {
    logger.error(`[Unhandled/Server Error] ${req.method} ${req.originalUrl}: ${appError.message}`, {
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      body: req.body,
    });
  } else {
    logger.warn(`[Client/Operational Error] ${req.method} ${req.originalUrl}: ${appError.message}`, {
      statusCode: appError.statusCode,
      details: appError.details,
    });
  }

  // Response for Development
  if (envConfig.NODE_ENV === 'development') {
    res.status(appError.statusCode).json({
      status: appError.status,
      statusCode: appError.statusCode,
      message: appError.message,
      details: appError.details || null,
      stack: error.stack,
      error: appError,
    });
    return;
  }

  // Response for Production
  if (appError.isOperational) {
    res.status(appError.statusCode).json({
      status: appError.status,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    });
    return;
  }

  // Obfuscate internal programming bugs in Production
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'An unexpected internal error occurred. Please contact support.',
  });
};
