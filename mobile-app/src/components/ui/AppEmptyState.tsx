import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface AppEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{icon}</View>
      <AppText variant="h3" align="center" color={Colors.textPrimary} style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" align="center" color={Colors.textSecondary} style={styles.desc}>
        {description}
      </AppText>
      {actionLabel && onAction && (
        <AppButton title={actionLabel} onPress={onAction} size="md" style={styles.btn} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.border
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md
  },
  title: {
    marginBottom: Spacing.xs
  },
  desc: {
    maxWidth: 280
  },
  btn: {
    marginTop: Spacing.lg
  }
});

