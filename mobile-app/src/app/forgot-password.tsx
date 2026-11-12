import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyRound, Lock, Mail } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { apiClient, ApiClientError } from '@/services/api/apiClient';
import { useToast } from '@/components/ui/AppToast';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestReset = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<{ message: string; resetToken?: string }>(
        '/customer/auth/forgot-password',
        { email: trimmedEmail },
        { skipAuth: true }
      );
      setInfoMessage(
        res.data?.message ||
          'If an account exists for this email, password reset instructions have been issued.'
      );
      // Note: backend only issues dev token explicitly if configured; never fabricate one client-side
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      setStep('reset');
    } catch (err) {
      setErrorMessage(
        err instanceof ApiClientError ? err.message : 'Unable to send reset request.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    setErrorMessage(null);
    if (!resetToken.trim()) {
      setErrorMessage('Please enter the reset token sent to your email.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(
        '/customer/auth/reset-password',
        { email: email.trim(), resetToken: resetToken.trim(), newPassword },
        { skipAuth: true }
      );
      showToast('Password updated. Please log in.', 'success');
      router.replace('/login');
    } catch (err) {
      setErrorMessage(
        err instanceof ApiClientError ? err.message : 'Invalid or expired reset token.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Reset Password" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="h2" color={Colors.textPrimary}>
            {step === 'request' ? 'Recover account access' : 'Enter reset token'}
          </AppText>
          <AppText variant="body" color={Colors.textSecondary}>
            {step === 'request'
              ? 'Enter the email address associated with your LegalDost account.'
              : 'Enter the verification reset token and choose a new password (minimum 8 characters).'}
          </AppText>

          {infoMessage ? (
            <AppCard variant="sage">
              <AppText variant="bodySmall" color={Colors.primary}>
                {infoMessage}
              </AppText>
            </AppCard>
          ) : null}

          {errorMessage ? (
            <AppCard variant="muted" style={styles.errorBanner}>
              <AppText variant="bodySmall" color={Colors.danger} weight="medium">
                {errorMessage}
              </AppText>
            </AppCard>
          ) : null}

          <View style={styles.form}>
            <AppInput
              label="Registered Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={step === 'request'}
              leftIcon={<Mail size={18} color={Colors.textSecondary} />}
              value={email}
              onChangeText={setEmail}
            />

            {step === 'reset' ? (
              <>
                <AppInput
                  label="Reset Token"
                  placeholder="Paste your reset token"
                  autoCapitalize="none"
                  leftIcon={<KeyRound size={18} color={Colors.textSecondary} />}
                  value={resetToken}
                  onChangeText={setResetToken}
                />
                <AppInput
                  label="New Password"
                  placeholder="Minimum 8 characters"
                  isPassword
                  leftIcon={<Lock size={18} color={Colors.textSecondary} />}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </>
            ) : null}

            <AppButton
              title={step === 'request' ? 'Request Password Reset' : 'Update Password'}
              size="lg"
              fullWidth
              loading={loading}
              onPress={step === 'request' ? handleRequestReset : handleConfirmReset}
            />

            {step === 'reset' ? (
              <AppButton
                title="Change Email"
                variant="ghost"
                onPress={() => {
                  setStep('request');
                  setErrorMessage(null);
                }}
              />
            ) : null}
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
  container: {
    padding: Spacing.lg,
    gap: Spacing.md
  },
  errorBanner: {
    backgroundColor: Colors.dangerSoft,
    borderColor: Colors.danger
  },
  form: {
    gap: Spacing.md,
    marginTop: Spacing.xs
  }
});

