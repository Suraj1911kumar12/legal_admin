import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AppNotification } from '@/types/lawyer';

export function useNotificationsList() {
  return useQuery({
    queryKey: ['lawyer', 'notifications'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: AppNotification[] }>(
        '/lawyer/notifications'
      );
      return res.data;
    },
    refetchInterval: 15000 // Poll notifications every 15s
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/lawyer/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'notifications'] });
    }
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/lawyer/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'notifications'] });
    }
  });
}

