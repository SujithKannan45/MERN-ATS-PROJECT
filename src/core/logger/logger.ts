import fs from 'fs';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { envConfig } from '../../config/env.config.js';

// Ensure log directory exists
const logDirectory = path.resolve(process.cwd(), envConfig.LOG_DIR);
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Sensitive field keys to automatically redact in logs
const SENSITIVE_KEYS = new Set([
  'password',
  'confirmpassword',
  'currentpassword',
  'newpassword',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'cookie',
  'cookies',
  'secret',
  'apikey',
  'gemini_api_key',
  'x-gemini-api-key',
  'cloudinary_api_secret',
  'jwt_access_secret',
  'jwt_refresh_secret',
  'cookie_secret',
  'smtp_pass',
  'creditcard',
  'cvv',
  'ssn',
]);

/**
 * Recursively deep-redacts sensitive keys in metadata objects and query/body payloads
 */
export const redactSensitiveData = (obj: unknown, depth: number = 0): unknown => {
  if (depth > 6 || obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Redact Bearer tokens in strings
    return obj
      .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED_TOKEN]')
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_GEMINI_KEY]');
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value, depth + 1);
      }
    }
    return redacted;
  }

  return obj;
};

// Custom Winston formatter to automatically redact sensitive information
const redactFormat = winston.format((info) => {
  const result = { ...info };
  // Redact top-level fields
  for (const key of Object.keys(result)) {
    if (key !== 'level' && key !== 'timestamp' && key !== 'message') {
      result[key] = redactSensitiveData(result[key]);
    }
  }
  // Also redact if message itself is an object
  if (typeof result.message === 'object' && result.message !== null) {
    result.message = redactSensitiveData(result.message) as string;
  }
  return result;
});

// Custom log format for development console
const devConsoleFormat = winston.format.combine(
  redactFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${typeof message === 'object' ? JSON.stringify(message) : message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Structured JSON format for production (with service metadata)
const prodJsonFormat = winston.format.combine(
  redactFormat(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: envConfig.NODE_ENV === 'production' ? prodJsonFormat : devConsoleFormat,
  }),
];

// Add daily rotating file transports in non-test environments
if (envConfig.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: prodJsonFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: prodJsonFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'warn',
      format: prodJsonFormat,
    })
  );
}

const baseLogger = winston.createLogger({
  level: envConfig.LOG_LEVEL,
  levels: winston.config.npm.levels,
  defaultMeta: {
    service: 'ats-platform-backend',
    env: envConfig.NODE_ENV,
  },
  format: prodJsonFormat,
  transports,
  exitOnError: false,
});

/**
 * Production-ready extended Winston Logger with domain-specific helpers
 */
export const logger = Object.assign(baseLogger, {
  security: (event: string, meta: Record<string, unknown> = {}): void => {
    baseLogger.warn(`[SECURITY] ${event}`, { category: 'security', ...meta });
  },
  audit: (action: string, meta: Record<string, unknown> = {}): void => {
    baseLogger.info(`[AUDIT] ${action}`, { category: 'audit', ...meta });
  },
  ai: (event: string, meta: Record<string, unknown> = {}): void => {
    baseLogger.info(`[AI_SERVICE] ${event}`, { category: 'ai', ...meta });
  },
  email: (event: string, meta: Record<string, unknown> = {}): void => {
    baseLogger.info(`[EMAIL_SERVICE] ${event}`, { category: 'email', ...meta });
  },
  job: (jobName: string, meta: Record<string, unknown> = {}): void => {
    baseLogger.info(`[BACKGROUND_JOB] ${jobName}`, { category: 'background_job', ...meta });
  },
  database: (event: string, meta: Record<string, unknown> = {}): void => {
    baseLogger.info(`[DATABASE] ${event}`, { category: 'database', ...meta });
  },
});
