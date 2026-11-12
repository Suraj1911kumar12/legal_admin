import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiEnvelope } from '@/services/api/apiClient';
import {
  AISession,
  AIStatus,
  ChatMessage,
  CustomerConsultation,
  CustomerConversation,
  CustomerDashboard,
  CustomerDocument,
  CustomerMatter,
  CustomerNotification,
  LegalIntake,
  PublicLawyer
} from '@/types/customer';

export const customerKeys = {
  all: ['customer'] as const,
  dashboard: () => [...customerKeys.all, 'dashboard'] as const,
  intakes: (isDraft?: boolean) => [...customerKeys.all, 'intakes', { isDraft }] as const,
  intake: (id: string) => [...customerKeys.all, 'intake', id] as const,
  aiStatus: () => [...customerKeys.all, 'ai-status'] as const,
  aiSessions: () => [...customerKeys.all, 'ai-sessions'] as const,
  aiSession: (id: string) => [...customerKeys.all, 'ai-session', id] as const,
  documents: (matterId?: string) => [...customerKeys.all, 'documents', { matterId }] as const,
  matters: (status?: string) => [...customerKeys.all, 'matters', { status }] as const,
  matter: (id: string) => [...customerKeys.all, 'matter', id] as const,
  lawyers: (filters?: Record<string, string | number | undefined>) =>
    [...customerKeys.all, 'lawyers', filters || {}] as const,
  lawyer: (id: string) => [...customerKeys.all, 'lawyer', id] as const,
  lawyerSlots: (lawyerId: string, date: string) =>
    [...customerKeys.all, 'lawyer-slots', lawyerId, date] as const,
  consultations: () => [...customerKeys.all, 'consultations'] as const,
  consultation: (id: string) => [...customerKeys.all, 'consultation', id] as const,
  conversations: () => [...customerKeys.all, 'conversations'] as const,
  conversationMessages: (id: string) => [...customerKeys.all, 'conversation-messages', id] as const,
  notifications: () => [...customerKeys.all, 'notifications'] as const
};

export function useCustomerDashboard(enabled = true) {
  return useQuery({
    queryKey: customerKeys.dashboard(),
    queryFn: async () => {
      const res = await apiClient.get<CustomerDashboard>('/customer/dashboard');
      return res.data;
    },
    enabled
  });
}

// ==========================================
// INTAKES & DRAFTS
// ==========================================

export function useIntakes(isDraft?: boolean) {
  return useQuery({
    queryKey: customerKeys.intakes(isDraft),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (isDraft !== undefined) params.isDraft = String(isDraft);
      const res = await apiClient.get<LegalIntake[]>('/customer/intakes', params);
      return res.data;
    }
  });
}

export function useIntake(id: string) {
  return useQuery({
    queryKey: customerKeys.intake(id),
    queryFn: async () => {
      const res = await apiClient.get<LegalIntake>(`/customer/intakes/${id}`);
      return res.data;
    },
    enabled: Boolean(id) && id !== 'new'
  });
}

export interface SaveIntakePayload {
  id?: string;
  category: string;
  summary: string;
  specificQuestion?: string;
  customerLocation?: string;
  preferredLanguage?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  isDraft?: boolean;
  documentIds?: string[];
  followUpAnswers?: { question: string; answer: string }[];
  clientSubmissionKey?: string;
}

export function useSaveIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: SaveIntakePayload) => {
      if (id && id !== 'new') {
        const res = await apiClient.patch<LegalIntake>(`/customer/intakes/${id}`, payload);
        return res.data;
      }
      const res = await apiClient.post<LegalIntake>('/customer/intakes', payload);
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      if (data?._id) {
        qc.setQueryData(customerKeys.intake(data._id), data);
      }
    }
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customer/intakes/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
    }
  });
}

// ==========================================
// AI ASSISTANT
// ==========================================

export function useAIStatus() {
  return useQuery({
    queryKey: customerKeys.aiStatus(),
    queryFn: async () => {
      const res = await apiClient.get<AIStatus>('/customer/ai/status');
      return res.data;
    }
  });
}

