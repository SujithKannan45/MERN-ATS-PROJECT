import { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { envConfig } from '../../config/env.config.js';
import { logger } from '../logger/logger.js';
import { xssClean } from './xss-clean.middleware.js';

export const configureSecurityMiddlewares = (app: Express): void => {
  // 1. Content Security Policy (CSP) & Hardened Helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://res.cloudinary.com',
            'https://*.googleusercontent.com',
          ],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          connectSrc: [
            "'self'",
            ...envConfig.ALLOWED_ORIGINS,
            'https://api.cloudinary.com',
            'https://generativelanguage.googleapis.com',
          ],
          upgradeInsecureRequests: envConfig.NODE_ENV === 'production' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hsts:
        envConfig.NODE_ENV === 'production'
          ? {
              maxAge: 31536000, // 1 year
              includeSubDomains: true,
              preload: true,
            }
          : false,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    })
  );

  // 2. Extra Security Headers (Permissions-Policy)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), camera=(), microphone=(), payment=(), usb=()'
    );
    next();
  });

  // 3. Production-Ready CORS configuration
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin server-to-server)
      if (
        !origin ||
        envConfig.ALLOWED_ORIGINS.includes(origin) ||
        envConfig.ALLOWED_ORIGINS.includes('*') ||
        (envConfig.NODE_ENV !== 'production' && origin.includes('localhost'))
      ) {
        callback(null, true);
      } else {
        logger.security(`Blocked CORS request from disallowed origin: ${origin}`);
        callback(new Error(`Origin '${origin}' not permitted by CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'x-gemini-api-key',
      'Idempotency-Key',
    ],
    exposedHeaders: [
      'Set-Cookie',
      'X-Response-Time',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
      'Content-Disposition',
    ],
    maxAge: 86400, // 24 hours preflight cache
  };

  app.use(cors(corsOptions));

  // 4. Prevent NoSQL Injection by sanitizing '$' and '.' operators
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        logger.security(`Sanitized potentially malicious NoSQL query key: '${key}'`, {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
        });
      },
    })
  );

  // 5. Cross-Site Scripting (XSS) payload sanitization
  app.use(xssClean);

  // 6. Prevent HTTP Parameter Pollution (HPP)
  app.use(
    hpp({
      whitelist: ['filter', 'sort', 'page', 'limit', 'fields', 'stage', 'status', 'priority'],
    })
  );
};
