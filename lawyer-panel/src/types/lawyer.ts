export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'suspended' | 'inactive';

export interface OfficeAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
}

export interface LawyerProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileImage?: string;
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
  consultationTypes: string[];
  consultationFee: number;
  isAvailable: boolean;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeSummary {
  aiSummary: string;
  likelyCategory: string;
  confirmedFacts?: string[];
  missingInformation: string[];
  recommendedNextSteps: string[];
}

export interface QueryDocument {
  name: string;
  type: string;
  url: string;
  size?: number;
}

export interface CustomerQuery {
  _id: string;
  queryReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  category: string;
  summary: string;
  specificQuestion: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'accepted' | 'declined' | 'closed';
  assignedLawyerId?: string | null;
  acceptedAt?: string;
  documents: QueryDocument[];
  intakeSummary: IntakeSummary;
  associatedMatterId?: string | null;
  createdAt: string;
}

export interface InternalNote {
  _id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface ClientUpdate {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  isShared: boolean;
}

export interface MatterTask {
  _id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
}

export interface ImportantDate {
  _id: string;
  title: string;
  date: string;
  description?: string;
}

export interface LegalMatter {
  _id: string;
  matterReference: string;
  title: string;
  category: string;
  status: 'intake' | 'active' | 'pending_court' | 'under_negotiation' | 'resolved' | 'closed';
  lawyerId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  queryId?: string | null;
  internalNotes: InternalNote[];
  clientUpdates: ClientUpdate[];
  tasks: MatterTask[];
  importantDates: ImportantDate[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  _id: string;
  name: string;
  documentType: string;
  matterId?: string | null;
  lawyerId: string;
  customerName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  reviewStatus: 'pending' | 'reviewed' | 'action_required';
  reviewComments?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

export interface Conversation {
  _id: string;
  matterId?: {
    _id: string;
    title: string;
    matterReference: string;
    status: string;
  } | null;
  lawyerId: string;
  customer: {
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCountLawyer: number;
  unreadCountCustomer: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderType: 'lawyer' | 'customer';
  senderId: string;
  senderName: string;
  content: string;
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  readAt?: string | null;
  createdAt: string;
}

export interface Consultation {
  _id: string;
  consultationReference: string;
  lawyerId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  matterId?: string | null;
  date: string;
  time: string;
  timeZone: string;
  type: 'video' | 'phone' | 'in_person';
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  meetingLink?: string;
  location?: string;
  notes?: string;
  fee: number;
  declineReason?: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: 'query' | 'matter' | 'message' | 'consultation' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalMatters: number;
  activeMatters: number;
  newQueries: number;
  pendingConsultations: number;
  upcomingConsultations: number;
  docsAwaitingReview: number;
  recentQueries: CustomerQuery[];
  recentMatters: LegalMatter[];
}

