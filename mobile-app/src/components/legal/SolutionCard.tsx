import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Compass, FileText, ArrowRight } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AIPossibleOption } from '@/types/customer';

export interface SolutionCardProps {
  option: AIPossibleOption;
  isSelected?: boolean;
  onContinueAlone?: () => void;
  onGetLegalHelp?: () => void;
  loading?: boolean;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  option,
  isSelected = false,
  onContinueAlone,
  onGetLegalHelp,
  loading = false
}) => {
  return (
    <AppCard
      variant={isSelected ? 'sage' : 'default'}
      style={isSelected ? styles.selectedCard : undefined}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Compass size={18} color={Colors.primary} />
          <AppText variant="h3" color={Colors.textPrimary} style={styles.title}>
            {option.title}
          </AppText>
        </View>
        {isSelected ? <AppBadge label="Selected Path" tone="primary" /> : null}
      </View>

      <AppText variant="body" color={Colors.textPrimary} style={styles.explanation}>
        {option.explanation}
      </AppText>

      {option.whenRelevant ? (
        <View style={styles.block}>
          <AppText variant="label" color={Colors.primary}>
            When this path applies
          </AppText>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            {option.whenRelevant}
          </AppText>
        </View>
      ) : null}

      {option.informationNeeded && option.informationNeeded.length > 0 ? (
        <View style={styles.block}>
          <AppText variant="label" color={Colors.textPrimary}>
            Information Needed
          </AppText>
          {option.informationNeeded.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <CheckCircle2 size={14} color={Colors.success} />
              <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.bulletText}>
                {item}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {option.documentsRequired && option.documentsRequired.length > 0 ? (
        <View style={styles.block}>
          <AppText variant="label" color={Colors.textPrimary}>
            Documents Required
          </AppText>
          {option.documentsRequired.map((doc, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <FileText size={14} color={Colors.primary} />
              <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.bulletText}>
                {doc}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {option.nextStep ? (
        <View style={styles.nextStepBox}>
          <AppText variant="label" color={Colors.primary}>
            Suggested Next Step
          </AppText>
          <AppText variant="bodySmall" color={Colors.textPrimary}>
            {option.nextStep}
          </AppText>
        </View>
      ) : null}

      {option.limitations ? (
        <View style={styles.limitationBox}>
          <AlertTriangle size={14} color="#9A6B22" />
          <AppText variant="caption" color="#7B5416" style={styles.limitationText}>
            Limitations: {option.limitations}
          </AppText>
        </View>
      ) : null}

      {option.sources && option.sources.length > 0 ? (
        <View style={styles.sourcesRow}>
          {option.sources.map((src, idx) => (
            <AppBadge key={idx} label={src} tone="neutral" />
          ))}
        </View>
      ) : null}

      {(onContinueAlone || onGetLegalHelp) && (
        <View style={styles.actions}>
          {onContinueAlone ? (
            <AppButton
              title="Continue on My Own"
              variant="outline"
              size="sm"
              onPress={onContinueAlone}
              disabled={loading}
              style={styles.actionBtn}
            />
          ) : null}
          {onGetLegalHelp ? (
            <AppButton
              title="Get Legal Help"
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight size={14} color={Colors.white} />}
              onPress={onGetLegalHelp}
              disabled={loading}
              style={styles.actionBtn}
            />
          ) : null}
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 1.5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: Spacing.xs
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  title: {
    flex: 1
  },
  explanation: {
    marginBottom: Spacing.sm
  },
  block: {
    marginTop: Spacing.xs,
    gap: 4
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: 2
  },
  bulletText: {
    flex: 1
  },
  nextStepBox: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.sageLight,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    gap: 4
  },
  limitationBox: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.warningSoft,
    borderRadius: Radii.sm,
    padding: Spacing.xs
  },
  limitationText: {
    flex: 1
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md
  },
  actionBtn: {
    flex: 1
  }
});

