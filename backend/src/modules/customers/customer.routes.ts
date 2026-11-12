import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { CustomerController, PRIVATE_DOCS_DIR } from './customer.controller';
import { authenticateCustomer } from '../../middleware/authenticateCustomer';
import { validateRequest } from '../../middleware/validateRequest';
import { authRateLimiter, apiRateLimiter } from '../../middleware/rateLimiter';
import { ApiError } from '../../utils/ApiError';
import {
  customerRegisterSchema,
  customerLoginSchema,
  refreshTokenSchema,
  updateCustomerProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  intakeUpsertSchema,
  createAISessionSchema,
  sendAIMessageSchema,
  selectSolutionSchema,
  createMatterFromCustomerSchema,
  requestConsultationSchema,
  startConversationSchema,
  sendCustomerMessageSchema,
  pushTokenSchema
} from './customer.validation';

if (!fs.existsSync(PRIVATE_DOCS_DIR)) {
  fs.mkdirSync(PRIVATE_DOCS_DIR, { recursive: true });
}

const ALLOWED_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(PRIVATE_DOCS_DIR, { recursive: true });
    cb(null, PRIVATE_DOCS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const safeExt = ['.pdf', '.jpg', '.jpeg', '.png'].includes(ext) ? ext : '.bin';
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype.toLowerCase())) {
      return cb(new ApiError(400, 'Unsupported file type. Only PDF, JPG, JPEG, and PNG files are allowed.') as any);
    }
    cb(null, true);
  }
});

const router = Router();

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================
router.post('/auth/register', authRateLimiter, validateRequest(customerRegisterSchema), CustomerController.register);
router.post('/auth/login', authRateLimiter, validateRequest(customerLoginSchema), CustomerController.login);
router.post('/auth/refresh', authRateLimiter, validateRequest(refreshTokenSchema), CustomerController.refresh);
router.post('/auth/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), CustomerController.forgotPassword);
router.post('/auth/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), CustomerController.resetPassword);

// ==========================================
// AUTHENTICATED CUSTOMER ROUTES
// ==========================================
router.use(apiRateLimiter);
router.use(authenticateCustomer);

router.post('/auth/logout', CustomerController.logout);
router.get('/auth/me', CustomerController.getMe);
router.patch('/profile', validateRequest(updateCustomerProfileSchema), CustomerController.updateProfile);
router.post('/auth/change-password', validateRequest(changePasswordSchema), CustomerController.changePassword);
router.post('/auth/deletion-request', CustomerController.requestDeletion);

// Home dashboard
router.get('/dashboard', CustomerController.getDashboard);

// Legal Intake & Drafts
router.get('/intakes', CustomerController.listIntakes);
router.post('/intakes', validateRequest(intakeUpsertSchema), CustomerController.createIntake);
router.get('/intakes/:id', CustomerController.getIntakeById);
router.patch('/intakes/:id', validateRequest(intakeUpsertSchema), CustomerController.updateIntake);
router.delete('/intakes/:id', CustomerController.deleteDraft);

// AI Legal Assistant
router.get('/ai/status', CustomerController.getAIStatus);
router.get('/ai/sessions', CustomerController.listAISessions);
router.post('/ai/sessions', validateRequest(createAISessionSchema), CustomerController.createOrResumeAISession);
router.get('/ai/sessions/:id', CustomerController.getAISessionById);
router.post('/ai/sessions/:id/messages', validateRequest(sendAIMessageSchema), CustomerController.sendAIMessage);
router.post('/ai/sessions/:id/solutions/select', validateRequest(selectSolutionSchema), CustomerController.selectSolutionPath);

// Documents & Private Download
router.get('/documents', CustomerController.listDocuments);
router.post('/documents/upload', upload.single('file'), CustomerController.uploadDocument);
router.get('/documents/:id/download', CustomerController.downloadDocument);
router.patch('/documents/:id/matter', CustomerController.associateDocumentWithMatter);
router.delete('/documents/:id', CustomerController.deleteDocument);

// My Matters
router.get('/matters', CustomerController.listMatters);
router.post('/matters', validateRequest(createMatterFromCustomerSchema), CustomerController.createMatter);
router.get('/matters/:id', CustomerController.getMatterById);

// Verified Lawyer Discovery
router.get('/lawyers', CustomerController.listVerifiedLawyers);
router.get('/lawyers/:id', CustomerController.getVerifiedLawyerById);
router.get('/lawyers/:lawyerId/slots', CustomerController.getLawyerSlots);

// Consultations
router.get('/consultations', CustomerController.listConsultations);
router.post('/consultations', validateRequest(requestConsultationSchema), CustomerController.requestConsultation);
router.get('/consultations/:id', CustomerController.getConsultationById);
router.patch('/consultations/:id/cancel', CustomerController.cancelConsultation);

// Messaging
router.get('/conversations', CustomerController.listConversations);
router.post('/conversations', validateRequest(startConversationSchema), CustomerController.startOrGetConversation);
router.get('/conversations/:id/messages', CustomerController.getConversationMessages);
router.post('/conversations/:id/messages', validateRequest(sendCustomerMessageSchema), CustomerController.sendMessage);
router.patch('/conversations/:id/read', CustomerController.markConversationRead);

// Notifications & Device Push Tokens
router.get('/notifications', CustomerController.listNotifications);
router.patch('/notifications/read-all', CustomerController.markAllNotificationsRead);
router.patch('/notifications/:id/read', CustomerController.markNotificationRead);
router.post('/notifications/push-token', validateRequest(pushTokenSchema), CustomerController.registerPushToken);
router.delete('/notifications/push-token', CustomerController.removePushToken);

export const customerRoutes = router;
