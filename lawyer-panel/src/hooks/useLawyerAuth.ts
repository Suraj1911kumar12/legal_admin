import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LawyerProfile } from '@/types/lawyer';
import { useRouter } from 'next/navigation';

export function useLawyerAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: lawyer,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['lawyer', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: LawyerProfile }>('/lawyer/auth/me');
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

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post<{ success: boolean; data: { lawyer: LawyerProfile; token: string } }>(
        '/lawyer/auth/login',
        credentials
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['lawyer', 'me'], data.lawyer);
      if (data.lawyer.verificationStatus === 'verified') {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post<{ success: boolean; data: { lawyer: LawyerProfile; token: string } }>(
        '/lawyer/auth/register',
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['lawyer', 'me'], data.lawyer);
      router.push('/onboarding');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/lawyer/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['lawyer', 'me'], null);
      queryClient.clear();
      router.push('/login');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.patch<{ success: boolean; data: LawyerProfile }>(
        '/lawyer/profile',
        payload
      );
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['lawyer', 'me'], updated);
    }
  });

  return {
    lawyer,
    isAuthenticated: !!lawyer,
    isVerified: lawyer?.verificationStatus === 'verified',
    isLoading,
    isError,
    error,
    refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending
  };
}

