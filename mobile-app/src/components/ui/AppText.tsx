import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/theme/tokens';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = Colors.textPrimary,
  weight,
  align,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles[variant],
        { color },
        weight ? { fontWeight: weightMap[weight] } : undefined,
        align ? { textAlign: align } : undefined,
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const weightMap = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const
};

const styles = StyleSheet.create({
  display: {
    fontSize: Typography.size.display,
    lineHeight: Typography.lineHeight.display,
    fontWeight: '700',
    letterSpacing: -0.5
  },
  h1: {
    fontSize: Typography.size.xxl,
    lineHeight: Typography.lineHeight.xxl,
    fontWeight: '700',
    letterSpacing: -0.4
  },
  h2: {
    fontSize: Typography.size.xl,
    lineHeight: Typography.lineHeight.xl,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  h3: {
    fontSize: Typography.size.lg,
    lineHeight: Typography.lineHeight.lg,
    fontWeight: '600'
  },
  subtitle: {
    fontSize: Typography.size.base,
    lineHeight: Typography.lineHeight.base,
    fontWeight: '600'
  },
  body: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: '400'
  },
  bodySmall: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: '400'
  },
  caption: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    fontWeight: '400'
  },
  label: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});
