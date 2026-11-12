import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Scale } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      showToast('Welcome back to LegalDost', 'success');
      router.replace('/(tabs)/home');
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to sign in right now. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Log In" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <View style={styles.badgeIcon}>
              <Scale size={20} color={Colors.primary} />
            </View>
            <AppText variant="h1" color={Colors.textPrimary}>
              Welcome back
            </AppText>
            <AppText variant="body" color={Colors.textSecondary}>
              Sign in with your LegalDost customer account to access your matters, documents, and
              consultations.
            </AppText>
          </View>

          {serverError ? (
            <AppCard variant="muted" style={styles.errorBanner}>
              <AppText variant="bodySmall" color={Colors.danger} weight="medium">
                {serverError}
              </AppText>
            </AppCard>
          ) : null}

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Mail size={18} color={Colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  autoComplete="password"
                  leftIcon={<Lock size={18} color={Colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotLink}>
              <AppText variant="bodySmall" color={Colors.primary} weight="semibold">
                Forgot password?
              </AppText>
            </Pressable>

            <AppButton
              title="Log In"
              size="lg"
              fullWidth
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View style={styles.footerRow}>
            <AppText variant="bodySmall" color={Colors.textSecondary}>
              New to LegalDost?
            </AppText>
            <Pressable onPress={() => router.replace('/register')} hitSlop={8}>
              <AppText variant="bodySmall" color={Colors.primary} weight="bold">
                Create an account
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  flex: {
    flex: 1
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg
  },
  intro: {
    gap: Spacing.xs
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs
  },
  errorBanner: {
    backgroundColor: Colors.dangerSoft,
    borderColor: Colors.danger
  },
  form: {
    gap: Spacing.md
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm
  }
});

