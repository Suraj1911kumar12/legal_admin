import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://127.0.0.1:27017/legaldost'),
  DB_NAME: z.string().optional().default('legaldost'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('legaldost_default_secure_secret_key_change_me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('legaldost_refresh_secure_secret_key_change_me'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  ADMIN_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
  LAWYER_ORIGIN: z.string().default('http://localhost:3001'),
  CUSTOMER_ORIGIN: z.string().default('http://localhost:3002,http://localhost:8081,http://localhost:19006'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters').default('legaldost_cookie_secret_key_32_characters_dev'),
  SUPER_ADMIN_EMAIL: z.string().email().default('superadmin@legaldost.com'),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default('SuperAdmin@LegalDost2026!'),
  SUPER_ADMIN_NAME: z.string().default('Super Administrator'),
  GEMINI_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default('')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
