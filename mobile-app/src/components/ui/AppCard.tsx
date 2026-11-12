import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, useReducedMotion } from 'react-native-reanimated';
import { Colors, Radii, Shadows, Spacing } from '@/theme/tokens';
import { MotionConfig } from '@/animations/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AppCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'sage' | 'muted' | 'highlight';
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'default',
  onPress,
  padding = Spacing.md,
  style,
  accessibilityLabel
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const cardStyle = [styles.base, variantStyles[variant], { padding }, style];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          if (!reducedMotion) scale.value = withSpring(MotionConfig.pressScale, MotionConfig.springSnappy);
        }}
        onPressOut={() => {
          if (!reducedMotion) scale.value = withSpring(1, MotionConfig.springSnappy);
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[cardStyle, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const variantStyles: Record<string, ViewStyle> = {
  default: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border
  },
  sage: {
    backgroundColor: Colors.sageLight,
    borderColor: Colors.sage
  },
  muted: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border
  },
  highlight: {
    backgroundColor: Colors.accentSoft,
    borderColor: '#F1D4C2'
  }
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    ...(Shadows.soft as object)
  }
});
