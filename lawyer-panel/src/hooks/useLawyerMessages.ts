import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Conversation, Message } from '@/types/lawyer';

export function useConversationsList() {
  return useQuery({
    queryKey: ['lawyer', 'conversations'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Conversation[] }>(
        '/lawyer/conversations'
      );
      return res.data;
    },
    refetchInterval: 10000 // Poll every 10 seconds for real-time responsiveness
  });
}

export function useConversationMessages(id: string) {
  return useQuery({
    queryKey: ['lawyer', 'conversations', id, 'messages'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Message[] }>(
        `/lawyer/conversations/${id}/messages`
      );
      return res.data;
    },
    enabled: !!id,
    refetchInterval: 5000 // Poll every 5s inside active conversation
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      attachments
    }: {
      conversationId: string;
      content: string;
      attachments?: any[];
    }) => {
      const res = await apiClient.post<{ success: boolean; data: Message }>(
        `/lawyer/conversations/${conversationId}/messages`,
        { content, attachments }
      );
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['lawyer', 'conversations', vars.conversationId, 'messages']
      });
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'conversations'] });
    }
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.patch(`/lawyer/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer', 'conversations'] });
    }
  });
}

