import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticateAdmin } from '../../middleware/authenticateAdmin';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticateAdmin);

router.get('/', asyncHandler(AuditController.getLogs));

export const auditRoutes = router;

