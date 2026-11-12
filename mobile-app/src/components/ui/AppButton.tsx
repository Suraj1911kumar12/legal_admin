import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, useReducedMotion } from 'react-native-reanimated';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { MotionConfig } from '@/animations/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  style
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    if (isDisabled || reducedMotion) return;
    scale.value = withSpring(MotionConfig.pressScale, MotionConfig.springSnappy);
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSpring(1, MotionConfig.springSnappy);
  };

  const theme = variantStyles[variant];
  const sz = sizeStyles[size];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        sz.container,
        theme.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.textColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <AppText
            variant={sz.textVariant}
            color={theme.textColor}
            weight="semibold"
            numberOfLines={1}
          >
            {title}
          </AppText>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
};

const variantStyles: Record<ButtonVariant, { container: ViewStyle; textColor: string }> = {
  primary: {
    container: { backgroundColor: Colors.primary, borderWidth: 1, borderColor: Colors.primary },
    textColor: Colors.white
  },
  secondary: {
    container: { backgroundColor: Colors.sage, borderWidth: 1, borderColor: Colors.sage },
    textColor: Colors.primaryDeep
  },
  accent: {
    container: { backgroundColor: Colors.accent, borderWidth: 1, borderColor: Colors.accent },
    textColor: Colors.primaryDeep
  },
  outline: {
    container: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderStrong },
    textColor: Colors.primary
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderWidth: 0 },
    textColor: Colors.primary
  },
  danger: {
    container: { backgroundColor: Colors.danger, borderWidth: 1, borderColor: Colors.danger },
    textColor: Colors.white
  }
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; textVariant: 'bodySmall' | 'body' }> = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 38 },
    textVariant: 'bodySmall'
  },
  md: {
    container: { paddingVertical: 12, paddingHorizontal: 18, minHeight: 48 },
    textVariant: 'body'
  },
  lg: {
    container: { paddingVertical: 15, paddingHorizontal: 22, minHeight: 54 },
    textVariant: 'body'
  }
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.55
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconLeft: {
    marginRight: Spacing.xs
  },
  iconRight: {
    marginLeft: Spacing.xs
  }
});
