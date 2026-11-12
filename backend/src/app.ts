import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { corsMiddleware } from './config/cors';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { lawyerRoutes } from './modules/lawyers/lawyer.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { lawyerPortalRoutes } from './modules/lawyerPortal/lawyerPortal.routes';
import { customerRoutes } from './modules/customers/customer.routes';
import swaggerDocument from './docs/swagger.json';
import { sendSuccess } from './utils/response';
import crypto from 'crypto';

const app: Application = express();

// Ensure Express 5 allows setting req.query (which has only a getter by default on prototype)
const queryDesc = Object.getOwnPropertyDescriptor(express.request, 'query');
if (queryDesc && !queryDesc.set) {
  Object.defineProperty(express.request, 'query', {
    ...queryDesc,
    set(val) {
      Object.defineProperty(this, 'query', {
        value: val,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  });
}

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false
  })
);

// Enable CORS with credentials
app.use(corsMiddleware);

// Cookie parser
app.use(cookieParser(env.COOKIE_SECRET));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Correlation ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
});

// Swagger Documentation UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoints
const healthCheckHandler = (_req: Request, res: Response) => {
  return sendSuccess(res, 200, 'LegalDost backend service operational', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/lawyers', lawyerRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/audit-logs', auditRoutes);
app.use('/api/v1/lawyer', lawyerPortalRoutes);
app.use('/api/v1/customer', customerRoutes);

// Fallback 404 for unknown routes
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;

