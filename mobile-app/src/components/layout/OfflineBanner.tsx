import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, useReducedMotion } from 'react-native-reanimated';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const reducedMotion = useReducedMotion();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(220)}
      exiting={reducedMotion ? undefined : FadeOutUp.duration(180)}
      style={styles.banner}
      accessibilityRole="alert"
    >
      <View style={styles.row}>
        <WifiOff size={15} color={Colors.white} />
        <AppText variant="caption" color={Colors.white} weight="medium" style={styles.text}>
          You appear offline. Drafts are kept safely on this device until connected.
        </AppText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.primaryDeep,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    marginLeft: Spacing.xs
  }
});

