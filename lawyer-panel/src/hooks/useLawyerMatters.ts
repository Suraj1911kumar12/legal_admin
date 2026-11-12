import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LegalMatter } from '@/types/lawyer';

export function useMattersList(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['lawyer', 'matters', params],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: LegalMatter[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/lawyer/matters', params);
      return res;
    }
  });
}

export function useMatterDetails(id: string) {
  return useQuery({
    queryKey: ['lawyer', 'matters', id],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: LegalMatter }>(
        `/lawyer/matters/${id}`
      );
      return res.data;
    },
    enabled: !!id
  });
}

export function useUpdateMatterStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.patch<{ success: boolean; data: LegalMatter }>(
        `/lawyer/matters/${id}/status`,
        { status }
      );
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'matters'] });
      queryClient.setQueryData(['lawyer', 'matters', updated._id], updated);
    }
  });
}

export function useAddInternalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(
        `/lawyer/matters/${id}/notes`,
        { content }
      );
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'matters', vars.id] });
    }
  });
}

export function useAddClientUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      message,
      isShared
    }: {
      id: string;
      title: string;
      message: string;
      isShared?: boolean;
    }) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(
        `/lawyer/matters/${id}/updates`,
        { title, message, isShared }
      );
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'matters', vars.id] });
    }
  });
}

export function useAddMatterTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, dueDate }: { id: string; title: string; dueDate?: string }) => {
      const res = await apiClient.post<{ success: boolean; data: any }>(
        `/lawyer/matters/${id}/tasks`,
        { title, dueDate }
      );
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'matters', vars.id] });
    }
  });
}

export function useToggleMatterTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      const res = await apiClient.patch<{ success: boolean; data: any }>(
        `/lawyer/matters/${id}/tasks/${taskId}`
      );
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'matters', vars.id] });
    }
  });
}

