import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateAdmin } from '../../middleware/authenticateAdmin';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticateAdmin);

router.get('/stats', asyncHandler(DashboardController.getStats));

export const dashboardRoutes = router;

