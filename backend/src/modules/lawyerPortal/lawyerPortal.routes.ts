import { Router } from 'express';
import { LawyerPortalController } from './lawyerPortal.controller';
import { authenticateLawyer, requireVerifiedLawyer } from '../../middleware/authenticateLawyer';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// ==========================================
// PUBLIC & AUTHENTICATION ENDPOINTS
// ==========================================
router.post('/auth/register', authRateLimiter, asyncHandler(LawyerPortalController.register));
router.post('/auth/login', authRateLimiter, asyncHandler(LawyerPortalController.login));
router.post('/auth/logout', asyncHandler(LawyerPortalController.logout));

// Protected session check (allowed even if pending/rejected to show onboarding status)
router.get('/auth/me', authenticateLawyer, asyncHandler(LawyerPortalController.getMe));
router.get('/profile', authenticateLawyer, asyncHandler(LawyerPortalController.getProfile));
router.patch('/profile', authenticateLawyer, asyncHandler(LawyerPortalController.updateProfile));

// ==========================================
// PROTECTED WORKFLOWS (Approved & Verified Lawyers Only)
// ==========================================
router.use(authenticateLawyer);
router.use(requireVerifiedLawyer);

// Dashboard
router.get('/dashboard/stats', asyncHandler(LawyerPortalController.getDashboardStats));
router.get('/dashboard/activity', asyncHandler(LawyerPortalController.getDashboardActivity));

// Incoming Queries
router.get('/queries', asyncHandler(LawyerPortalController.listQueries));
router.get('/queries/:id', asyncHandler(LawyerPortalController.getQueryById));
router.post('/queries/:id/accept', asyncHandler(LawyerPortalController.acceptQuery));
router.post('/queries/:id/decline', asyncHandler(LawyerPortalController.declineQuery));

// Legal Matters
router.get('/matters', asyncHandler(LawyerPortalController.listMatters));
router.get('/matters/:id', asyncHandler(LawyerPortalController.getMatterById));
router.patch('/matters/:id/status', asyncHandler(LawyerPortalController.updateMatterStatus));
router.post('/matters/:id/notes', asyncHandler(LawyerPortalController.addInternalNote));
router.post('/matters/:id/updates', asyncHandler(LawyerPortalController.addClientUpdate));
router.post('/matters/:id/tasks', asyncHandler(LawyerPortalController.addMatterTask));
router.patch('/matters/:id/tasks/:taskId', asyncHandler(LawyerPortalController.toggleMatterTask));

// Documents
router.get('/documents', asyncHandler(LawyerPortalController.listDocuments));
router.get('/documents/:id', asyncHandler(LawyerPortalController.getDocumentById));
router.get('/documents/:id/access', asyncHandler(LawyerPortalController.getDocumentAccess));
router.post('/documents/:id/review', asyncHandler(LawyerPortalController.reviewDocument));

// Messaging
router.get('/conversations', asyncHandler(LawyerPortalController.listConversations));
router.get('/conversations/:id/messages', asyncHandler(LawyerPortalController.getConversationMessages));
router.post('/conversations/:id/messages', asyncHandler(LawyerPortalController.sendMessage));
router.patch('/conversations/:id/read', asyncHandler(LawyerPortalController.markConversationRead));

// Consultations
router.get('/consultations', asyncHandler(LawyerPortalController.listConsultations));
router.get('/consultations/:id', asyncHandler(LawyerPortalController.getConsultationById));
router.post('/consultations/:id/accept', asyncHandler(LawyerPortalController.acceptConsultation));
router.post('/consultations/:id/decline', asyncHandler(LawyerPortalController.declineConsultation));
router.patch('/consultations/:id/status', asyncHandler(LawyerPortalController.updateConsultationStatus));

// Notifications
router.get('/notifications', asyncHandler(LawyerPortalController.listNotifications));
router.patch('/notifications/:id/read', asyncHandler(LawyerPortalController.markNotificationRead));
router.patch('/notifications/read-all', asyncHandler(LawyerPortalController.markAllNotificationsRead));

export const lawyerPortalRoutes = router;

