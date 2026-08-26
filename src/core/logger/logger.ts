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

// Custom log format for development console
const devConsoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Structured JSON format for production
const prodJsonFormat = winston.format.combine(
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
    })
  );
}

export const logger = winston.createLogger({
  level: envConfig.LOG_LEVEL,
  levels: winston.config.npm.levels,
  format: prodJsonFormat,
  transports,
  exitOnError: false,
});
