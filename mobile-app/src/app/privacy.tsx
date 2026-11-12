import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppTextArea } from '@/components/ui/AppTextArea';
import { useAuth } from '@/features/auth/AuthContext';
import { apiClient, ApiClientError } from '@/services/api/apiClient';
import { useToast } from '@/components/ui/AppToast';
import { formatDateTime } from '@/utils/formatters';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { customer, refreshCustomer } = useAuth();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestDeletion = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/customer/auth/deletion-request', {
        reason: reason.trim() || undefined
      });
      await refreshCustomer();
      setModalOpen(false);
      showToast('Account deletion request recorded', 'info');
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Unable to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Privacy & Data Control" showBack />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppCard variant="sage" style={styles.card}>
          <View style={styles.titleRow}>
            <ShieldCheck size={20} color={Colors.primary} />
            <AppText variant="h3" color={Colors.textPrimary}>
              How Your Legal Data Is Protected
            </AppText>
          </View>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            • Documents you upload are stored in private server storage and downloaded only after
            verifying your authenticated session.
          </AppText>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            • Authentication tokens and offline problem drafts are stored securely inside encrypted
            device SecureStore.
          </AppText>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            • Matter summaries are shared with a lawyer only when you explicitly submit a matter or
            enable sharing in a conversation.
          </AppText>
        </AppCard>

        <AppCard style={styles.card}>
          <View style={styles.titleRow}>
            <Lock size={18} color={Colors.primary} />
            <AppText variant="h3" color={Colors.textPrimary}>
              Record Retention Disclosure
            </AppText>
          </View>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            When you request account deletion, LegalDost schedules removal of personal profile data
            while preserving records that must legally be retained for active consultations, billing
            compliance, or statutory obligations.
          </AppText>
        </AppCard>

        {customer?.deletionRequestedAt ? (
          <AppCard variant="muted" style={styles.pendingBanner}>
            <View style={styles.titleRow}>
              <AlertTriangle size={18} color="#9A6B22" />
              <AppText variant="subtitle" color="#7B5416">
                Deletion Request Already Submitted
              </AppText>
            </View>
            <AppText variant="bodySmall" color="#7B5416">
              Recorded on {formatDateTime(customer.deletionRequestedAt)}. Our compliance team will
              process eligible data removal while retaining legally mandated records.
            </AppText>
          </AppCard>
        ) : (
          <AppButton
            title="Request Account Deletion"
            variant="danger"
            onPress={() => setModalOpen(true)}
          />
        )}
      </ScrollView>

      <AppModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Account Deletion"
      >
        <View style={styles.modalBody}>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            This sends an account deletion request for {customer?.email}. Active legal records
            subject to legal retention laws may be archived rather than immediately purged.
          </AppText>
          <AppTextArea
            label="Reason (Optional)"
            placeholder="Let us know why you are leaving..."
            value={reason}
            onChangeText={setReason}
            minHeight={84}
          />
          <View style={styles.modalActions}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => setModalOpen(false)}
              style={styles.flexOne}
            />
            <AppButton
              title="Submit Request"
              variant="danger"
              loading={submitting}
              onPress={handleRequestDeletion}
              style={styles.flexOne}
            />
          </View>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg
  },
  card: {
    gap: Spacing.sm
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  pendingBanner: {
    backgroundColor: Colors.warningSoft,
    borderColor: Colors.warning,
    gap: Spacing.xs
  },
  modalBody: {
    gap: Spacing.md
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  flexOne: {
    flex: 1
  }
});

