import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { Colors } from '@/theme/tokens';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/ui/AppToast';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      refetchOnReconnect: true
    }
  }
});

const PUBLIC_SEGMENTS = new Set([
  'welcome',
  'onboarding',
  'login',
  'register',
  'forgot-password',
  'verify-email'
]);

function RootNavigator() {
  const { isAuthenticated, isBootstrapping, hasCompletedOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isBootstrapping) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isBootstrapping]);

  useEffect(() => {
    if (isBootstrapping) return;

    const firstSegment = segments[0] as string | undefined;
    const isPublic = firstSegment ? PUBLIC_SEGMENTS.has(firstSegment) : false;

    if (!isAuthenticated) {
      if (!isPublic) {
        router.replace(hasCompletedOnboarding ? '/welcome' : '/onboarding');
      }
      return;
    }

    if (!firstSegment || (isPublic && firstSegment !== 'verify-email')) {
      router.replace('/(tabs)/home');
    }
  }, [isBootstrapping, isAuthenticated, hasCompletedOnboarding, segments, router]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (!isAuthenticated) return;
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      const targetRoute = typeof data?.route === 'string' ? data.route : typeof data?.link === 'string' ? data.link : null;

      if (targetRoute && targetRoute.startsWith('/')) {
        router.push(targetRoute as never);
      } else {
        router.push('/notifications');
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade_from_bottom'
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="intake/new" />
      <Stack.Screen name="intake/[id]" />
      <Stack.Screen name="assistant/[sessionId]" />
      <Stack.Screen name="assistant/solutions" />
      <Stack.Screen name="documents/index" />
      <Stack.Screen name="documents/[id]" />
      <Stack.Screen name="matters/[id]" />
      <Stack.Screen name="lawyers/[id]" />
      <Stack.Screen name="consultations/index" />
      <Stack.Screen name="consultations/[id]" />
      <Stack.Screen name="messages/index" />
      <Stack.Screen name="messages/[conversationId]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background
  }
});
