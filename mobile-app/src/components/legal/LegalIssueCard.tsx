import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge, BadgeTone } from '../ui/AppBadge';
import { formatDate } from '@/utils/formatters';
import { LegalIntake } from '@/types/customer';

export interface LegalIssueCardProps {
  intake: LegalIntake;
  onPress: () => void;
}

export const LegalIssueCard: React.FC<LegalIssueCardProps> = ({ intake, onPress }) => {
  const tone: BadgeTone = intake.isDraft
    ? 'warning'
    : intake.status === 'accepted'
    ? 'success'
    : intake.status === 'declined'
    ? 'danger'
    : 'sage';

  const statusLabel = intake.isDraft
    ? 'Saved Draft'
    : intake.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <AppCard onPress={onPress} style={styles.card} accessibilityLabel={intake.summary || 'Legal issue'}>
      <View style={styles.topRow}>
        <AppBadge label={statusLabel} tone={tone} />
        <AppText variant="caption" color={Colors.textSecondary}>
          {formatDate(intake.updatedAt)}
        </AppText>
      </View>

      <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={2} style={styles.title}>
        {intake.summary || 'Untitled draft'}
      </AppText>

      <View style={styles.footer}>
        <AppText variant="caption" color={Colors.textSecondary}>
          {intake.category} • {intake.queryReference}
        </AppText>
        <ChevronRight size={16} color={Colors.textSecondary} />
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
    marginBottom: Spacing.xs
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});

