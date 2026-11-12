import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, onSessionExpired } from '@/services/api/apiClient';
import { secureStorage } from '@/services/storage/secureStorage';
import { localPreferences } from '@/services/storage/localStorage';
import { CustomerProfile } from '@/types/customer';
import { triggerHaptic } from '@/utils/haptics';

interface AuthContextValue {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<CustomerProfile>;
  register: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    preferredLanguage?: string;
  }) => Promise<CustomerProfile>;
  logout: (pushToken?: string | null) => Promise<void>;
  refreshCustomer: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const onboardingDone = await localPreferences.hasCompletedOnboarding();
      setHasCompletedOnboarding(onboardingDone);

      const accessToken = await secureStorage.getAccessToken();
      const refreshToken = await secureStorage.getRefreshToken();

      if (accessToken || refreshToken) {
        const res = await apiClient.get<CustomerProfile>('/customer/auth/me');
        setCustomer(res.data);
      } else {
        setCustomer(null);
      }
    } catch {
      await secureStorage.clearTokens();
      setCustomer(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setCustomer(null);
      queryClient.clear();
    });
    return unsubscribe;
  }, [queryClient]);

  const login = async (email: string, password: string): Promise<CustomerProfile> => {
    const res = await apiClient.post<{
      customer: CustomerProfile;
      accessToken: string;
      refreshToken: string;
    }>(
      '/customer/auth/login',
      { email, password, deviceInfo: `${Platform.OS}-mobile` },
      { skipAuth: true }
    );

    await secureStorage.saveTokens(res.data.accessToken, res.data.refreshToken);
    setCustomer(res.data.customer);
    queryClient.clear();
    await triggerHaptic.success();
    return res.data.customer;
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    preferredLanguage?: string;
  }): Promise<CustomerProfile> => {
    const res = await apiClient.post<{
      customer: CustomerProfile;
      accessToken: string;
      refreshToken: string;
    }>(
      '/customer/auth/register',
      { ...payload, deviceInfo: `${Platform.OS}-mobile` },
      { skipAuth: true }
    );

    await secureStorage.saveTokens(res.data.accessToken, res.data.refreshToken);
    setCustomer(res.data.customer);
    queryClient.clear();
    await triggerHaptic.success();
    return res.data.customer;
  };

  const logout = async (pushToken?: string | null): Promise<void> => {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      await apiClient.post('/customer/auth/logout', {
        refreshToken: refreshToken || undefined,
        pushToken: pushToken || undefined
      });
    } catch {
      // Clear local session even if server unreachable
    } finally {
      await secureStorage.clearTokens();
      setCustomer(null);
      queryClient.clear();
      await triggerHaptic.lightImpact();
    }
  };

  const refreshCustomer = async () => {
    try {
      const res = await apiClient.get<CustomerProfile>('/customer/auth/me');
      setCustomer(res.data);
    } catch {
      // ignore
    }
  };

  const completeOnboarding = async () => {
    await localPreferences.setOnboardingCompleted(true);
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = async () => {
    await localPreferences.setOnboardingCompleted(false);
    setHasCompletedOnboarding(false);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isBootstrapping,
        hasCompletedOnboarding,
        login,
        register,
        logout,
        refreshCustomer,
        completeOnboarding,
        resetOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
