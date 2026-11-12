import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CustomerQuery, DashboardStats } from '@/types/lawyer';

export function useLawyerDashboardStats() {
  return useQuery({
    queryKey: ['lawyer', 'dashboard', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: DashboardStats }>(
        '/lawyer/dashboard/stats'
      );
      return res.data;
    }
  });
}

export function useQueriesList(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['lawyer', 'queries', params],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: CustomerQuery[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/lawyer/queries', params);
      return res;
    }
  });
}

export function useQueryDetails(id: string) {
  return useQuery({
    queryKey: ['lawyer', 'queries', id],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CustomerQuery }>(
        `/lawyer/queries/${id}`
      );
      return res.data;
    },
    enabled: !!id
  });
}

export function useAcceptQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{
        success: boolean;
        message: string;
        data: { query: CustomerQuery; matter: any };
      }>(`/lawyer/queries/${id}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'queries'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'matters'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'dashboard', 'stats'] });
    }
  });
}

export function useDeclineQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.post<{ success: boolean; data: CustomerQuery }>(
        `/lawyer/queries/${id}/decline`,
        { reason }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'queries'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'dashboard', 'stats'] });
    }
  });
}

