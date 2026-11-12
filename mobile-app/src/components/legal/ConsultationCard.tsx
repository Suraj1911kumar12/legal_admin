import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, Clock, MapPin, Phone, Video } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge, BadgeTone } from '../ui/AppBadge';
import { AppAvatar } from '../ui/AppAvatar';
import { CustomerConsultation, PublicLawyer } from '@/types/customer';
import { formatCurrencyINR, formatDate } from '@/utils/formatters';

export interface ConsultationCardProps {
  consultation: CustomerConsultation;
  onPress?: () => void;
}

const statusMap: Record<
  CustomerConsultation['status'],
  { label: string; tone: BadgeTone }
> = {
  pending: { label: 'Requested', tone: 'warning' },
  accepted: { label: 'Confirmed', tone: 'success' },
  completed: { label: 'Completed', tone: 'sage' },
  cancelled: { label: 'Cancelled', tone: 'danger' }
};

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  onPress
}) => {
  const lawyer =
    typeof consultation.lawyerId === 'object' ? (consultation.lawyerId as PublicLawyer) : null;
  const matter =
    consultation.matterId && typeof consultation.matterId === 'object'
      ? consultation.matterId
      : null;

  const badge = statusMap[consultation.status] || statusMap.pending;

  const typeLabel =
    consultation.type === 'video'
      ? 'Video Call'
      : consultation.type === 'phone'
        ? 'Phone Call'
        : 'In-Person';

  const TypeIcon =
    consultation.type === 'video' ? Video : consultation.type === 'phone' ? Phone : MapPin;

  return (
    <AppCard onPress={onPress} accessibilityLabel={`Consultation ${consultation.consultationReference}`}>
      <View style={styles.topRow}>
        <View style={styles.lawyerInfo}>
          <AppAvatar name={lawyer?.fullName || 'Lawyer'} uri={lawyer?.profileImage} size={42} />
          <View style={styles.lawyerMeta}>
            <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1}>
              {lawyer?.fullName || 'Verified Lawyer'}
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary}>
              {consultation.consultationReference}
              {matter ? ` • ${matter.title}` : ''}
            </AppText>
          </View>
        </View>
        <AppBadge label={badge.label} tone={badge.tone} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Calendar size={14} color={Colors.primary} />
          <AppText variant="bodySmall" color={Colors.textPrimary}>
            {formatDate(consultation.date)}
          </AppText>
        </View>
        <View style={styles.metaChip}>
          <Clock size={14} color={Colors.primary} />
          <AppText variant="bodySmall" color={Colors.textPrimary}>
            {consultation.time} ({consultation.timeZone})
          </AppText>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.metaChip}>
          <TypeIcon size={14} color={Colors.textSecondary} />
          <AppText variant="caption" color={Colors.textSecondary}>
            {typeLabel}
          </AppText>
        </View>
        <AppText variant="label" color={Colors.primary}>
          {formatCurrencyINR(consultation.fee)}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs
  },
  lawyerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  lawyerMeta: {
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  }
});

