import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { loginSchema } from './auth.validation';
import { authenticateAdmin } from '../../middleware/authenticateAdmin';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(AuthController.login)
);

router.get(
  '/me',
  authenticateAdmin,
  asyncHandler(AuthController.getMe)
);

router.post(
  '/logout',
  asyncHandler(AuthController.logout)
);

export const authRoutes = router;

