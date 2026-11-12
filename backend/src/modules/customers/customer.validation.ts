import { z } from 'zod';

export const customerRegisterSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(120),
    email: z.string().email('Valid email address is required'),
    phone: z.string().max(20).optional().default(''),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long'),
    preferredLanguage: z.string().max(10).optional().default('en'),
    deviceInfo: z.string().max(120).optional()
  })
};

export const customerLoginSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required'),
    password: z.string().min(1, 'Password is required'),
    deviceInfo: z.string().max(120).optional()
  })
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    deviceInfo: z.string().max(120).optional()
  })
};

export const updateCustomerProfileSchema = {
  body: z.object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z.string().max(20).optional(),
    preferredLanguage: z.string().max(10).optional(),
    city: z.string().max(80).optional(),
    state: z.string().max(80).optional(),
    notificationPreferences: z
      .object({
        pushEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        matterUpdates: z.boolean().optional(),
        messages: z.boolean().optional(),
        consultations: z.boolean().optional()
      })
      .optional()
  })
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100)
  })
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required')
  })
};

export const resetPasswordSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required'),
    resetToken: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100)
  })
};

export const intakeUpsertSchema = {
  body: z.object({
    category: z.string().max(100).optional().default('General Legal'),
    summary: z.string().max(5000).optional().default(''),
    specificQuestion: z.string().max(2000).optional().default(''),
    customerLocation: z.string().max(120).optional().default(''),
    customerPhone: z.string().max(20).optional(),
    preferredLanguage: z.string().max(10).optional().default('en'),
    urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    isDraft: z.boolean().optional().default(false),
    clientSubmissionKey: z.string().max(120).optional(),
    documentIds: z.array(z.string()).optional().default([]),
    followUpAnswers: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1)
        })
      )
      .optional()
      .default([])
  })
};

export const createAISessionSchema = {
  body: z.object({
    intakeId: z.string().optional(),
    matterId: z.string().optional(),
    title: z.string().max(200).optional(),
    initialProblem: z.string().max(5000).optional(),
    preferredLanguage: z.string().max(10).optional().default('en')
  })
};

export const sendAIMessageSchema = {
  body: z.object({
    content: z.string().min(1, 'Please enter your message or follow-up answer').max(5000)
  })
};

export const selectSolutionSchema = {
  body: z.object({
    choice: z.enum(['continue_alone', 'get_legal_help']),
    optionTitle: z.string().max(200).optional()
  })
};

export const createMatterFromCustomerSchema = {
  body: z.object({
    title: z.string().min(3, 'Matter title must be at least 3 characters').max(200),
    category: z.string().min(2).max(100),
    description: z.string().max(5000).optional().default(''),
    intakeId: z.string().optional(),
    aiSessionId: z.string().optional(),
    selectedSolution: z.string().max(200).optional(),
    importantFacts: z.array(z.string()).optional().default([]),
    aiSummary: z.string().max(5000).optional().default('')
  })
};

export const requestConsultationSchema = {
  body: z.object({
    lawyerId: z.string().min(1, 'Lawyer ID is required'),
    matterId: z.string().optional(),
    date: z.string().min(1, 'Consultation date is required'),
    time: z.string().min(1, 'Consultation time slot is required'),
    timeZone: z.string().optional().default('Asia/Kolkata'),
    type: z.enum(['video', 'phone', 'in_person']),
    notes: z.string().max(2000).optional().default('')
  })
};

export const startConversationSchema = {
  body: z.object({
    lawyerId: z.string().min(1, 'Lawyer ID is required'),
    matterId: z.string().optional(),
    shareMatterSummary: z.boolean().optional().default(false),
    initialMessage: z.string().max(3000).optional()
  })
};

export const sendCustomerMessageSchema = {
  body: z.object({
    content: z.string().min(1, 'Message content cannot be empty').max(4000),
    attachmentDocIds: z.array(z.string()).optional().default([])
  })
};

export const pushTokenSchema = {
  body: z.object({
    token: z.string().min(5, 'Push token is required').max(300),
    platform: z.enum(['android', 'ios', 'web', 'unknown']).optional().default('unknown'),
    deviceName: z.string().max(120).optional()
  })
};
