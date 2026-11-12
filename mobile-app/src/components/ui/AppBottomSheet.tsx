import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { MotionConfig } from '@/animations/motion';

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightPct?: number;
}

export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeightPct = 82
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (visible) {
      translateY.value = reducedMotion ? 0 : 40;
      if (!reducedMotion) {
        translateY.value = withSpring(0, MotionConfig.springGentle);
      }
    }
  }, [visible, reducedMotion, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 800) {
        runOnJS(onClose)();
      } else {
        translateY.value = reducedMotion ? 0 : withSpring(0, MotionConfig.springSnappy);
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss sheet">
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  maxHeight: `${maxHeightPct}%`,
                  paddingBottom: Math.max(insets.bottom + Spacing.md, Spacing.lg)
                },
                sheetAnimatedStyle
              ]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View style={styles.handleWrap}>
                  <View style={styles.handle} />
                </View>

                {title && (
                  <View style={styles.header}>
                    <AppText variant="h3" color={Colors.textPrimary} style={styles.title}>
                      {title}
                    </AppText>
                    <Pressable
                      onPress={onClose}
                      accessibilityRole="button"
                      accessibilityLabel="Close bottom sheet"
                      hitSlop={10}
                    >
                      <X size={20} color={Colors.textSecondary} />
                    </Pressable>
                  </View>
                )}

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl + 4,
    borderTopRightRadius: Radii.xl + 4,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.border
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md
  },
  title: {
    flex: 1,
    paddingRight: Spacing.sm
  }
});

