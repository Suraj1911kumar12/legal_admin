export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'suspended' | 'inactive';

export interface OfficeAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
}

export interface ProfessionalDocument {
  _id?: string;
  documentType: string;
  storageKey: string;
  originalFileName: string;
  uploadedAt: string;
  reviewStatus: 'pending' | 'verified' | 'rejected';
}

export interface Lawyer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  languages: string[];
  barEnrollmentNumber: string;
  barCouncil: string;
  enrollmentState: string;
  yearsOfExperience: number;
  practiceAreas: string[];
  professionalBio?: string;
  officeAddress: OfficeAddress;
  city: string;
  state: string;
  pincode: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: { _id: string; name: string; email: string };
  rejectionReason?: string;
  accountStatus: AccountStatus;
  statusReason?: string;
  documents: ProfessionalDocument[];
  deletedAt?: string | null;
  createdBy?: { _id: string; name: string; email: string };
  updatedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LawyerListResponse {
  success: boolean;
  message?: string;
  data: Lawyer[];
  pagination: PaginationMeta;
}

export interface DashboardStats {
  totalLawyers: number;
  pendingVerification: number;
  underReview: number;
  verified: number;
  rejected: number;
  activeLawyers: number;
  suspendedLawyers: number;
  inactiveLawyers: number;
  recentLawyers: Lawyer[];
}

