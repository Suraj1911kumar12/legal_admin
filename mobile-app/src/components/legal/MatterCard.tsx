import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Briefcase, ChevronRight, UserCheck } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge, BadgeTone } from '../ui/AppBadge';
import { CustomerMatter, PublicLawyer } from '@/types/customer';
import { formatDate } from '@/utils/formatters';

export interface MatterCardProps {
  matter: CustomerMatter;
  onPress: () => void;
}

export const MatterCard: React.FC<MatterCardProps> = ({ matter, onPress }) => {
  const toneMap: Record<string, BadgeTone> = {
    intake: 'sage',
    active: 'success',
    pending_court: 'warning',
    under_negotiation: 'accent',
    resolved: 'primary',
    closed: 'neutral'
  };

  const assignedLawyer =
    matter.lawyerId && typeof matter.lawyerId === 'object'
      ? (matter.lawyerId as PublicLawyer)
      : null;

  const lastUpdate =
    matter.clientUpdates && matter.clientUpdates.length > 0
      ? matter.clientUpdates[matter.clientUpdates.length - 1]
      : null;

  return (
    <AppCard onPress={onPress} style={styles.card} accessibilityLabel={matter.title}>
      <View style={styles.topRow}>
        <AppBadge
          label={matter.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          tone={toneMap[matter.status] || 'neutral'}
        />
        <AppText variant="caption" color={Colors.textSecondary}>
          {formatDate(matter.createdAt)}
        </AppText>
      </View>

      <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={2} style={styles.title}>
        {matter.title}
      </AppText>

      <View style={styles.metaRow}>
        <Briefcase size={14} color={Colors.textSecondary} />
        <AppText variant="caption" color={Colors.textSecondary} style={styles.metaText}>
          {matter.category} • {matter.matterReference}
        </AppText>
      </View>

      {assignedLawyer && (
        <View style={styles.lawyerRow}>
          <UserCheck size={14} color={Colors.primary} />
          <AppText variant="caption" color={Colors.primary} weight="medium" style={styles.metaText}>
            Adv. {assignedLawyer.fullName}
          </AppText>
        </View>
      )}

      {lastUpdate && (
        <View style={styles.activityBox}>
          <AppText variant="caption" color={Colors.textPrimary} numberOfLines={2}>
            <AppText variant="caption" weight="semibold" color={Colors.primary}>
              Latest update:{' '}
            </AppText>
            {lastUpdate.title} — {lastUpdate.message}
          </AppText>
        </View>
      )}

      <View style={styles.footer}>
        <AppText variant="caption" weight="semibold" color={Colors.primary}>
          Open Matter Workspace
        </AppText>
        <ChevronRight size={16} color={Colors.primary} />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs
  },
  title: {
    marginBottom: 6
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  lawyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  metaText: {
    marginLeft: 6
  },
  activityBox: {
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.xs + 2,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm
  }
});

