import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { Scale } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppLoader } from '@/components/ui/AppLoader';

export default function IndexGateScreen() {
  const reducedMotion = useReducedMotion();

  return (
    <View style={styles.container}>
      <Animated.View
        entering={reducedMotion ? undefined : FadeIn.duration(350)}
        style={styles.brandBlock}
      >
        <View style={styles.logoMark}>
          <Scale size={34} color={Colors.white} strokeWidth={2} />
        </View>
        <AppText variant="display" color={Colors.primary} style={styles.brandName}>
          LegalDost
        </AppText>
        <AppText variant="body" color={Colors.textSecondary} align="center">
          Clear, calm legal clarity for every citizen
        </AppText>
        <View style={styles.loaderWrap}>
          <AppLoader size="small" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl
  },
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.sm
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: Radii.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs
  },
  brandName: {
    letterSpacing: -0.5
  },
  loaderWrap: {
    marginTop: Spacing.md
  }
});
