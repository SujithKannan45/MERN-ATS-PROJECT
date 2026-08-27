import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from root of backend
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),

  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .transform((val) => val.split(',').map((origin) => origin.trim())),

  MONGODB_URI: z
    .string()
    .default('mongodb://localhost:27017/ats_resume_platform'),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().default(10),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().default(2),
  MONGODB_CONNECT_TIMEOUT_MS: z.coerce.number().default(10000),

  JWT_ACCESS_SECRET: z.string().default('default_jwt_access_secret_key_change_me'),
  JWT_REFRESH_SECRET: z.string().default('default_jwt_refresh_secret_key_change_me'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('default_cookie_signing_secret_change_me'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('debug'),
  LOG_DIR: z.string().default('logs'),

  CLOUDINARY_CLOUD_NAME: z.string().default('ats_cloud_name'),
  CLOUDINARY_API_KEY: z.string().default('ats_api_key'),
  CLOUDINARY_API_SECRET: z.string().default('ats_api_secret'),
  CLOUDINARY_FOLDER: z.string().default('ats_resumes'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),

  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const envConfig = Object.freeze(parseEnv());
export type EnvConfig = z.infer<typeof envSchema>;
