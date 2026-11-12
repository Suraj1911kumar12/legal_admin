import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Calendar, Clock, ExternalLink, MapPin, Phone, Video } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { useCancelConsultation, useConsultationDetail } from '@/hooks/useCustomerQueries';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';
import { formatCurrencyINR, formatDate } from '@/utils/formatters';
import { PublicLawyer } from '@/types/customer';

export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data: consultation, isLoading, isError, refetch } = useConsultationDetail(id || '');
  const cancelMutation = useCancelConsultation();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const lawyer =
    consultation && typeof consultation.lawyerId === 'object'
      ? (consultation.lawyerId as PublicLawyer)
      : null;

  const handleConfirmCancel = async () => {
    if (!consultation) return;
    try {
      await cancelMutation.mutateAsync(consultation._id);
      setCancelModalOpen(false);
      showToast('Consultation cancelled', 'info');
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Unable to cancel', 'error');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={consultation?.consultationReference || 'Consultation'}
        showBack
      />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading consultation..." />
        </View>
      ) : isError || !consultation ? (
        <View style={styles.center}>
          <AppErrorState title="Consultation not found" onRetry={() => refetch()} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxl }
          ]}
        >
          <AppCard variant="sage" style={styles.card}>
            <View style={styles.rowBetween}>
              <AppBadge
                label={
                  consultation.status === 'pending'
                    ? 'Pending Lawyer Confirmation'
                    : consultation.status === 'accepted'
                      ? 'Confirmed'
                      : consultation.status.toUpperCase()
                }
                tone={
                  consultation.status === 'accepted'
                    ? 'success'
                    : consultation.status === 'cancelled'
                      ? 'danger'
                      : 'warning'
                }
              />
              <AppText variant="subtitle" color={Colors.primary}>
                {formatCurrencyINR(consultation.fee)}
              </AppText>
            </View>

            <AppText variant="h2" color={Colors.textPrimary}>
              {lawyer?.fullName || 'Verified Lawyer'}
            </AppText>
            {lawyer ? (
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                {lawyer.city}, {lawyer.state} • {lawyer.barCouncil}
              </AppText>
            ) : null}

            <View style={styles.metaList}>
              <View style={styles.metaRow}>
                <Calendar size={16} color={Colors.primary} />
                <AppText variant="body" color={Colors.textPrimary}>
                  {formatDate(consultation.date)}
                </AppText>
              </View>
              <View style={styles.metaRow}>
                <Clock size={16} color={Colors.primary} />
                <AppText variant="body" color={Colors.textPrimary}>
                  {consultation.time} ({consultation.timeZone})
                </AppText>
              </View>
              <View style={styles.metaRow}>
                {consultation.type === 'video' ? (
                  <Video size={16} color={Colors.primary} />
                ) : consultation.type === 'phone' ? (
                  <Phone size={16} color={Colors.primary} />
                ) : (
                  <MapPin size={16} color={Colors.primary} />
                )}
                <AppText variant="body" color={Colors.textPrimary}>
                  {consultation.type === 'video'
                    ? 'Video Consultation'
                    : consultation.type === 'phone'
                      ? 'Phone Consultation'
                      : 'In-Person Consultation'}
                </AppText>
              </View>
            </View>
          </AppCard>

          {consultation.meetingLink && consultation.status === 'accepted' ? (
            <AppCard style={styles.card}>
              <AppText variant="subtitle" color={Colors.textPrimary}>
                Meeting Link Ready
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                {consultation.meetingLink}
              </AppText>
              <AppButton
                title="Open Meeting Link"
                rightIcon={<ExternalLink size={16} color={Colors.white} />}
                onPress={() => WebBrowser.openBrowserAsync(consultation.meetingLink!)}
              />
            </AppCard>
          ) : null}

          {consultation.location ? (
            <AppCard style={styles.card}>
              <AppText variant="subtitle" color={Colors.textPrimary}>
                Office Location
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                {consultation.location}
              </AppText>
            </AppCard>
          ) : null}

          {consultation.notes ? (
            <AppCard style={styles.card}>
              <AppText variant="label" color={Colors.primary}>
                Your Notes
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                {consultation.notes}
              </AppText>
            </AppCard>
          ) : null}

          {consultation.declineReason ? (
            <AppCard variant="muted" style={styles.declineCard}>
              <AppText variant="label" color={Colors.danger}>
                Cancellation / Decline Note
              </AppText>
              <AppText variant="bodySmall" color={Colors.textPrimary}>
                {consultation.declineReason}
              </AppText>
            </AppCard>
          ) : null}

          {lawyer ? (
            <AppButton
              title="View Advocate Profile"
              variant="outline"
              onPress={() => router.push(`/lawyers/${lawyer._id}` as never)}
            />
          ) : null}

          {consultation.status === 'pending' || consultation.status === 'accepted' ? (
            <AppButton
              title="Cancel Consultation"
              variant="danger"
              onPress={() => setCancelModalOpen(true)}
            />
          ) : null}
        </ScrollView>
      )}

      <AppModal
        visible={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel this consultation?"
      >
        <View style={styles.modalBody}>
          <AppText variant="body" color={Colors.textSecondary}>
            The lawyer will be notified that this requested slot is cancelled.
          </AppText>
          <View style={styles.modalActions}>
            <AppButton
              title="Keep Slot"
              variant="outline"
              onPress={() => setCancelModalOpen(false)}
              style={styles.flexOne}
            />
            <AppButton
              title="Confirm Cancel"
              variant="danger"
              loading={cancelMutation.isPending}
              onPress={handleConfirmCancel}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md
  },
  card: {
    gap: Spacing.sm
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  metaList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  declineCard: {
    backgroundColor: Colors.dangerSoft,
    borderColor: Colors.danger,
    gap: 4
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

