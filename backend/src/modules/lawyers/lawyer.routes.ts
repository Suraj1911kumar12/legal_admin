import { Router } from 'express';
import { LawyerController } from './lawyer.controller';
import { authenticateAdmin } from '../../middleware/authenticateAdmin';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createLawyerSchema,
  updateLawyerSchema,
  updateVerificationSchema,
  updateAccountStatusSchema,
  lawyerIdParamSchema,
  queryLawyersSchema
} from './lawyer.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// All lawyer admin management routes require an authenticated active admin
router.use(authenticateAdmin);

// Create lawyer
router.post(
  '/',
  validateRequest({ body: createLawyerSchema }),
  asyncHandler(LawyerController.createLawyer)
);

// List lawyers with search, filters, pagination, sorting
router.get(
  '/',
  validateRequest({ query: queryLawyersSchema }),
  asyncHandler(LawyerController.listLawyers)
);

// Get single lawyer details
router.get(
  '/:id',
  validateRequest({ params: lawyerIdParamSchema }),
  asyncHandler(LawyerController.getLawyerById)
);

// Update lawyer profile fields
router.patch(
  '/:id',
  validateRequest({ params: lawyerIdParamSchema, body: updateLawyerSchema }),
  asyncHandler(LawyerController.updateLawyer)
);

// Change verification status
router.patch(
  '/:id/verification',
  validateRequest({ params: lawyerIdParamSchema, body: updateVerificationSchema }),
  asyncHandler(LawyerController.changeVerificationStatus)
);

// Change account status (active, suspended, inactive)
router.patch(
  '/:id/status',
  validateRequest({ params: lawyerIdParamSchema, body: updateAccountStatusSchema }),
  asyncHandler(LawyerController.changeAccountStatus)
);

// Delete (soft-delete / archive) lawyer
router.delete(
  '/:id',
  validateRequest({ params: lawyerIdParamSchema }),
  asyncHandler(LawyerController.deleteLawyer)
);

export const lawyerRoutes = router;

