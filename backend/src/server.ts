import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  try {
    console.log('[Server] Initializing LegalDost Backend...');

    // 1. Connect to MongoDB Atlas
    await connectDatabase();

    // 2. Auto-seed initial super admin if none exists in database
    try {
      await AuthService.seedSuperAdmin();
    } catch (seedErr: any) {
      console.warn('[Server] Notice during super-admin check:', seedErr.message);
    }

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log('==================================================');
      console.log(` LegalDost API Server Running on port ${env.PORT}`);
      console.log(` Environment:   ${env.NODE_ENV}`);
      console.log(` Swagger Docs:  http://localhost:${env.PORT}/api/docs`);
      console.log(` Health Check:  http://localhost:${env.PORT}/health`);
      console.log(` Admin Origin:  ${env.ADMIN_ORIGIN}`);
      console.log('==================================================');
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Process terminated safely.');
        process.exit(0);
      });

      // Force exit after 10s if dangling connections
      setTimeout(() => {
        console.error('[Server] Forceful shutdown initiated after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    console.error('[Server] Bootstrap fatal error:', error.message || error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: any) => {
  console.error('[Server] Unhandled Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[Server] Uncaught Exception:', error.message || error);
  process.exit(1);
});

bootstrap();

