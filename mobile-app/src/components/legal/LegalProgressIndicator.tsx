import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';
import { AppProgressIndicator } from '../ui/AppProgressIndicator';

export interface LegalProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export const LegalProgressIndicator: React.FC<LegalProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitle
}) => {
  const ratio = totalSteps > 0 ? currentStep / totalSteps : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="label" color={Colors.primary}>
          Step {currentStep} of {totalSteps}
        </AppText>
        <AppText variant="caption" color={Colors.textSecondary}>
          {stepTitle}
        </AppText>
      </View>
      <AppProgressIndicator progress={ratio} height={6} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  }
});

