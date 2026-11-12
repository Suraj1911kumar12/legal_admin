import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CustomerAuthService } from './customerAuth.service';
import { Query } from '../queries/query.model';
import { Matter } from '../matters/matter.model';
import { DocumentRecord } from '../documents/document.model';
import { Conversation, Message } from '../messages/message.model';
import { Consultation } from '../consultations/consultation.model';
import { Notification } from '../notifications/notification.model';
import { Lawyer } from '../lawyers/lawyer.model';
import { AISession } from '../ai/aiSession.model';
import { AIService } from '../ai/ai.service';
import { sendSuccess } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { getPaginationOptions, calculatePagination } from '../../utils/pagination';

export const PRIVATE_DOCS_DIR = path.resolve(process.cwd(), 'storage', 'private_docs');

const PUBLIC_LAWYER_FIELDS =
  'fullName profileImage languages barCouncil enrollmentState yearsOfExperience practiceAreas professionalBio city state consultationTypes consultationFee isAvailable verificationStatus verifiedAt';

const generateRef = (prefix: string) =>
  `${prefix}-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;

export class CustomerController {
  // ==========================================
  // AUTHENTICATION & PROFILE
  // ==========================================

  static async register(req: Request, res: Response) {
    const { customer, tokens } = await CustomerAuthService.register(req.body);
    const isProduction = env.NODE_ENV === 'production';

    res.cookie('customer_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    return sendSuccess(res, 201, 'Account created successfully', {
      customer,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password, deviceInfo } = req.body;
    const { customer, tokens } = await CustomerAuthService.login(email, password, deviceInfo);
    const isProduction = env.NODE_ENV === 'production';

    res.cookie('customer_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    return sendSuccess(res, 200, 'Login successful', {
      customer,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken, deviceInfo } = req.body;
    const { customer, tokens } = await CustomerAuthService.refresh(refreshToken, deviceInfo);
    const isProduction = env.NODE_ENV === 'production';

    res.cookie('customer_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    return sendSuccess(res, 200, 'Session refreshed', {
      customer,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken, pushToken } = req.body || {};
    if (req.customer) {
      await CustomerAuthService.logout(req.customer._id.toString(), refreshToken, pushToken);
    }

    const isProduction = env.NODE_ENV === 'production';
    res.clearCookie('customer_access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax'
    });

    return sendSuccess(res, 200, 'Logged out securely');
  }

  static async getMe(req: Request, res: Response) {
    return sendSuccess(res, 200, 'Customer profile retrieved', req.customer);
  }

  static async updateProfile(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const updated = await CustomerAuthService.updateProfile(req.customer._id.toString(), req.body);
    return sendSuccess(res, 200, 'Profile updated successfully', updated);
  }

  static async changePassword(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    await CustomerAuthService.changePassword(
      req.customer._id.toString(),
      req.body.currentPassword,
      req.body.newPassword
    );
    return sendSuccess(res, 200, 'Password updated successfully. Other active sessions have been signed out.');
  }

  static async forgotPassword(req: Request, res: Response) {
    const result = await CustomerAuthService.requestPasswordReset(req.body.email);
    return sendSuccess(res, 200, result.message, result);
  }

  static async resetPassword(req: Request, res: Response) {
    await CustomerAuthService.resetPassword(req.body.email, req.body.resetToken, req.body.newPassword);
    return sendSuccess(res, 200, 'Password reset successful. You may now log in.');
  }

  static async requestDeletion(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const result = await CustomerAuthService.requestDeletion(req.customer._id.toString());
    return sendSuccess(res, 200, 'Account deletion request recorded', result);
  }

  // ==========================================
  // DASHBOARD / HOME SUMMARY
  // ==========================================

  static async getDashboard(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const customerId = req.customer._id;
    const customerEmail = req.customer.email;

    const matterOwnerFilter = {
      $or: [{ customerId }, { 'customer.email': customerEmail }]
    };

    const [
      recentMatters,
      recentDrafts,
      recentDocuments,
      upcomingConsultations,
      recentConversations,
      unreadNotificationsCount,
      recentNotifications,
      recentAISession
    ] = await Promise.all([
      Matter.find(matterOwnerFilter)
        .select('-internalNotes')
        .populate('lawyerId', 'fullName profileImage city practiceAreas verificationStatus')
        .sort({ updatedAt: -1 })
        .limit(3),
      Query.find({
        $or: [{ customerId }, { customerEmail }],
        isDraft: true
      })
        .sort({ updatedAt: -1 })
        .limit(2),
      DocumentRecord.find({ customerId }).sort({ uploadedAt: -1 }).limit(3),
      Consultation.find({
        $or: [{ customerId }, { 'customer.email': customerEmail }],
        status: { $in: ['pending', 'accepted'] },
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
        .populate('lawyerId', 'fullName profileImage city consultationFee')
        .sort({ date: 1 })
        .limit(3),
      Conversation.find({
        $or: [{ customerId }, { 'customer.email': customerEmail }]
      })
        .populate('lawyerId', 'fullName profileImage practiceAreas')
        .sort({ lastMessageAt: -1 })
        .limit(3),
      Notification.countDocuments({
        recipientId: customerId,
        recipientType: 'customer',
        isRead: false
      }),
      Notification.find({
        recipientId: customerId,
        recipientType: 'customer'
      })
        .sort({ createdAt: -1 })
        .limit(3),
      AISession.findOne({ customerId }).sort({ updatedAt: -1 })
    ]);

    const unreadMessagesCount = recentConversations.reduce(
      (sum, c) => sum + (c.unreadCountCustomer || 0),
      0
    );

    return sendSuccess(res, 200, 'Customer dashboard retrieved', {
      aiConfigured: AIService.getStatus().configured,
      continueItem: recentDrafts[0]
        ? { type: 'draft', id: recentDrafts[0]._id, title: recentDrafts[0].summary || 'Saved legal draft', updatedAt: recentDrafts[0].updatedAt }
        : recentAISession
        ? { type: 'ai_session', id: recentAISession._id, title: recentAISession.title, updatedAt: recentAISession.updatedAt }
        : recentMatters[0]
        ? { type: 'matter', id: recentMatters[0]._id, title: recentMatters[0].title, updatedAt: recentMatters[0].updatedAt }
        : null,
      recentMatters,
      recentDrafts,
      recentDocuments,
      upcomingConsultations,
      recentConversations,
      unreadMessagesCount,
      unreadNotificationsCount,
      recentNotifications
    });
  }

  // ==========================================
  // LEGAL INTAKE & DRAFTS
  // ==========================================

  static async listIntakes(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { isDraft } = req.query as Record<string, string>;
    const filter: any = {
      $or: [{ customerId: req.customer._id }, { customerEmail: req.customer.email }]
    };
    if (isDraft === 'true') filter.isDraft = true;
    if (isDraft === 'false') filter.isDraft = false;

    const intakes = await Query.find(filter).sort({ updatedAt: -1 });
    return sendSuccess(res, 200, 'Legal intakes retrieved', intakes);
  }

  static async createIntake(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const {
      category,
      summary,
      specificQuestion,
      customerLocation,
      customerPhone,
      preferredLanguage,
      urgency,
      isDraft,
      clientSubmissionKey,
      documentIds,
      followUpAnswers
    } = req.body;

    if (!isDraft && (!summary || summary.trim().length < 15)) {
      throw ApiError.badRequest('Please describe your legal issue in at least 15 characters before submitting.');
    }

    // Prevent duplicate submissions using clientSubmissionKey
    if (clientSubmissionKey) {
      const existing = await Query.findOne({
        customerId: req.customer._id,
        clientSubmissionKey
      });
      if (existing) {
        return sendSuccess(res, 200, 'Existing intake returned cleanly', existing);
      }
    }

    const linkedDocs =
      Array.isArray(documentIds) && documentIds.length > 0
        ? await DocumentRecord.find({
            _id: { $in: documentIds },
            customerId: req.customer._id
          })
        : [];

    const queryDoc = await Query.create({
      queryReference: generateRef(isDraft ? 'DRF' : 'QRY'),
      customerId: req.customer._id,
      customerName: req.customer.fullName,
      customerEmail: req.customer.email,
      customerPhone: customerPhone || req.customer.phone || 'Not provided',
      customerLocation:
        customerLocation ||
        [req.customer.city, req.customer.state].filter(Boolean).join(', ') ||
        'India',
      category: category || 'General Legal',
      summary: summary || '',
      specificQuestion: specificQuestion || summary || 'Need help understanding my options',
      preferredLanguage: preferredLanguage || req.customer.preferredLanguage || 'en',
      urgency: urgency || 'medium',
      status: isDraft ? 'draft' : 'pending',
      isDraft: Boolean(isDraft),
      clientSubmissionKey,
      documents: linkedDocs.map((d) => ({
        documentId: d._id,
        name: d.name,
        type: d.mimeType,
        url: `/api/v1/customer/documents/${d._id}/download`,
        size: d.fileSize
      })),
      followUpAnswers: (followUpAnswers || []).map((f: any) => ({
        question: f.question,
        answer: f.answer,
        answeredAt: new Date()
      })),
      intakeSummary: {
        aiSummary: isDraft ? '' : summary,
        likelyCategory: category || 'General Legal',
        confirmedFacts: [],
        missingInformation: [],
        recommendedNextSteps: []
      }
    });

    if (linkedDocs.length > 0) {
      await DocumentRecord.updateMany(
        { _id: { $in: linkedDocs.map((d) => d._id) } },
        { $set: { queryId: queryDoc._id } }
      );
    }

    return sendSuccess(res, 201, isDraft ? 'Draft saved' : 'Legal problem submitted', queryDoc);
  }

  static async getIntakeById(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid intake ID');

    const intake = await Query.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { customerEmail: req.customer.email }]
    });

    if (!intake) throw ApiError.notFound('Legal intake not found');
    return sendSuccess(res, 200, 'Intake details retrieved', intake);
  }

  static async updateIntake(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid intake ID');

    const intake = await Query.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { customerEmail: req.customer.email }]
    });
    if (!intake) throw ApiError.notFound('Legal intake not found');

    const {
      category,
      summary,
      specificQuestion,
      customerLocation,
      preferredLanguage,
      urgency,
      isDraft,
      documentIds,
      followUpAnswers
    } = req.body;

    if (category !== undefined) intake.category = category;
    if (summary !== undefined) intake.summary = summary;
    if (specificQuestion !== undefined) intake.specificQuestion = specificQuestion;
    if (customerLocation !== undefined) intake.customerLocation = customerLocation;
    if (preferredLanguage !== undefined) intake.preferredLanguage = preferredLanguage;
    if (urgency !== undefined) intake.urgency = urgency;

    if (Array.isArray(documentIds)) {
      const linkedDocs = await DocumentRecord.find({
        _id: { $in: documentIds },
        customerId: req.customer._id
      });
      intake.documents = linkedDocs.map((d) => ({
        documentId: d._id,
        name: d.name,
        type: d.mimeType,
        url: `/api/v1/customer/documents/${d._id}/download`,
        size: d.fileSize
      }));
    }

    if (Array.isArray(followUpAnswers) && followUpAnswers.length > 0) {
      intake.followUpAnswers = followUpAnswers.map((f: any) => ({
        question: f.question,
        answer: f.answer,
        answeredAt: new Date()
      }));
    }

    if (isDraft === false && intake.isDraft) {
      if (!intake.summary || intake.summary.trim().length < 15) {
        throw ApiError.badRequest('Please describe your legal issue in at least 15 characters before submitting.');
      }
      intake.isDraft = false;
      intake.status = 'pending';
      if (intake.queryReference.startsWith('DRF-')) {
        intake.queryReference = generateRef('QRY');
      }
    }

    await intake.save();
    return sendSuccess(res, 200, 'Intake updated', intake);
  }

  static async deleteDraft(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid draft ID');

    const deleted = await Query.findOneAndDelete({
      _id: id,
      customerId: req.customer._id,
      isDraft: true
    });
    if (!deleted) {
      throw ApiError.notFound('Draft not found or already submitted');
    }

    return sendSuccess(res, 200, 'Draft discarded');
  }

  // ==========================================
  // AI LEGAL ASSISTANT
  // ==========================================

  static async getAIStatus(_req: Request, res: Response) {
    return sendSuccess(res, 200, 'AI status retrieved', AIService.getStatus());
  }

  static async listAISessions(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const sessions = await AISession.find({ customerId: req.customer._id }).sort({ updatedAt: -1 });
    return sendSuccess(res, 200, 'AI sessions retrieved', sessions);
  }

  static async createOrResumeAISession(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { intakeId, matterId, title, initialProblem, preferredLanguage } = req.body;

    // Prevent duplicate sessions for the same intakeId
    if (intakeId) {
      if (!Types.ObjectId.isValid(intakeId)) throw ApiError.badRequest('Invalid intakeId');
      const existing = await AISession.findOne({
        customerId: req.customer._id,
        intakeId
      });
      if (existing) {
        return sendSuccess(res, 200, 'Resumed existing AI session', existing);
      }
    }

    let seedPrompt = initialProblem?.trim() || '';
    let resolvedTitle = title?.trim() || 'Legal Guidance Session';
    let resolvedCategory = 'General Legal';

    if (intakeId) {
      const intake = await Query.findOne({
        _id: intakeId,
        $or: [{ customerId: req.customer._id }, { customerEmail: req.customer.email }]
      });
      if (!intake) throw ApiError.notFound('Associated intake not found');
      seedPrompt =
        seedPrompt ||
        `Category: ${intake.category}\nProblem: ${intake.summary}\nQuestion: ${intake.specificQuestion}`;
      resolvedTitle = title || intake.summary.slice(0, 70) || intake.category;
      resolvedCategory = intake.category || 'General Legal';
    }

    const session = await AISession.create({
      customerId: req.customer._id,
      intakeId: intakeId || null,
      matterId: matterId || null,
      title: resolvedTitle,
      likelyCategory: resolvedCategory,
      preferredLanguage: preferredLanguage || req.customer.preferredLanguage || 'en',
      status: 'active',
      messages: []
    });

    if (seedPrompt) {
      session.messages.push({
        role: 'user',
        content: seedPrompt,
        createdAt: new Date()
      });

      if (AIService.getStatus().configured) {
        const aiResult = await AIService.analyzeConversation({
          history: [{ role: 'user', content: seedPrompt }],
          preferredLanguage: session.preferredLanguage
        });

        session.messages.push({
          role: 'assistant',
          content: aiResult.reply,
          structuredResponse: aiResult.structuredResponse,
          followUpQuestions: aiResult.followUpQuestions,
          createdAt: new Date()
        });
        session.latestAnalysis = aiResult.structuredResponse;
        session.likelyCategory = aiResult.structuredResponse.likelyCategory;

        if (intakeId) {
          await Query.findByIdAndUpdate(intakeId, {
            $set: {
              'intakeSummary.aiSummary': aiResult.structuredResponse.understandingYourProblem,
              'intakeSummary.likelyCategory': aiResult.structuredResponse.likelyCategory,
              'intakeSummary.confirmedFacts': aiResult.structuredResponse.importantFacts,
              'intakeSummary.missingInformation': aiResult.structuredResponse.missingInformation,
              'intakeSummary.recommendedNextSteps': aiResult.structuredResponse.suggestedNextSteps
            }
          });
        }
      }
      await session.save();
    }

    return sendSuccess(res, 201, 'AI session initialized', session);
  }

  static async getAISessionById(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid AI session ID');

    const session = await AISession.findOne({ _id: id, customerId: req.customer._id });
    if (!session) throw ApiError.notFound('AI session not found');

    return sendSuccess(res, 200, 'AI session retrieved', {
      session,
      aiStatus: AIService.getStatus()
    });
  }

  static async sendAIMessage(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid AI session ID');

    const session = await AISession.findOne({ _id: id, customerId: req.customer._id });
    if (!session) throw ApiError.notFound('AI session not found');

    // Check AI provider BEFORE appending or handle gracefully
    const aiStatus = AIService.getStatus();
    if (!aiStatus.configured) {
      throw new ApiError(503, aiStatus.message, [{ code: 'AI_UNAVAILABLE', configured: false }]);
    }

    const userContent = req.body.content.trim();
    session.messages.push({
      role: 'user',
      content: userContent,
      createdAt: new Date()
    });

    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    const aiResult = await AIService.analyzeConversation({
      history,
      preferredLanguage: session.preferredLanguage
    });

    session.messages.push({
      role: 'assistant',
      content: aiResult.reply,
      structuredResponse: aiResult.structuredResponse,
      followUpQuestions: aiResult.followUpQuestions,
      createdAt: new Date()
    });
    session.latestAnalysis = aiResult.structuredResponse;
    session.likelyCategory = aiResult.structuredResponse.likelyCategory;
    await session.save();

    if (session.intakeId) {
      await Query.findByIdAndUpdate(session.intakeId, {
        $set: {
          'intakeSummary.aiSummary': aiResult.structuredResponse.understandingYourProblem,
          'intakeSummary.likelyCategory': aiResult.structuredResponse.likelyCategory,
          'intakeSummary.confirmedFacts': aiResult.structuredResponse.importantFacts,
          'intakeSummary.missingInformation': aiResult.structuredResponse.missingInformation,
          'intakeSummary.recommendedNextSteps': aiResult.structuredResponse.suggestedNextSteps
        }
      });
    }

    return sendSuccess(res, 200, 'AI analysis updated', session);
  }

  static async selectSolutionPath(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid AI session ID');

    const session = await AISession.findOne({ _id: id, customerId: req.customer._id });
    if (!session) throw ApiError.notFound('AI session not found');

    session.selectedSolutionPath = {
      choice: req.body.choice,
      optionTitle: req.body.optionTitle || '',
      selectedAt: new Date()
    };
    session.status = 'completed';
    await session.save();

    return sendSuccess(res, 200, 'Selected path saved', session);
  }

  // ==========================================
  // DOCUMENTS MANAGEMENT & PRIVATE DOWNLOAD
  // ==========================================

  static async listDocuments(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { matterId } = req.query as Record<string, string>;

    const filter: any = { customerId: req.customer._id };
    if (matterId && Types.ObjectId.isValid(matterId)) {
      filter.matterId = matterId;
    }

    const docs = await DocumentRecord.find(filter).sort({ uploadedAt: -1 });
    return sendSuccess(res, 200, 'Documents retrieved', docs);
  }

  static async uploadDocument(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    if (!req.file) {
      throw ApiError.badRequest('Please select a valid PDF, JPG, or PNG file (max 10 MB).');
    }

    const { matterId, queryId, documentType } = req.body;
    let linkedLawyerId: Types.ObjectId | null = null;

    if (matterId && Types.ObjectId.isValid(matterId)) {
      const matter = await Matter.findOne({
        _id: matterId,
        $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
      });
      if (!matter) {
        fs.unlink(req.file.path, () => undefined);
        throw ApiError.forbidden('You do not have permission to attach documents to this matter.');
      }
      linkedLawyerId = matter.lawyerId || null;

      matter.timeline.push({
        title: 'Document uploaded',
        description: `Uploaded ${req.file.originalname}`,
        eventType: 'document_uploaded',
        createdAt: new Date()
      });
      await matter.save();
    }

    const docRecord = await DocumentRecord.create({
      name: req.file.originalname,
      documentType: documentType || 'supporting_document',
      matterId: matterId && Types.ObjectId.isValid(matterId) ? matterId : null,
      queryId: queryId && Types.ObjectId.isValid(queryId) ? queryId : null,
      lawyerId: linkedLawyerId,
      customerId: req.customer._id,
      customerName: req.customer.fullName,
      uploadedByRole: 'customer',
      fileKey: req.file.filename,
      storagePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      reviewStatus: 'pending',
      uploadedAt: new Date()
    });

    return sendSuccess(res, 201, 'Document uploaded securely', docRecord);
  }

  static async downloadDocument(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid document ID');

    const doc = await DocumentRecord.findOne({
      _id: id,
      customerId: req.customer._id
    }).select('+storagePath');

    if (!doc) throw ApiError.notFound('Document not found or access denied');

    const safePath = doc.storagePath || path.join(PRIVATE_DOCS_DIR, path.basename(doc.fileKey));
    const resolved = path.resolve(safePath);
    if (!resolved.startsWith(PRIVATE_DOCS_DIR) || !fs.existsSync(resolved)) {
      throw ApiError.notFound('Document binary is not available on storage.');
    }

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.name)}"`);
    return res.sendFile(resolved);
  }

  static async associateDocumentWithMatter(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const { matterId } = req.body;
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(matterId)) {
      throw ApiError.badRequest('Valid document and matter IDs are required');
    }

    const matter = await Matter.findOne({
      _id: matterId,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    });
    if (!matter) throw ApiError.notFound('Matter not found or unauthorized');

    const doc = await DocumentRecord.findOneAndUpdate(
      { _id: id, customerId: req.customer._id },
      { $set: { matterId: matter._id, lawyerId: matter.lawyerId || null } },
      { new: true }
    );
    if (!doc) throw ApiError.notFound('Document not found');

    return sendSuccess(res, 200, 'Document linked to matter', doc);
  }

  static async deleteDocument(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid document ID');

    const doc = await DocumentRecord.findOne({
      _id: id,
      customerId: req.customer._id
    }).select('+storagePath');
    if (!doc) throw ApiError.notFound('Document not found');

    if (doc.matterId) {
      const matter = await Matter.findById(doc.matterId);
      if (matter && matter.status === 'pending_court') {
        throw ApiError.forbidden(
          'Documents attached to a matter currently pending before a court cannot be deleted directly.'
        );
      }
    }

    if (doc.storagePath && fs.existsSync(doc.storagePath)) {
      fs.unlink(doc.storagePath, () => undefined);
    }
    await doc.deleteOne();

    return sendSuccess(res, 200, 'Document deleted');
  }

  // ==========================================
  // MY MATTERS
  // ==========================================

  static async listMatters(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { status } = req.query as Record<string, string>;

    const filter: any = {
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    };
    if (status) filter.status = status;

    const matters = await Matter.find(filter)
      .select('-internalNotes')
      .populate('lawyerId', PUBLIC_LAWYER_FIELDS)
      .sort({ updatedAt: -1 });

    return sendSuccess(res, 200, 'Matters retrieved', matters);
  }

  static async createMatter(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { title, category, description, intakeId, aiSessionId, selectedSolution, importantFacts, aiSummary } =
      req.body;

    // Prevent duplicate matters for the same intakeId or aiSessionId
    if (intakeId && Types.ObjectId.isValid(intakeId)) {
      const existing = await Matter.findOne({
        $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }],
        queryId: intakeId
      }).select('-internalNotes');
      if (existing) return sendSuccess(res, 200, 'Existing matter retrieved', existing);
    }

    if (aiSessionId && Types.ObjectId.isValid(aiSessionId)) {
      const existing = await Matter.findOne({
        customerId: req.customer._id,
        aiSessionId
      }).select('-internalNotes');
      if (existing) return sendSuccess(res, 200, 'Existing matter retrieved', existing);
    }

    const timeline: any[] = [
      {
        title: 'Matter created',
        description: 'Legal matter saved to your workspace',
        eventType: 'problem_submitted',
        createdAt: new Date()
      }
    ];

    if (aiSummary) {
      timeline.push({
        title: 'AI analysis recorded',
        description: 'Plain-language analysis saved with matter',
        eventType: 'ai_analysis',
        createdAt: new Date()
      });
    }

    const matter = await Matter.create({
      matterReference: generateRef('MAT'),
      title: title.trim(),
      category: category.trim(),
      description: description || '',
      aiSummary: aiSummary || '',
      importantFacts: importantFacts || [],
      selectedSolution: selectedSolution || '',
      status: 'intake',
      lawyerId: null,
      customerId: req.customer._id,
      customer: {
        name: req.customer.fullName,
        email: req.customer.email,
        phone: req.customer.phone || ''
      },
      queryId: intakeId && Types.ObjectId.isValid(intakeId) ? intakeId : null,
      aiSessionId: aiSessionId && Types.ObjectId.isValid(aiSessionId) ? aiSessionId : null,
      timeline
    });

    if (intakeId && Types.ObjectId.isValid(intakeId)) {
      await Query.findByIdAndUpdate(intakeId, { $set: { associatedMatterId: matter._id } });
    }
    if (aiSessionId && Types.ObjectId.isValid(aiSessionId)) {
      await AISession.findByIdAndUpdate(aiSessionId, { $set: { matterId: matter._id } });
    }

    const cleanMatter = await Matter.findById(matter._id).select('-internalNotes');
    return sendSuccess(res, 201, 'Matter saved successfully', cleanMatter);
  }

  static async getMatterById(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid matter ID');

    const matter = await Matter.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    })
      .select('-internalNotes')
      .populate('lawyerId', PUBLIC_LAWYER_FIELDS)
      .populate('queryId');

    if (!matter) throw ApiError.notFound('Matter not found or access denied');

    const [documents, consultations, conversations] = await Promise.all([
      DocumentRecord.find({ matterId: matter._id, customerId: req.customer._id }).sort({ uploadedAt: -1 }),
      Consultation.find({
        matterId: matter._id,
        $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
      })
        .populate('lawyerId', 'fullName profileImage')
        .sort({ date: -1 }),
      Conversation.find({
        matterId: matter._id,
        $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
      }).populate('lawyerId', 'fullName profileImage')
    ]);

    return sendSuccess(res, 200, 'Matter details retrieved', {
      matter,
      documents,
      consultations,
      conversations
    });
  }

  // ==========================================
  // VERIFIED LAWYER DISCOVERY
  // ==========================================

  static async listVerifiedLawyers(req: Request, res: Response) {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { practiceArea, city, state, language, minExperience, consultationType, maxFee, search } =
      req.query as Record<string, string>;

    // Strictly verified, active, non-deleted lawyers only
    const filter: any = {
      verificationStatus: 'verified',
      accountStatus: 'active',
      deletedAt: null
    };

    if (practiceArea) {
      filter.practiceAreas = { $regex: practiceArea, $options: 'i' };
    }
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }
    if (language) {
      filter.languages = { $regex: language, $options: 'i' };
    }
    if (minExperience && !Number.isNaN(Number(minExperience))) {
      filter.yearsOfExperience = { $gte: Number(minExperience) };
    }
    if (consultationType) {
      filter.consultationTypes = consultationType;
    }
    if (maxFee && !Number.isNaN(Number(maxFee))) {
      filter.consultationFee = { $lte: Number(maxFee) };
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { practiceAreas: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const [lawyers, total] = await Promise.all([
      Lawyer.find(filter)
        .select(PUBLIC_LAWYER_FIELDS)
        .sort({ isAvailable: -1, yearsOfExperience: -1 })
        .skip(skip)
        .limit(limit),
      Lawyer.countDocuments(filter)
    ]);

    return sendSuccess(
      res,
      200,
      'Verified lawyers retrieved',
      lawyers,
      calculatePagination(total, page, limit)
    );
  }

  static async getVerifiedLawyerById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid lawyer ID');

    const lawyer = await Lawyer.findOne({
      _id: id,
      verificationStatus: 'verified',
      accountStatus: 'active',
      deletedAt: null
    }).select(PUBLIC_LAWYER_FIELDS);

    if (!lawyer) {
      throw ApiError.notFound('Verified lawyer not found');
    }

    return sendSuccess(res, 200, 'Lawyer public profile retrieved', lawyer);
  }

  // ==========================================
  // CONSULTATIONS
  // ==========================================

  static async listConsultations(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { status } = req.query as Record<string, string>;

    const filter: any = {
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    };
    if (status) filter.status = status;

    const consultations = await Consultation.find(filter)
      .populate('lawyerId', 'fullName profileImage city practiceAreas consultationTypes')
      .populate('matterId', 'matterReference title')
      .sort({ date: -1 });

    return sendSuccess(res, 200, 'Consultations retrieved', consultations);
  }

  static async getConsultationById(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid consultation ID');

    const consultation = await Consultation.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    })
      .populate('lawyerId', PUBLIC_LAWYER_FIELDS)
      .populate('matterId', 'matterReference title category status');

    if (!consultation) throw ApiError.notFound('Consultation not found');
    return sendSuccess(res, 200, 'Consultation retrieved', consultation);
  }

  static async getLawyerSlots(req: Request, res: Response) {
    const lawyerId = req.params.lawyerId as string;
    const { date } = req.query as Record<string, string>;
    if (!Types.ObjectId.isValid(lawyerId)) throw ApiError.badRequest('Invalid lawyer ID');

    const lawyer = await Lawyer.findOne({
      _id: lawyerId,
      verificationStatus: 'verified',
      accountStatus: 'active',
      deletedAt: null
    }).select('isAvailable consultationTypes consultationFee');

    if (!lawyer) throw ApiError.notFound('Verified lawyer not found');

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Consultation.find({
      lawyerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'accepted'] }
    }).select('time');

    const bookedTimes = new Set(booked.map((b) => b.time));
    const standardSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'];

    const slots = standardSlots.map((time) => ({
      time,
      available: lawyer.isAvailable !== false && !bookedTimes.has(time)
    }));

    return sendSuccess(res, 200, 'Consultation slots retrieved', {
      date: startOfDay.toISOString().split('T')[0],
      timeZone: 'Asia/Kolkata',
      isLawyerAvailable: lawyer.isAvailable !== false,
      consultationTypes: lawyer.consultationTypes,
      fee: lawyer.consultationFee,
      slots
    });
  }

  static async requestConsultation(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { lawyerId, matterId, date, time, timeZone, type, notes } = req.body;

    if (!Types.ObjectId.isValid(lawyerId)) throw ApiError.badRequest('Invalid lawyer ID');

    const lawyer = await Lawyer.findOne({
      _id: lawyerId,
      verificationStatus: 'verified',
      accountStatus: 'active',
      deletedAt: null
    });
    if (!lawyer) throw ApiError.notFound('Verified lawyer not found or unavailable');

    if (lawyer.isAvailable === false) {
      throw ApiError.badRequest('This lawyer is currently not accepting new consultations.');
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw ApiError.badRequest('Invalid consultation date');
    }

    const dayStart = new Date(parsedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(parsedDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Prevent conflicting bookings
    const conflict = await Consultation.findOne({
      lawyerId: lawyer._id,
      date: { $gte: dayStart, $lte: dayEnd },
      time: time.trim(),
      status: { $in: ['pending', 'accepted'] }
    });
    if (conflict) {
      throw ApiError.conflict('This consultation slot is no longer available. Please pick another time.');
    }

    let validMatterId: Types.ObjectId | null = null;
    if (matterId && Types.ObjectId.isValid(matterId)) {
      const matter = await Matter.findOne({
        _id: matterId,
        $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
      });
      if (!matter) throw ApiError.forbidden('Matter not found or unauthorized');
      validMatterId = matter._id as Types.ObjectId;

      matter.timeline.push({
        title: 'Consultation requested',
        description: `Requested ${type.replace('_', ' ')} consultation with ${lawyer.fullName} for ${time}`,
        eventType: 'consultation',
        createdAt: new Date()
      });
      await matter.save();
    }

    const consultation = await Consultation.create({
      consultationReference: generateRef('CON'),
      lawyerId: lawyer._id,
      customerId: req.customer._id,
      customer: {
        name: req.customer.fullName,
        email: req.customer.email,
        phone: req.customer.phone || 'Not provided'
      },
      matterId: validMatterId,
      date: dayStart,
      time: time.trim(),
      timeZone: timeZone || 'Asia/Kolkata',
      type,
      status: 'pending',
      notes: notes || '',
      fee: lawyer.consultationFee || 1500
    });

    await Notification.create({
      recipientId: lawyer._id,
      recipientType: 'lawyer',
      title: 'New Consultation Request',
      message: `${req.customer.fullName} requested a ${type.replace('_', ' ')} consultation for ${
        dayStart.toISOString().split('T')[0]
      } at ${time}.`,
      type: 'consultation',
      link: '/consultations'
    });

    return sendSuccess(res, 201, 'Consultation request submitted (pending lawyer confirmation)', consultation);
  }

  static async cancelConsultation(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid consultation ID');

    const consultation = await Consultation.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    });
    if (!consultation) throw ApiError.notFound('Consultation not found');

    if (consultation.status === 'completed' || consultation.status === 'cancelled') {
      throw ApiError.badRequest(`Cannot cancel a ${consultation.status} consultation.`);
    }

    consultation.status = 'cancelled';
    await consultation.save();

    return sendSuccess(res, 200, 'Consultation cancelled', consultation);
  }

  // ==========================================
  // MESSAGING
  // ==========================================

  static async listConversations(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();

    const conversations = await Conversation.find({
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    })
      .populate('lawyerId', 'fullName profileImage practiceAreas city verificationStatus')
      .populate('matterId', 'title matterReference status')
      .sort({ lastMessageAt: -1 });

    return sendSuccess(res, 200, 'Conversations retrieved', conversations);
  }

  static async startOrGetConversation(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { lawyerId, matterId, shareMatterSummary, initialMessage } = req.body;

    if (!Types.ObjectId.isValid(lawyerId)) throw ApiError.badRequest('Invalid lawyer ID');

    const lawyer = await Lawyer.findOne({
      _id: lawyerId,
      verificationStatus: 'verified',
      accountStatus: 'active',
      deletedAt: null
    });
    if (!lawyer) throw ApiError.notFound('Verified lawyer not found');

    let conversation = await Conversation.findOne({
      lawyerId: lawyer._id,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }],
      ...(matterId && Types.ObjectId.isValid(matterId) ? { matterId } : {})
    });

    if (!conversation) {
      let resolvedMatterId: Types.ObjectId | null = null;
      if (matterId && Types.ObjectId.isValid(matterId)) {
        const matter = await Matter.findOne({
          _id: matterId,
          $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
        });
        if (!matter) throw ApiError.forbidden('Matter not found or unauthorized');
        resolvedMatterId = matter._id as Types.ObjectId;
      }

      conversation = await Conversation.create({
        lawyerId: lawyer._id,
        customerId: req.customer._id,
        customer: {
          name: req.customer.fullName,
          email: req.customer.email
        },
        matterId: resolvedMatterId,
        sharedMatterSummary: Boolean(shareMatterSummary),
        lastMessage: initialMessage?.trim() || 'Conversation started',
        lastMessageAt: new Date(),
        unreadCountLawyer: initialMessage ? 1 : 0,
        unreadCountCustomer: 0
      });
    }

    if (initialMessage && initialMessage.trim()) {
      await Message.create({
        conversationId: conversation._id,
        senderType: 'customer',
        senderId: req.customer._id.toString(),
        senderName: req.customer.fullName,
        content: initialMessage.trim(),
        attachments: []
      });

      conversation.lastMessage = initialMessage.trim();
      conversation.lastMessageAt = new Date();
      conversation.unreadCountLawyer += 1;
      await conversation.save();

      await Notification.create({
        recipientId: lawyer._id,
        recipientType: 'lawyer',
        title: 'New Client Message',
        message: `${req.customer.fullName}: ${initialMessage.trim().slice(0, 80)}`,
        type: 'message',
        link: '/messages'
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('lawyerId', 'fullName profileImage practiceAreas city verificationStatus')
      .populate('matterId', 'title matterReference status');

    return sendSuccess(res, 200, 'Conversation ready', populated);
  }

  static async getConversationMessages(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid conversation ID');

    const conversation = await Conversation.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    }).populate('lawyerId', 'fullName profileImage practiceAreas city verificationStatus');

    if (!conversation) throw ApiError.notFound('Conversation not found or unauthorized');

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    return sendSuccess(res, 200, 'Messages retrieved', { conversation, messages });
  }

  static async sendMessage(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid conversation ID');

    const conversation = await Conversation.findOne({
      _id: id,
      $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
    });
    if (!conversation) throw ApiError.notFound('Conversation not found or unauthorized');

    const { content, attachmentDocIds } = req.body;
    let attachments: any[] = [];

    if (Array.isArray(attachmentDocIds) && attachmentDocIds.length > 0) {
      const docs = await DocumentRecord.find({
        _id: { $in: attachmentDocIds },
        customerId: req.customer._id
      });
      attachments = docs.map((d) => ({
        documentId: d._id,
        name: d.name,
        url: `/api/v1/customer/documents/${d._id}/download`,
        type: d.mimeType
      }));
    }

    const msg = await Message.create({
      conversationId: conversation._id,
      senderType: 'customer',
      senderId: req.customer._id.toString(),
      senderName: req.customer.fullName,
      content: content.trim(),
      attachments
    });

    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    conversation.unreadCountLawyer += 1;
    await conversation.save();

    await Notification.create({
      recipientId: conversation.lawyerId,
      recipientType: 'lawyer',
      title: 'New Client Message',
      message: `${req.customer.fullName}: ${content.trim().slice(0, 80)}`,
      type: 'message',
      link: '/messages'
    });

    return sendSuccess(res, 201, 'Message sent', msg);
  }

  static async markConversationRead(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid conversation ID');

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: id,
        $or: [{ customerId: req.customer._id }, { 'customer.email': req.customer.email }]
      },
      { $set: { unreadCountCustomer: 0 } },
      { new: true }
    );
    if (!conversation) throw ApiError.notFound('Conversation not found');

    await Message.updateMany(
      { conversationId: conversation._id, senderType: 'lawyer', readAt: null },
      { $set: { readAt: new Date() } }
    );

    return sendSuccess(res, 200, 'Conversation marked as read', conversation);
  }

  // ==========================================
  // NOTIFICATIONS & PUSH TOKENS
  // ==========================================

  static async listNotifications(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const notifications = await Notification.find({
      recipientId: req.customer._id,
      recipientType: 'customer'
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 200, 'Notifications retrieved', notifications);
  }

  static async markNotificationRead(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const id = req.params.id as string;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid notification ID');

    await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.customer._id, recipientType: 'customer' },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, 200, 'Notification marked as read');
  }

  static async markAllNotificationsRead(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    await Notification.updateMany(
      { recipientId: req.customer._id, recipientType: 'customer', isRead: false },
      { $set: { isRead: true } }
    );
    return sendSuccess(res, 200, 'All notifications marked as read');
  }

  static async registerPushToken(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { token, platform, deviceName } = req.body;

    const existingIdx = req.customer.pushTokens.findIndex((p) => p.token === token);
    if (existingIdx !== -1) {
      req.customer.pushTokens[existingIdx].platform = platform || 'unknown';
      req.customer.pushTokens[existingIdx].deviceName = deviceName;
      req.customer.pushTokens[existingIdx].updatedAt = new Date();
    } else {
      req.customer.pushTokens.push({
        token,
        platform: platform || 'unknown',
        deviceName,
        updatedAt: new Date()
      });
    }

    await req.customer.save();
    return sendSuccess(res, 200, 'Device push token registered');
  }

  static async removePushToken(req: Request, res: Response) {
    if (!req.customer) throw ApiError.unauthorized();
    const { token } = req.body || {};
    if (token) {
      req.customer.pushTokens = req.customer.pushTokens.filter((p) => p.token !== token);
      await req.customer.save();
    }
    return sendSuccess(res, 200, 'Device push token removed');
  }
}
