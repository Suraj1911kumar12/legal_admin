import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Lock, Mail, Phone, User } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppSelect } from '@/components/ui/AppSelect';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().email('Valid email address is required'),
    phone: z.string().trim().max(20, 'Phone number is too long').optional(),
    preferredLanguage: z.string().min(2),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type RegisterForm = z.infer<typeof registerSchema>;

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi (हिन्दी)', value: 'hi' },
  { label: 'Marathi (मराठी)', value: 'mr' },
  { label: 'Tamil (தமிழ்)', value: 'ta' },
  { label: 'Telugu (తెలుగు)', value: 'te' },
  { label: 'Kannada (ಕನ್ನಡ)', value: 'kn' },
  { label: 'Bengali (বাংলা)', value: 'bn' }
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      preferredLanguage: 'en',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        preferredLanguage: values.preferredLanguage
      });
      showToast('Your LegalDost account is ready', 'success');
      router.replace('/(tabs)/home');
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Could not create your account right now. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Create Account" showBack />
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
            <AppText variant="h1" color={Colors.textPrimary}>
              Get started safely
            </AppText>
            <AppText variant="body" color={Colors.textSecondary}>
              One account works across LegalDost mobile and web so your saved matters and
              documents stay synchronized.
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
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Full Name"
                  placeholder="Aarav Sharma"
                  autoCapitalize="words"
                  leftIcon={<User size={18} color={Colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Phone Number (Optional)"
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={18} color={Colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="preferredLanguage"
              render={({ field: { onChange, value } }) => (
                <AppSelect
                  label="Preferred Language"
                  value={value}
                  options={LANGUAGE_OPTIONS}
                  onSelect={onChange}
                  placeholder="Choose preferred language"
                  helperText="Used for AI guidance and interface clarity."
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Password"
                  placeholder="Minimum 8 characters"
                  isPassword
                  leftIcon={<Lock size={18} color={Colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  isPassword
                  leftIcon={<Lock size={18} color={Colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <View style={styles.langHint}>
              <Globe size={14} color={Colors.textSecondary} />
              <AppText variant="caption" color={Colors.textSecondary} style={styles.hintText}>
                By creating an account, you agree to keep your credentials private and acknowledge
                LegalDost AI offers general legal information, not legal representation.
              </AppText>
            </View>

            <AppButton
              title="Create Account"
              size="lg"
              fullWidth
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View style={styles.footerRow}>
            <AppText variant="bodySmall" color={Colors.textSecondary}>
              Already have an account?
            </AppText>
            <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
              <AppText variant="bodySmall" color={Colors.primary} weight="bold">
                Log in
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
  errorBanner: {
    backgroundColor: Colors.dangerSoft,
    borderColor: Colors.danger
  },
  form: {
    gap: Spacing.md
  },
  langHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs
  },
  hintText: {
    flex: 1
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs
  }
});

