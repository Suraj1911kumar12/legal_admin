import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { LawyerAuthService } from '../lawyers/lawyerAuth.service';
import { Query } from '../queries/query.model';
import { Matter } from '../matters/matter.model';
import { DocumentRecord } from '../documents/document.model';
import { Conversation, Message } from '../messages/message.model';
import { Consultation } from '../consultations/consultation.model';
import { Notification } from '../notifications/notification.model';
import { sendSuccess } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { getPaginationOptions, calculatePagination } from '../../utils/pagination';

export class LawyerPortalController {
  // ==========================================
  // AUTH & ONBOARDING
  // ==========================================

  static async register(req: Request, res: Response) {
    const { lawyer, token } = await LawyerAuthService.register(req.body);
    const isProduction = env.NODE_ENV === 'production';

    res.cookie('lawyer_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, 201, 'Lawyer account registered successfully and pending verification', {
      lawyer,
      token
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { lawyer, token } = await LawyerAuthService.login(email, password);
    const isProduction = env.NODE_ENV === 'production';

    res.cookie('lawyer_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, 200, 'Lawyer authentication successful', {
      lawyer,
      token
    });
  }

  static async logout(_req: Request, res: Response) {
    const isProduction = env.NODE_ENV === 'production';
    res.clearCookie('lawyer_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax'
    });

