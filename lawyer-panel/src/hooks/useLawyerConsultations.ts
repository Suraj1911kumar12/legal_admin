import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Consultation } from '@/types/lawyer';

export function useConsultationsList(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['lawyer', 'consultations', params],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: Consultation[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/lawyer/consultations', params);
      return res;
    }
  });
}

export function useAcceptConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, meetingLink }: { id: string; meetingLink?: string }) => {
      const res = await apiClient.post<{ success: boolean; data: Consultation }>(
        `/lawyer/consultations/${id}/accept`,
        { meetingLink }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'consultations'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'dashboard', 'stats'] });
    }
  });
}

export function useDeclineConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.post<{ success: boolean; data: Consultation }>(
        `/lawyer/consultations/${id}/decline`,
        { reason }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'consultations'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'dashboard', 'stats'] });
    }
  });
}

export function useUpdateConsultationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.patch<{ success: boolean; data: Consultation }>(
        `/lawyer/consultations/${id}/status`,
        { status }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'consultations'] });
    }
  });
}

