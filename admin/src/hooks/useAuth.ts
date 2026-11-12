import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Admin, AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch current admin profile
  const {
    data: admin,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: Admin }>('/auth/me');
        return res.data;
      } catch (err: any) {
        if (err.statusCode === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.admin);
      router.push('/dashboard');
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      router.push('/login');
    }
  });

  return {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    isError,
    error,
    refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending
  };
}

