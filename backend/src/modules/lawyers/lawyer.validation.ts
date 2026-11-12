import { z } from 'zod';

export const officeAddressSchema = z.object({
  addressLine1: z.string().trim().min(3, 'Address line 1 must be at least 3 characters'),
  addressLine2: z.string().trim().optional(),
  landmark: z.string().trim().optional()
});

export const documentItemSchema = z.object({
  documentType: z.string().trim().min(2, 'Document type is required'),
  storageKey: z.string().trim().min(2, 'Storage key is required'),
  originalFileName: z.string().trim().min(2, 'Original file name is required'),
  reviewStatus: z.enum(['pending', 'verified', 'rejected']).default('pending')
});

export const createLawyerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{8,20}$/, 'Please provide a valid phone number'),
  profileImage: z.string().url('Profile image must be a valid URL').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  languages: z.array(z.string().trim()).min(1, 'At least one language must be provided'),
  barEnrollmentNumber: z.string().trim().min(3, 'Bar enrollment number is required').toUpperCase(),
  barCouncil: z.string().trim().min(2, 'Bar council authority is required'),
  enrollmentState: z.string().trim().min(2, 'Enrollment state is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Experience cannot be negative').max(70, 'Invalid experience'),
  practiceAreas: z.array(z.string().trim()).min(1, 'At least one practice area is required'),
  professionalBio: z.string().trim().max(2500).optional().or(z.literal('')),
  officeAddress: officeAddressSchema,
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().min(4, 'Pincode must be at least 4 characters').max(10),
  documents: z.array(documentItemSchema).optional().default([])
});

export const updateLawyerSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{8,20}$/, 'Please provide a valid phone number')
    .optional(),
  profileImage: z.string().url().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  languages: z.array(z.string().trim()).min(1).optional(),
  barEnrollmentNumber: z.string().trim().min(3).toUpperCase().optional(),
  barCouncil: z.string().trim().min(2).optional(),
  enrollmentState: z.string().trim().min(2).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(70).optional(),
  practiceAreas: z.array(z.string().trim()).min(1).optional(),
  professionalBio: z.string().trim().max(2500).optional().or(z.literal('')),
  officeAddress: officeAddressSchema.partial().optional(),
  city: z.string().trim().min(2).optional(),
  state: z.string().trim().min(2).optional(),
  pincode: z.string().trim().min(4).max(10).optional(),
  documents: z.array(documentItemSchema).optional()
});

export const updateVerificationSchema = z
  .object({
    status: z.enum(['under_review', 'verified', 'rejected']),
    verificationNotes: z.string().trim().optional(),
    rejectionReason: z.string().trim().optional()
  })
  .refine(
    (data) => {
      if (data.status === 'rejected' && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting a lawyer verification',
      path: ['rejectionReason']
    }
  );

export const updateAccountStatusSchema = z
  .object({
    status: z.enum(['active', 'suspended', 'inactive']),
    reason: z.string().trim().optional()
  })
  .refine(
    (data) => {
      if ((data.status === 'suspended' || data.status === 'inactive') && (!data.reason || data.reason.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Reason is required when suspending or deactivating an account',
      path: ['reason']
    }
  );

export const lawyerIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Lawyer ObjectId')
});

export const queryLawyersSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().optional(),
  verificationStatus: z.enum(['pending', 'under_review', 'verified', 'rejected']).optional(),
  accountStatus: z.enum(['active', 'suspended', 'inactive']).optional(),
  practiceArea: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeDeleted: z.enum(['true', 'false']).optional().default('false')
});

export type CreateLawyerInput = z.infer<typeof createLawyerSchema>;
export type UpdateLawyerInput = z.infer<typeof updateLawyerSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
export type UpdateAccountStatusInput = z.infer<typeof updateAccountStatusSchema>;
export type QueryLawyersInput = z.infer<typeof queryLawyersSchema>;
