import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useReducedMotion
} from 'react-native-reanimated';
import { Colors, Radii } from '@/theme/tokens';
import { MotionConfig } from '@/animations/motion';

export interface AppProgressIndicatorProps {
  progress: number; // 0 to 1
  height?: number;
  fillColor?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export const AppProgressIndicator: React.FC<AppProgressIndicatorProps> = ({
  progress,
  height = 6,
  fillColor = Colors.primary,
  trackColor = Colors.sage,
  style
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const widthPct = useSharedValue(clamped * 100);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const target = clamped * 100;
    widthPct.value = reducedMotion ? target : withSpring(target, MotionConfig.springGentle);
  }, [clamped, reducedMotion, widthPct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, backgroundColor: trackColor }, style]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radii.pill,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill
  }
});