export function useAISessions() {
  return useQuery({
    queryKey: customerKeys.aiSessions(),
    queryFn: async () => {
      const res = await apiClient.get<AISession[]>('/customer/ai/sessions');
      return res.data;
    }
  });
}

export function useAISession(id: string) {
  return useQuery({
    queryKey: customerKeys.aiSession(id),
    queryFn: async () => {
      const res = await apiClient.get<{ session: AISession; aiStatus: AIStatus }>(
        `/customer/ai/sessions/${id}`
      );
      return res.data;
    },
    enabled: Boolean(id)
  });
}

export function useCreateAISession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      intakeId?: string;
      matterId?: string;
      title?: string;
      initialProblem?: string;
      preferredLanguage?: string;
    }) => {
      const res = await apiClient.post<AISession>('/customer/ai/sessions', payload);
      return res.data;
    },
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: customerKeys.aiSessions() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
      if (session?._id) {
        qc.invalidateQueries({ queryKey: customerKeys.aiSession(session._id) });
      }
    }
  });
}

export function useSendAIMessage(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await apiClient.post<AISession>(`/customer/ai/sessions/${sessionId}/messages`, {
        content
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.aiSession(sessionId) });
      qc.invalidateQueries({ queryKey: customerKeys.aiSessions() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

export function useSelectSolutionPath(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      choice: 'continue_alone' | 'get_legal_help';
      optionTitle?: string;
    }) => {
      const res = await apiClient.post<AISession>(
        `/customer/ai/sessions/${sessionId}/solutions/select`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.aiSession(sessionId) });
      qc.invalidateQueries({ queryKey: customerKeys.aiSessions() });
    }
  });
}

// ==========================================
// DOCUMENTS
// ==========================================

export function useDocuments(matterId?: string) {
  return useQuery({
    queryKey: customerKeys.documents(matterId),
    queryFn: async () => {
      const params = matterId ? { matterId } : undefined;
      const res = await apiClient.get<CustomerDocument[]>('/customer/documents', params);
      return res.data;
    }
  });
}

export function useAssociateDocumentMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ docId, matterId }: { docId: string; matterId: string | null }) => {
      const res = await apiClient.patch<CustomerDocument>(`/customer/documents/${docId}/matter`, {
        matterId
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
    }
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (docId: string) => {
      await apiClient.delete(`/customer/documents/${docId}`);
      return docId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
    }
  });
}

// ==========================================
// MY MATTERS
// ==========================================

export function useMatters(status?: string) {
  return useQuery({
    queryKey: customerKeys.matters(status),
    queryFn: async () => {
      const params = status ? { status } : undefined;
      const res = await apiClient.get<CustomerMatter[]>('/customer/matters', params);
      return res.data;
    }
  });
}

export interface MatterDetailResponse {
  matter: CustomerMatter;
  documents: CustomerDocument[];
  consultations: CustomerConsultation[];
  conversations: CustomerConversation[];
}

export function useMatterDetail(id: string) {
  return useQuery({
    queryKey: customerKeys.matter(id),
    queryFn: async () => {
      const res = await apiClient.get<MatterDetailResponse>(`/customer/matters/${id}`);
      return res.data;
    },
    enabled: Boolean(id)
  });
}

export function useCreateMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      category: string;
      description?: string;
      intakeId?: string;
      aiSessionId?: string;
      selectedSolution?: string;
      importantFacts?: string[];
      aiSummary?: string;
    }) => {
      const res = await apiClient.post<CustomerMatter>('/customer/matters', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
    }
  });
}

// ==========================================
// LAWYERS & CONSULTATIONS
// ==========================================

export function useVerifiedLawyers(filters?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: customerKeys.lawyers(filters),
    queryFn: async (): Promise<ApiEnvelope<PublicLawyer[]>> => {
      const cleanParams: Record<string, string | number> = {};
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v !== undefined && v !== '' && v !== 'all') {
            cleanParams[k] = v;
          }
        }
      }
      return apiClient.get<PublicLawyer[]>('/customer/lawyers', cleanParams);
    }
  });
}

