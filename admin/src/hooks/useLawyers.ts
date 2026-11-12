import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Lawyer,
  LawyerListResponse,
  DashboardStats,
  VerificationStatus,
  AccountStatus
} from '@/types/lawyer';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: DashboardStats }>(
        '/admin/dashboard/stats'
      );
      return res.data;
    }
  });
}

export function useLawyersList(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['lawyers', 'list', params],
    queryFn: async () => {
      const res = await apiClient.get<LawyerListResponse>('/admin/lawyers', params);
      return res;
    }
  });
}

export function useLawyerDetails(id: string) {
  return useQuery({
    queryKey: ['lawyers', 'detail', id],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Lawyer }>(
        `/admin/lawyers/${id}`
      );
      return res.data;
    },
    enabled: !!id
  });
}

export function useCreateLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post<{ success: boolean; data: Lawyer }>(
        '/admin/lawyers',
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    }
  });
}

export function useUpdateLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.patch<{ success: boolean; data: Lawyer }>(
        `/admin/lawyers/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
      queryClient.setQueryData(['lawyers', 'detail', updated._id], updated);
    }
  });
}

export function useUpdateVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      verificationNotes,
      rejectionReason
    }: {
      id: string;
      status: VerificationStatus;
      verificationNotes?: string;
      rejectionReason?: string;
    }) => {
      const res = await apiClient.patch<{ success: boolean; data: Lawyer }>(
        `/admin/lawyers/${id}/verification`,
        { status, verificationNotes, rejectionReason }
      );
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.setQueryData(['lawyers', 'detail', updated._id], updated);
    }
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      reason
    }: {
      id: string;
      status: AccountStatus;
      reason?: string;
    }) => {
      const res = await apiClient.patch<{ success: boolean; data: Lawyer }>(
        `/admin/lawyers/${id}/status`,
        { status, reason }
      );
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.setQueryData(['lawyers', 'detail', updated._id], updated);
    }
  });
}

export function useDeleteLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<{ success: boolean; message: string }>(
        `/admin/lawyers/${id}`
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    }
  });
}

