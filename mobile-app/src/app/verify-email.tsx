import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, MailCheck } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/AppToast';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customer, isAuthenticated, refreshCustomer } = useAuth();
  const { showToast } = useToast();

  const handleRefreshStatus = async () => {
    await refreshCustomer();
    showToast(
      customer?.isEmailVerified
        ? 'Your email is verified'
        : 'Checked your verification status',
      'info'
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Email Verification" showBack />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <AppCard variant="sage" style={styles.card}>
          <View style={styles.iconCircle}>
            {customer?.isEmailVerified ? (
              <CheckCircle2 size={28} color={Colors.success} />
            ) : (
              <MailCheck size={28} color={Colors.primary} />
            )}
          </View>
          <AppText variant="h2" color={Colors.textPrimary} align="center">
            {customer?.isEmailVerified ? 'Email Verified' : 'Email Verification Status'}
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} align="center">
            {customer?.isEmailVerified
              ? `Your email (${customer.email}) has been verified.`
              : `Account email: ${customer?.email || 'Not signed in'}. Email verification links depend on server email delivery being enabled. You can continue using LegalDost normally while your account is active.`}
          </AppText>
        </AppCard>

        {isAuthenticated ? (
          <View style={styles.actions}>
            <AppButton
              title="Refresh Status"
              variant="outline"
              fullWidth
              onPress={handleRefreshStatus}
            />
            <AppButton
              title="Go to Home"
              fullWidth
              onPress={() => router.replace('/(tabs)/home')}
            />
          </View>
        ) : (
          <AppButton title="Back to Login" fullWidth onPress={() => router.replace('/login')} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg
  },
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actions: {
    gap: Spacing.sm
  }
});

