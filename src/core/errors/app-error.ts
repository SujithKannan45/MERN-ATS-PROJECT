export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(message, HttpStatusCode.BAD_REQUEST, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: unknown) {
    super(message, HttpStatusCode.UNAUTHORIZED, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden - insufficient permissions', details?: unknown) {
    super(message, HttpStatusCode.FORBIDDEN, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Requested resource not found', details?: unknown) {
    super(message, HttpStatusCode.NOT_FOUND, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists or conflicts with current state', details?: unknown) {
    super(message, HttpStatusCode.CONFLICT, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, true, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.', details?: unknown) {
    super(message, HttpStatusCode.TOO_MANY_REQUESTS, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details?: unknown) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR, true, details);
  }
}
