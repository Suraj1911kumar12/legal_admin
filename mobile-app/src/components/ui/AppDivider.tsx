import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/theme/tokens';

export interface AppDividerProps {
  verticalSpacing?: number;
  style?: ViewStyle;
}

export const AppDivider: React.FC<AppDividerProps> = ({ verticalSpacing = Spacing.sm, style }) => {
  return <View style={[styles.divider, { marginVertical: verticalSpacing }, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    width: '100%'
  }
});
