import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DocumentRecord } from '@/types/lawyer';

export function useDocumentsList(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['lawyer', 'documents', params],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: DocumentRecord[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/lawyer/documents', params);
      return res;
    }
  });
}

export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reviewStatus,
      reviewComments
    }: {
      id: string;
      reviewStatus: string;
      reviewComments?: string;
    }) => {
      const res = await apiClient.post<{ success: boolean; data: DocumentRecord }>(
        `/lawyer/documents/${id}/review`,
        { reviewStatus, reviewComments }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'dashboard', 'stats'] });
    }
  });
}

