import cors, { CorsOptions } from 'cors';
import { env } from './env';

const originsList = `${env.ADMIN_ORIGIN},${env.LAWYER_ORIGIN}`;
const allowedOrigins = originsList
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked request from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Correlation-Id'],
  exposedHeaders: ['Set-Cookie']
};

export const corsMiddleware = cors(corsOptions);

