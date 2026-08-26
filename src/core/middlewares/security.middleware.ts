import { Express } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { envConfig } from '../../config/env.config.js';

export const configureSecurityMiddlewares = (app: Express): void => {
  // Set security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: envConfig.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Configure CORS
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
      if (!origin || envConfig.ALLOWED_ORIGINS.includes(origin) || envConfig.ALLOWED_ORIGINS.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
  };

  app.use(cors(corsOptions));

  // Prevent NoSQL query injection by stripping '$' and '.' characters from user inputs
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clientIp = (req as any).ip;
        console.warn(`[Security Warning] Sanitized malicious key: '${key}' from IP: ${clientIp}`);
      },
    })
  );

  // Prevent HTTP Parameter Pollution (HPP)
  app.use(
    hpp({
      whitelist: ['filter', 'sort', 'page', 'limit', 'fields', 'stage'], // Allowed duplicate query params
    })
  );
};
