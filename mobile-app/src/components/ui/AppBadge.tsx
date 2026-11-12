import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

export type BadgeTone = 'neutral' | 'sage' | 'accent' | 'success' | 'warning' | 'danger' | 'primary';

export interface AppBadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({ label, tone = 'neutral', icon, style }) => {
  const palette = badgePalettes[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <AppText variant="caption" color={palette.text} weight="semibold" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
};

const badgePalettes: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  neutral: { bg: Colors.surfaceMuted, text: Colors.textSecondary, border: Colors.border },
  sage: { bg: Colors.sageLight, text: Colors.primary, border: Colors.sage },
  accent: { bg: Colors.accentSoft, text: Colors.primaryDeep, border: '#F0CBB4' },
  success: { bg: Colors.successSoft, text: Colors.success, border: '#CBE7D8' },
  warning: { bg: Colors.warningSoft, text: '#9A6B22', border: '#F0D7AE' },
  danger: { bg: Colors.dangerSoft, text: Colors.danger, border: '#ECC6C4' },
  primary: { bg: Colors.primary, text: Colors.white, border: Colors.primary }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1
  },
  icon: {
    marginRight: 4
  }
});