export function useVerifiedLawyer(id: string) {
  return useQuery({
    queryKey: customerKeys.lawyer(id),
    queryFn: async () => {
      const res = await apiClient.get<PublicLawyer>(`/customer/lawyers/${id}`);
      return res.data;
    },
    enabled: Boolean(id)
  });
}

export interface LawyerSlotsResponse {
  date: string;
  timeZone: string;
  isLawyerAvailable: boolean;
  consultationTypes: string[];
  fee: number;
  slots: { time: string; available: boolean }[];
}

export function useLawyerSlots(lawyerId: string, date: string) {
  return useQuery({
    queryKey: customerKeys.lawyerSlots(lawyerId, date),
    queryFn: async () => {
      const res = await apiClient.get<LawyerSlotsResponse>(
        `/customer/lawyers/${lawyerId}/slots`,
        { date }
      );
      return res.data;
    },
    enabled: Boolean(lawyerId && date)
  });
}

export function useConsultations() {
  return useQuery({
    queryKey: customerKeys.consultations(),
    queryFn: async () => {
      const res = await apiClient.get<CustomerConsultation[]>('/customer/consultations');
      return res.data;
    }
  });
}

export function useConsultationDetail(id: string) {
  return useQuery({
    queryKey: customerKeys.consultation(id),
    queryFn: async () => {
      const res = await apiClient.get<CustomerConsultation>(`/customer/consultations/${id}`);
      return res.data;
    },
    enabled: Boolean(id)
  });
}

export function useRequestConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      lawyerId: string;
      matterId?: string;
      date: string;
      time: string;
      timeZone?: string;
      type: 'video' | 'phone' | 'in_person';
      notes?: string;
    }) => {
      const res = await apiClient.post<CustomerConsultation>('/customer/consultations', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.consultations() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
      qc.invalidateQueries({ queryKey: customerKeys.all });
    }
  });
}

export function useCancelConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch<CustomerConsultation>(
        `/customer/consultations/${id}/cancel`
      );
      return res.data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: customerKeys.consultations() });
      qc.invalidateQueries({ queryKey: customerKeys.consultation(id) });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

// ==========================================
// MESSAGING
// ==========================================

export function useConversations() {
  return useQuery({
    queryKey: customerKeys.conversations(),
    queryFn: async () => {
      const res = await apiClient.get<CustomerConversation[]>('/customer/conversations');
      return res.data;
    }
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      lawyerId: string;
      matterId?: string;
      shareMatterSummary?: boolean;
      initialMessage?: string;
    }) => {
      const res = await apiClient.post<CustomerConversation>('/customer/conversations', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.conversations() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

export function useConversationMessages(conversationId: string, pollIntervalMs = 8000) {
  return useQuery({
    queryKey: customerKeys.conversationMessages(conversationId),
    queryFn: async () => {
      const res = await apiClient.get<{
        conversation: CustomerConversation;
        messages: ChatMessage[];
      }>(`/customer/conversations/${conversationId}/messages`);
      return res.data;
    },
    enabled: Boolean(conversationId),
    refetchInterval: pollIntervalMs
  });
}

export function useSendChatMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { content?: string; attachmentDocIds?: string[] }) => {
      const res = await apiClient.post<ChatMessage>(
        `/customer/conversations/${conversationId}/messages`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.conversationMessages(conversationId) });
      qc.invalidateQueries({ queryKey: customerKeys.conversations() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.patch<CustomerConversation>(
        `/customer/conversations/${conversationId}/read`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.conversations() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export function useCustomerNotifications() {
  return useQuery({
    queryKey: customerKeys.notifications(),
    queryFn: async () => {
      const res = await apiClient.get<CustomerNotification[]>('/customer/notifications');
      return res.data;
    }
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/customer/notifications/${id}/read`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.notifications() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/customer/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.notifications() });
      qc.invalidateQueries({ queryKey: customerKeys.dashboard() });
    }
  });
}

