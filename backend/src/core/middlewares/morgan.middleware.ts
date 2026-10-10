import morgan, { StreamOptions } from 'morgan';
import { logger } from '../logger/logger.js';
import { envConfig } from '../../config/env.config.js';

// Pipe Morgan output to Winston HTTP level
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging in test environment
const skip = () => {
  return envConfig.NODE_ENV === 'test';
};

// Morgan format string based on environment
const format = envConfig.NODE_ENV === 'production'
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
  : ':method :url :status :res[content-length] - :response-time ms';

export const morganMiddleware = morgan(format, { stream, skip });