    return sendSuccess(res, 200, 'Logged out successfully');
  }

  static async getMe(req: Request, res: Response) {
    return sendSuccess(res, 200, 'Current lawyer profile retrieved', req.lawyer);
  }

  static async getProfile(req: Request, res: Response) {
    return sendSuccess(res, 200, 'Lawyer profile retrieved', req.lawyer);
  }

  static async updateProfile(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const updated = await LawyerAuthService.updateProfile(req.lawyer._id.toString(), req.body);
    return sendSuccess(res, 200, 'Lawyer profile updated successfully', updated);
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  static async getDashboardStats(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;

    const [
      totalMatters,
      activeMatters,
      newQueries,
      pendingConsultations,
      upcomingConsultations,
      docsAwaitingReview,
      recentQueries,
      recentMatters
    ] = await Promise.all([
      Matter.countDocuments({ lawyerId }),
      Matter.countDocuments({ lawyerId, status: { $in: ['active', 'intake', 'pending_court', 'under_negotiation'] } }),
      Query.countDocuments({
        $or: [
          { assignedLawyerId: lawyerId, status: 'assigned' },
          { status: 'pending', 'declinedBy.lawyerId': { $ne: lawyerId } }
        ]
      }),
      Consultation.countDocuments({ lawyerId, status: 'pending' }),
      Consultation.countDocuments({ lawyerId, status: 'accepted', date: { $gte: new Date() } }),
      DocumentRecord.countDocuments({ lawyerId, reviewStatus: 'pending' }),
      Query.find({
        $or: [
          { assignedLawyerId: lawyerId },
          { status: 'pending', 'declinedBy.lawyerId': { $ne: lawyerId } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(4),
      Matter.find({ lawyerId })
        .sort({ updatedAt: -1 })
        .limit(4)
    ]);

    return sendSuccess(res, 200, 'Dashboard statistics retrieved', {
      totalMatters,
      activeMatters,
      newQueries,
      pendingConsultations,
      upcomingConsultations,
      docsAwaitingReview,
      recentQueries,
      recentMatters
    });
  }

  static async getDashboardActivity(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const notifications = await Notification.find({ recipientId: req.lawyer._id, recipientType: 'lawyer' })
      .sort({ createdAt: -1 })
      .limit(10);
    return sendSuccess(res, 200, 'Recent activities retrieved', notifications);
  }

  // ==========================================
  // INCOMING QUERIES
  // ==========================================

  static async listQueries(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;
    const pagination = getPaginationOptions(req.query);

    const filter: Record<string, any> = {
      isDraft: { $ne: true },
      $or: [
        { assignedLawyerId: lawyerId },
        { status: 'pending', 'declinedBy.lawyerId': { $ne: lawyerId } }
      ]
    };

    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.category && typeof req.query.category === 'string') {
      filter.category = req.query.category;
    }
    if (req.query.urgency && typeof req.query.urgency === 'string') {
      filter.urgency = req.query.urgency;
    }
    if (req.query.search && typeof req.query.search === 'string') {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { queryReference: regex },
            { category: regex },
            { summary: regex },
            { customerName: regex },
            { customerLocation: regex }
          ]
        }
      ];
    }

    const [queries, total] = await Promise.all([
      Query.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Query.countDocuments(filter)
    ]);

    return sendSuccess(
      res,
      200,
      'Incoming queries retrieved',
      queries,
      calculatePagination(total, pagination.page, pagination.limit)
    );
  }

  static async getQueryById(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const query = await Query.findById(req.params.id);

    if (!query) {
      throw ApiError.notFound('Customer query not found');
    }

    return sendSuccess(res, 200, 'Customer query retrieved with intake summary', query);
  }

  /**
   * Concurrency-safe atomic query acceptance:
   * Only one lawyer can accept an unassigned/pending query.
   * Creates an active legal matter automatically.
   */
  static async acceptQuery(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;
    const queryId = req.params.id;

    // Concurrency atomic update
    const updatedQuery = await Query.findOneAndUpdate(
      {
        _id: queryId,
        status: { $in: ['pending', 'assigned'] },
        $or: [{ assignedLawyerId: null }, { assignedLawyerId: lawyerId }]
      },
      {
        $set: {
          status: 'accepted',
          assignedLawyerId: lawyerId,
          acceptedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedQuery) {
      throw ApiError.conflict(
        'This query has already been accepted by another lawyer or is no longer available.'
      );
    }

    // Automatically create a corresponding legal matter
    const count = await Matter.countDocuments();
    const matterReference = `MTR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newMatter = await Matter.create({
      matterReference,
      title: `${updatedQuery.category}: ${updatedQuery.summary.substring(0, 60)}...`,
      category: updatedQuery.category,
      description: updatedQuery.summary,
      aiSummary: updatedQuery.intakeSummary?.aiSummary || '',
      importantFacts: updatedQuery.intakeSummary?.confirmedFacts || [],
      status: 'active',
      lawyerId,
      customerId: updatedQuery.customerId || null,
      customer: {
        name: updatedQuery.customerName,
        email: updatedQuery.customerEmail,
        phone: updatedQuery.customerPhone
      },
      queryId: updatedQuery._id,
      internalNotes: [
        {
          content: `Matter initiated from accepted intake query ${updatedQuery.queryReference}. Customer question: "${updatedQuery.specificQuestion}"`,
          createdAt: new Date(),
          createdBy: req.lawyer.fullName
        }
      ],
      clientUpdates: [
        {
          title: 'Matter Accepted',
          message: `Advocate ${req.lawyer.fullName} has accepted your legal query and initiated your matter file.`,
          createdAt: new Date(),
          isShared: true
        }
      ],
      timeline: [
        {
          title: 'Problem submitted',
          description: `Submitted query ${updatedQuery.queryReference}`,
          eventType: 'problem_submitted',
          createdAt: updatedQuery.createdAt
        },
        {
          title: 'Lawyer assigned',
          description: `Advocate ${req.lawyer.fullName} accepted your query`,
          eventType: 'lawyer_assigned',
          createdAt: new Date()
        }
      ]
    });

    updatedQuery.associatedMatterId = newMatter._id as any;
    await updatedQuery.save();

    await DocumentRecord.updateMany(
      { queryId: updatedQuery._id },
      { $set: { matterId: newMatter._id, lawyerId } }
    );

    // Create Notification for Lawyer
    await Notification.create({
      recipientId: lawyerId,
      recipientType: 'lawyer',
      title: 'Query Accepted',
      message: `You accepted query ${updatedQuery.queryReference}. Matter ${matterReference} has been created.`,
      type: 'matter',
      link: `/matters/${newMatter._id}`
    });

    // Notify Customer if registered
    if (updatedQuery.customerId) {
      await Notification.create({
        recipientId: updatedQuery.customerId,
        recipientType: 'customer',
        title: 'Lawyer Accepted Your Query',
        message: `Advocate ${req.lawyer.fullName} accepted your legal problem and opened matter ${matterReference}.`,
        type: 'matter',
        link: `/matters/${newMatter._id}`
      });
    }

    return sendSuccess(res, 200, 'Query accepted successfully and legal matter created', {
      query: updatedQuery,
      matter: newMatter
    });
  }

  static async declineQuery(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;
    const queryId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      throw ApiError.badRequest('A mandatory decline reason must be specified');
    }

    const query = await Query.findById(queryId);
    if (!query) throw ApiError.notFound('Query not found');

    // Add to decline record
    query.declinedBy.push({
      lawyerId,
      reason: reason.trim(),
      declinedAt: new Date()
    });

    // If query was assigned explicitly to this lawyer, return to pending
    if (query.assignedLawyerId?.toString() === lawyerId.toString()) {
      query.assignedLawyerId = null;
      query.status = 'pending';
    }

    await query.save();

    return sendSuccess(res, 200, 'Query declined successfully', query);
  }

  // ==========================================
  // LEGAL MATTERS
  // ==========================================

  static async listMatters(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;
    const pagination = getPaginationOptions(req.query);

    const filter: Record<string, any> = { lawyerId };
    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.category && typeof req.query.category === 'string') {
      filter.category = req.query.category;
    }
    if (req.query.search && typeof req.query.search === 'string') {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { matterReference: regex },
        { title: regex },
        { 'customer.name': regex },
        { 'customer.email': regex }
      ];
    }

    const [matters, total] = await Promise.all([
      Matter.find(filter)
        .sort({ updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Matter.countDocuments(filter)
    ]);

    return sendSuccess(
      res,
      200,
      'Legal matters retrieved',
      matters,
      calculatePagination(total, pagination.page, pagination.limit)
    );
  }

  static async getMatterById(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const matter = await Matter.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });

    if (!matter) {
      throw ApiError.notFound('Matter not found or access denied');
    }

    return sendSuccess(res, 200, 'Matter details retrieved', matter);
  }

  static async updateMatterStatus(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { status } = req.body;

    const allowed = ['intake', 'active', 'pending_court', 'under_negotiation', 'resolved', 'closed'];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(`Invalid matter status: ${status}`);
    }

    const matter = await Matter.findOne({ _id: req.params.id, lawyerId: req.lawyer._id });
    if (!matter) throw ApiError.notFound('Matter not found');

    matter.status = status;
    await matter.save();

    return sendSuccess(res, 200, `Matter status updated to '${status}'`, matter);
  }

  static async addInternalNote(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw ApiError.badRequest('Note content cannot be empty');
    }

    const matter = await Matter.findOne({ _id: req.params.id, lawyerId: req.lawyer._id });
    if (!matter) throw ApiError.notFound('Matter not found');

    matter.internalNotes.unshift({
      content: content.trim(),
      createdAt: new Date(),
      createdBy: req.lawyer.fullName
    });

    await matter.save();
    return sendSuccess(res, 201, 'Private internal note recorded', matter.internalNotes);
  }

  static async addClientUpdate(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { title, message, isShared = true } = req.body;

    if (!title || !message) {
      throw ApiError.badRequest('Title and message are required for client update');
    }

    const matter = await Matter.findOne({ _id: req.params.id, lawyerId: req.lawyer._id });
    if (!matter) throw ApiError.notFound('Matter not found');

    matter.clientUpdates.unshift({
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date(),
      isShared
    });

    await matter.save();
    return sendSuccess(res, 201, 'Client update published', matter.clientUpdates);
  }

  static async addMatterTask(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { title, dueDate } = req.body;

    if (!title) throw ApiError.badRequest('Task title is required');

    const matter = await Matter.findOne({ _id: req.params.id, lawyerId: req.lawyer._id });
    if (!matter) throw ApiError.notFound('Matter not found');

    matter.tasks.push({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      isCompleted: false
    });

    await matter.save();
    return sendSuccess(res, 201, 'Task added to matter', matter.tasks);
  }

  static async toggleMatterTask(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { taskId } = req.params;

    const matter = await Matter.findOne({ _id: req.params.id, lawyerId: req.lawyer._id });
    if (!matter) throw ApiError.notFound('Matter not found');

    const task = matter.tasks.find((t) => t._id?.toString() === taskId);
    if (!task) throw ApiError.notFound('Task not found');

    task.isCompleted = !task.isCompleted;
    await matter.save();

    return sendSuccess(res, 200, 'Task status updated', task);
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================

  static async listDocuments(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;
    const pagination = getPaginationOptions(req.query);

    const filter: Record<string, any> = { lawyerId };
    if (req.query.matterId) filter.matterId = req.query.matterId;
    if (req.query.reviewStatus) filter.reviewStatus = req.query.reviewStatus;

    const [documents, total] = await Promise.all([
      DocumentRecord.find(filter)
        .sort({ uploadedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      DocumentRecord.countDocuments(filter)
    ]);

    return sendSuccess(
      res,
      200,
      'Authorized documents retrieved',
      documents,
      calculatePagination(total, pagination.page, pagination.limit)
    );
  }

  static async getDocumentById(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const doc = await DocumentRecord.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });

    if (!doc) throw ApiError.notFound('Document not found or access denied');
    return sendSuccess(res, 200, 'Document retrieved', doc);
  }

  static async getDocumentAccess(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const doc = await DocumentRecord.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });

    if (!doc) throw ApiError.notFound('Document not found or access denied');

    // Secure temporary signed/access token URL
    const accessUrl = `/api/v1/lawyer/documents/${doc._id}/stream?token=${Date.now()}`;
    return sendSuccess(res, 200, 'Authorized document access link generated', {
      documentId: doc._id,
      name: doc.name,
      accessUrl,
      expiresInSeconds: 3600
    });
  }

  static async reviewDocument(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { reviewStatus, reviewComments } = req.body;

    const doc = await DocumentRecord.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });
    if (!doc) throw ApiError.notFound('Document not found');

    doc.reviewStatus = reviewStatus;
    doc.reviewComments = reviewComments;
    doc.reviewedAt = new Date();
    await doc.save();

    return sendSuccess(res, 200, 'Document review completed', doc);
  }

  // ==========================================
  // CONVERSATIONS & MESSAGING
  // ==========================================

  static async listConversations(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const conversations = await Conversation.find({ lawyerId: req.lawyer._id })
      .sort({ lastMessageAt: -1 })
      .populate('matterId', 'title matterReference status');

    return sendSuccess(res, 200, 'Conversations retrieved', conversations);
  }

  static async getConversationMessages(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const conversationId = req.params.id;

    const conv = await Conversation.findOne({
      _id: conversationId,
      lawyerId: req.lawyer._id
    });
    if (!conv) throw ApiError.notFound('Conversation not found or access denied');

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    return sendSuccess(res, 200, 'Conversation messages retrieved', messages);
  }

  static async sendMessage(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const conversationId = req.params.id;
    const { content, attachments = [] } = req.body;

    if (!content || content.trim().length === 0) {
      throw ApiError.badRequest('Message content cannot be empty');
    }

    const conv = await Conversation.findOne({
      _id: conversationId,
      lawyerId: req.lawyer._id
    });
    if (!conv) throw ApiError.notFound('Conversation not found');

    const message = await Message.create({
      conversationId: conv._id,
      senderType: 'lawyer',
      senderId: req.lawyer._id.toString(),
      senderName: req.lawyer.fullName,
      content: content.trim(),
      attachments
    });

    conv.lastMessage = content.trim();
    conv.lastMessageAt = new Date();
    conv.unreadCountCustomer += 1;
    await conv.save();

    if (conv.customerId) {
      await Notification.create({
        recipientId: conv.customerId,
        recipientType: 'customer',
        title: `New message from ${req.lawyer.fullName}`,
        message: content.trim().slice(0, 100),
        type: 'message',
        link: `/messages/${conv._id}`
      });
    }

    return sendSuccess(res, 201, 'Message sent successfully', message);
  }

  static async markConversationRead(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const conv = await Conversation.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });
    if (!conv) throw ApiError.notFound('Conversation not found');

    conv.unreadCountLawyer = 0;
    await conv.save();

    await Message.updateMany(
      { conversationId: conv._id, senderType: 'customer', readAt: null },
      { $set: { readAt: new Date() } }
    );

    return sendSuccess(res, 200, 'Conversation marked as read');
  }

  // ==========================================
  // CONSULTATIONS
  // ==========================================

  static async listConsultations(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const lawyerId = req.lawyer._id;
    const pagination = getPaginationOptions(req.query);

    const filter: Record<string, any> = { lawyerId };
    if (req.query.status) filter.status = req.query.status;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .sort({ date: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Consultation.countDocuments(filter)
    ]);

    return sendSuccess(
      res,
      200,
      'Consultation requests retrieved',
      consultations,
      calculatePagination(total, pagination.page, pagination.limit)
    );
  }

  static async getConsultationById(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });

    if (!consultation) throw ApiError.notFound('Consultation not found');
    return sendSuccess(res, 200, 'Consultation details retrieved', consultation);
  }

  static async acceptConsultation(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { meetingLink } = req.body;

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });
    if (!consultation) throw ApiError.notFound('Consultation not found');

    consultation.status = 'accepted';
    if (meetingLink) consultation.meetingLink = meetingLink;
    await consultation.save();

    if (consultation.customerId) {
      await Notification.create({
        recipientId: consultation.customerId,
        recipientType: 'customer',
        title: 'Consultation Confirmed',
        message: `${req.lawyer.fullName} confirmed your consultation for ${consultation.time}.`,
        type: 'consultation',
        link: `/consultations/${consultation._id}`
      });
    }

    if (consultation.matterId) {
      await Matter.findByIdAndUpdate(consultation.matterId, {
        $push: {
          timeline: {
            title: 'Consultation accepted',
            description: `Confirmed by ${req.lawyer.fullName} for ${consultation.time}`,
            eventType: 'consultation',
            createdAt: new Date()
          }
        }
      });
    }

    return sendSuccess(res, 200, 'Consultation accepted', consultation);
  }

  static async declineConsultation(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { reason } = req.body;

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });
    if (!consultation) throw ApiError.notFound('Consultation not found');

    consultation.status = 'cancelled';
    consultation.declineReason = reason || 'Lawyer unavailable at requested time';
    await consultation.save();

    if (consultation.customerId) {
      await Notification.create({
        recipientId: consultation.customerId,
        recipientType: 'customer',
        title: 'Consultation Update',
        message: `Your consultation request with ${req.lawyer.fullName} was declined: ${consultation.declineReason}`,
        type: 'consultation',
        link: `/consultations/${consultation._id}`
      });
    }

    return sendSuccess(res, 200, 'Consultation cancelled', consultation);
  }

  static async updateConsultationStatus(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const { status } = req.body;

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      lawyerId: req.lawyer._id
    });
    if (!consultation) throw ApiError.notFound('Consultation not found');

    consultation.status = status;
    await consultation.save();

    return sendSuccess(res, 200, `Consultation status changed to '${status}'`, consultation);
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  static async listNotifications(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const notifications = await Notification.find({ recipientId: req.lawyer._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 200, 'Notifications retrieved', notifications);
  }

  static async markNotificationRead(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.lawyer._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notif) throw ApiError.notFound('Notification not found');
    return sendSuccess(res, 200, 'Notification marked as read', notif);
  }

  static async markAllNotificationsRead(req: Request, res: Response) {
    if (!req.lawyer) throw ApiError.unauthorized();
    await Notification.updateMany(
      { recipientId: req.lawyer._id, isRead: false },
      { $set: { isRead: true } }
    );
    return sendSuccess(res, 200, 'All notifications marked as read');
  }
}

