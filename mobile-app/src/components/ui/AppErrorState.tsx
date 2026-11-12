import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const AppErrorState: React.FC<AppErrorStateProps> = ({
  title = 'Unable to load right now',
  message = 'Please check your connection and try again.',
  onRetry
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AlertTriangle size={26} color={Colors.danger} />
      </View>
      <AppText variant="h3" align="center" color={Colors.textPrimary} style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" align="center" color={Colors.textSecondary} style={styles.desc}>
        {message}
      </AppText>
      {onRetry && (
        <AppButton
          title="Try Again"
          variant="outline"
          size="sm"
          onPress={onRetry}
          leftIcon={<RefreshCw size={16} color={Colors.primary} />}
          style={styles.btn}
        />
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm
  },
  title: {
    marginBottom: 4
  },
  desc: {
    maxWidth: 280
  },
  btn: {
    marginTop: Spacing.md
  }
});

