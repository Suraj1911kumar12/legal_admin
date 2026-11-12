import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Authentication rate limiter (prevent brute-force password guessing)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: env.NODE_ENV === 'test' ? 1000 : 15, // limit each IP to 15 login requests per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: env.NODE_ENV === 'test' ? 10000 : 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down.'
  }
});

