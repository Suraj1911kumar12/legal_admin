import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppLoaderProps {
  message?: string;
  label?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  message,
  label,
  size = 'large',
  fullScreen = false
}) => {
  const displayText = message || label;
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {displayText && (
        <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.text}>
          {displayText}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  text: {
    marginTop: Spacing.sm
  }
});
