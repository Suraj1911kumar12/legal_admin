export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  matterUpdates: boolean;
  messages: boolean;
  consultations: boolean;
}

export interface CustomerProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  city?: string;
  state?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'deleted';
  deletionRequestedAt?: string;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface LegalIntake {
  _id: string;
  queryReference: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  category: string;
  summary: string;
  specificQuestion: string;
  preferredLanguage: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'pending' | 'assigned' | 'accepted' | 'declined' | 'closed';
  isDraft: boolean;
  documents: {
    documentId?: string | null;
    name: string;
    type: string;
    url: string;
    size?: number;
  }[];
  followUpAnswers: {
    question: string;
    answer: string;
    answeredAt: string;
  }[];
  intakeSummary: {
    aiSummary: string;
    likelyCategory: string;
    confirmedFacts?: string[];
    missingInformation: string[];
    recommendedNextSteps: string[];
  };
  associatedMatterId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIPossibleOption {
  title: string;
  explanation: string;
  whenRelevant: string;
  informationNeeded: string[];
  documentsRequired: string[];
  nextStep: string;
  limitations: string;
  sources?: string[];
}

export interface AIStructuredResponse {
  understandingYourProblem: string;
  importantFacts: string[];
  missingInformation: string[];
  whatLawGenerallySays: string;
  possibleOptions: AIPossibleOption[];
  documentsYouMayNeed: string[];
  suggestedNextSteps: string[];
  whenProfessionalHelpUseful: string;
  uncertaintyNotes?: string;
  disclaimer: string;
  likelyCategory: string;
  sources: { title: string; reference: string }[];
}

export interface AIMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  structuredResponse?: AIStructuredResponse | null;
  followUpQuestions?: string[];
  createdAt: string;
}

export interface AISession {
  _id: string;
  customerId: string;
  intakeId?: string | null;
  matterId?: string | null;
  title: string;
  likelyCategory: string;
  preferredLanguage: string;
  status: 'active' | 'completed';
  selectedSolutionPath?: {
    choice: 'continue_alone' | 'get_legal_help';
    optionTitle?: string;
    selectedAt: string;
  } | null;
  messages: AIMessage[];
  latestAnalysis?: AIStructuredResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIStatus {
  configured: boolean;
  provider: 'gemini' | 'openai' | 'none';
  message: string;
}

export interface CustomerDocument {
  _id: string;
  name: string;
  documentType: string;
  matterId?: string | null;
  queryId?: string | null;
  lawyerId?: string | null;
  customerId?: string | null;
  customerName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  reviewStatus: 'pending' | 'reviewed' | 'action_required';
  reviewComments?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

export interface PublicLawyer {
  _id: string;
  fullName: string;
  profileImage?: string;
  languages: string[];
  barCouncil: string;
  enrollmentState: string;
  yearsOfExperience: number;
  practiceAreas: string[];
  professionalBio?: string;
  city: string;
  state: string;
  consultationTypes: string[];
  consultationFee: number;
  isAvailable: boolean;
  verificationStatus: 'verified';
  verifiedAt?: string;
}

export interface CustomerMatter {
  _id: string;
  matterReference: string;
  title: string;
  category: string;
  description?: string;
  aiSummary?: string;
  importantFacts?: string[];
  selectedSolution?: string;
  status: 'intake' | 'active' | 'pending_court' | 'under_negotiation' | 'resolved' | 'closed';
  lawyerId?: PublicLawyer | string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  queryId?: LegalIntake | string | null;
  aiSessionId?: string | null;
  clientUpdates: {
    _id: string;
    title: string;
    message: string;
    createdAt: string;
    isShared: boolean;
  }[];
  tasks: {
    _id: string;
    title: string;
    dueDate?: string;
    isCompleted: boolean;
  }[];
  importantDates: {
    _id: string;
    title: string;
    date: string;
    description?: string;
  }[];
  timeline: {
    _id: string;
    title: string;
    description?: string;
    eventType:
      | 'problem_submitted'
      | 'document_uploaded'
      | 'ai_analysis'
      | 'lawyer_assigned'
      | 'consultation'
      | 'matter_updated';
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerConsultation {
  _id: string;
  consultationReference: string;
  lawyerId: PublicLawyer | string;
  matterId?: { _id: string; matterReference: string; title: string; status?: string } | string | null;
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

export interface CustomerConversation {
  _id: string;
  matterId?: { _id: string; title: string; matterReference: string; status: string } | null;
  lawyerId: PublicLawyer;
  sharedMatterSummary?: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountCustomer: number;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderType: 'lawyer' | 'customer';
  senderId: string;
  senderName: string;
  content: string;
  attachments: {
    documentId?: string | null;
    name: string;
    url: string;
    type: string;
  }[];
  readAt?: string | null;
  createdAt: string;
}

export interface CustomerNotification {
  _id: string;
  title: string;
  message: string;
  type: 'query' | 'matter' | 'message' | 'consultation' | 'document' | 'ai' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CustomerDashboard {
  aiConfigured: boolean;
  continueItem: {
    type: 'draft' | 'ai_session' | 'matter';
    id: string;
    title: string;
    updatedAt: string;
  } | null;
  recentMatters: CustomerMatter[];
  recentDrafts: LegalIntake[];
  recentDocuments: CustomerDocument[];
  upcomingConsultations: CustomerConsultation[];
  recentConversations: CustomerConversation[];
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  recentNotifications: CustomerNotification[];
}
