import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Colors, Radii } from '@/theme/tokens';

export interface AppSkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const AppSkeleton: React.FC<AppSkeletonProps> = ({
  width = '100%',
  height = 18,
  borderRadius = Radii.sm,
  style
}) => {
  const opacity = useSharedValue(0.65);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 750 }), withTiming(0.8, { duration: 750 })),
      -1,
      false
    );
  }, [opacity, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, borderRadius },
        animStyle,
        style
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <AppSkeleton width="42%" height={14} />
    <AppSkeleton width="88%" height={18} />
    <AppSkeleton width="72%" height={14} />
  </View>
);

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#E1DED3'
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: 16,
    gap: 10
  }
});
