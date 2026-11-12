import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { ArrowRight, Compass, FileText, Lock, Scale } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { useAuth } from '@/features/auth/AuthContext';
import { triggerHaptic } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  icon: 'compass' | 'file' | 'scale' | 'lock';
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    eyebrow: 'STEP 1 OF 4',
    title: 'Understand Your Legal Problem',
    description:
      'Describe what happened in your own everyday words. You do not need legal jargon to start getting clarity.',
    highlights: [
      'Guided prompts help capture important dates and facts',
      'Save drafts offline and resume anytime',
      'Plain-language summaries tailored to your situation'
    ],
    icon: 'compass'
  },
  {
    id: '2',
    eyebrow: 'STEP 2 OF 4',
    title: 'Review Documents & Explore Options',
    description:
      'Upload notices, contracts, or receipts securely and explore clear legal pathways before deciding what to do next.',
    highlights: [
      'Supports PDF, JPG, and PNG documents up to 10 MB',
      'See both self-help steps and legal representation paths',
      'General legal information — never fake promises'
    ],
    icon: 'file'
  },
  {
    id: '3',
    eyebrow: 'STEP 3 OF 4',
    title: 'Connect With Verified Lawyers',
    description:
      'Browse Bar-verified lawyers by practice area, city, language, and transparent consultation fees.',
    highlights: [
      'Check real available consultation slots',
      'Share your matter context only when you explicitly consent',
      'Message directly inside LegalDost'
    ],
    icon: 'scale'
  },
  {
    id: '4',
    eyebrow: 'STEP 4 OF 4',
    title: 'Your Privacy & Control',
    description:
      'Your personal documents and conversations remain private, encrypted on-device where cached, and strictly access-controlled.',
    highlights: [
      'Authorized private document downloads only',
      'Clear control over push notifications and account data',
      'Shared account across LegalDost mobile and web'
    ],
    icon: 'lock'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const { completeOnboarding, isAuthenticated } = useAuth();
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const finishOnboarding = async () => {
    await triggerHaptic.selection();
    await completeOnboarding();
    router.replace(isAuthenticated ? '/(tabs)/home' : '/welcome');
  };

  const handleNext = async () => {
    await triggerHaptic.selection();
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    } else {
      await finishOnboarding();
    }
  };

  const renderSlideIcon = (icon: OnboardingSlide['icon']) => {
    switch (icon) {
      case 'compass':
        return <Compass size={40} color={Colors.primary} />;
      case 'file':
        return <FileText size={40} color={Colors.primary} />;
      case 'scale':
        return <Scale size={40} color={Colors.primary} />;
      case 'lock':
        return <Lock size={40} color={Colors.primary} />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg }
      ]}
    >
      <View style={styles.topBar}>
        <AppText variant="label" color={Colors.primary}>
          LEGALDOST
        </AppText>
        <Pressable onPress={finishOnboarding} hitSlop={10}>
          <AppText variant="bodySmall" color={Colors.textSecondary} weight="semibold">
            Skip
          </AppText>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Animated.View
              entering={reducedMotion ? undefined : FadeIn.duration(250)}
              style={styles.slideInner}
            >
              <View style={styles.iconBox}>{renderSlideIcon(item.icon)}</View>
              <AppText variant="caption" weight="semibold" color={Colors.primary}>
                {item.eyebrow}
              </AppText>
              <AppText variant="h1" color={Colors.textPrimary} align="center">
                {item.title}
              </AppText>
              <AppText variant="body" color={Colors.textSecondary} align="center">
                {item.description}
              </AppText>

              <AppCard variant="sage" style={styles.highlightCard}>
                {item.highlights.map((point, idx) => (
                  <View key={idx} style={styles.pointRow}>
                    <View style={styles.dot} />
                    <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.pointText}>
                      {point}
                    </AppText>
                  </View>
                ))}
              </AppCard>
            </Animated.View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((slide, idx) => (
            <View
              key={slide.id}
              style={[
                styles.indicator,
                idx === activeIndex ? styles.indicatorActive : styles.indicatorInactive
              ]}
            />
          ))}
        </View>

        <AppButton
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          size="lg"
          fullWidth
          rightIcon={<ArrowRight size={18} color={Colors.white} />}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm
  },
  slide: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg
  },
  slideInner: {
    alignItems: 'center',
    gap: Spacing.sm
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs
  },
  highlightCard: {
    width: '100%',
    marginTop: Spacing.md,
    gap: Spacing.sm
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
    marginTop: 7
  },
  pointText: {
    flex: 1
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs
  },
  indicator: {
    height: 8,
    borderRadius: Radii.pill
  },
  indicatorActive: {
    width: 26,
    backgroundColor: Colors.primary
  },
  indicatorInactive: {
    width: 8,
    backgroundColor: Colors.borderStrong
  }
});

