import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, useReducedMotion } from 'react-native-reanimated';
import { Colors, Radii } from '@/theme/tokens';
import { MotionConfig } from '@/animations/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'default' | 'filled' | 'sage' | 'ghost';
  size?: number;
  disabled?: boolean;
  badgeCount?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'default',
  size = 42,
  disabled = false,
  badgeCount = 0,
  style
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        if (!disabled && !reducedMotion) scale.value = withSpring(0.92, MotionConfig.springSnappy);
      }}
      onPressOut={() => {
        if (!reducedMotion) scale.value = withSpring(1, MotionConfig.springSnappy);
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: Radii.md },
        variantMap[variant],
        disabled && styles.disabled,
        animatedStyle,
        style
      ]}
    >
      {icon}
      {badgeCount > 0 && <View style={styles.dot} />}
    </AnimatedPressable>
  );
};

const variantMap: Record<string, ViewStyle> = {
  default: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filled: { backgroundColor: Colors.primary },
  sage: { backgroundColor: Colors.sage },
  ghost: { backgroundColor: 'transparent' }
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  disabled: {
    opacity: 0.5
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.surface
  }
});
