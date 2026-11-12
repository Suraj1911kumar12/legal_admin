import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle2, FileText } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge } from '../ui/AppBadge';
import { LegalIntake } from '@/types/customer';

export interface IntakeSummaryCardProps {
  intake: LegalIntake;
}

export const IntakeSummaryCard: React.FC<IntakeSummaryCardProps> = ({ intake }) => {
  return (
    <AppCard variant="sage" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FileText size={16} color={Colors.primary} />
          <AppText variant="subtitle" color={Colors.primaryDeep} style={styles.title}>
            Problem Summary
          </AppText>
        </View>
        <AppBadge label={intake.category} tone="primary" />
      </View>

      <AppText variant="body" color={Colors.textPrimary} style={styles.summary}>
        {intake.summary}
      </AppText>

      {intake.intakeSummary?.confirmedFacts && intake.intakeSummary.confirmedFacts.length > 0 && (
        <View style={styles.factsBox}>
          <AppText variant="label" color={Colors.primaryDeep} style={styles.factsTitle}>
            Key Facts Captured
          </AppText>
          {intake.intakeSummary.confirmedFacts.map((fact, idx) => (
            <View key={idx} style={styles.factRow}>
              <CheckCircle2 size={14} color={Colors.success} />
              <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.factText}>
                {fact}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    marginLeft: 6
  },
  summary: {
    marginBottom: Spacing.xs
  },
  factsBox: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#C5D9CB'
  },
  factsTitle: {
    marginBottom: 4
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4
  },
  factText: {
    flex: 1,
    marginLeft: 6
  }
});

