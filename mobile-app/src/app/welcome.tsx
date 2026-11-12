import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { FileCheck2, MessageSquareText, Scale, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={reducedMotion ? undefined : FadeInDown.duration(300)}
        style={styles.hero}
      >
        <View style={styles.logoPill}>
          <Scale size={18} color={Colors.primary} />
          <AppText variant="label" color={Colors.primary}>
            LEGALDOST
          </AppText>
        </View>

        <AppText variant="display" color={Colors.textPrimary} style={styles.headline}>
          Understand your legal rights without the confusion
        </AppText>
        <AppText variant="body" color={Colors.textSecondary}>
          Describe your problem in everyday words, review documents calmly, and connect with
          verified lawyers whenever you need human representation.
        </AppText>
      </Animated.View>

      <Animated.View
        entering={reducedMotion ? undefined : FadeInDown.delay(80).duration(300)}
        style={styles.features}
      >
        <AppCard variant="sage" style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={styles.iconCircle}>
              <Sparkles size={18} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="subtitle" color={Colors.textPrimary}>
                Guided Legal Clarity
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Structured plain-language explanations with missing facts & document checklists.
              </AppText>
            </View>
          </View>
        </AppCard>

        <AppCard variant="default" style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={styles.iconCircle}>
              <FileCheck2 size={18} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="subtitle" color={Colors.textPrimary}>
                Private Document Vault
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Upload agreements, notices, or IDs securely with strict access controls.
              </AppText>
            </View>
          </View>
        </AppCard>

        <AppCard variant="default" style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={18} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="subtitle" color={Colors.textPrimary}>
                Verified Bar-Registered Lawyers
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Book video, phone, or in-person consultations and message directly in one place.
              </AppText>
            </View>
          </View>
        </AppCard>
      </Animated.View>

      <View style={styles.actions}>
        <AppButton
          title="Create Account"
          size="lg"
          fullWidth
          onPress={() => router.push('/register')}
        />
        <AppButton
          title="Log In"
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/login')}
        />
        <Pressable onPress={() => router.push('/onboarding')} style={styles.tourLink}>
          <MessageSquareText size={14} color={Colors.primary} />
          <AppText variant="bodySmall" color={Colors.primary} weight="medium">
            See how LegalDost works
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background
  },
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  hero: {
    gap: Spacing.sm
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.sage,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    marginBottom: Spacing.xs
  },
  headline: {
    lineHeight: 36
  },
  features: {
    gap: Spacing.sm
  },
  featureCard: {
    padding: Spacing.md
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureText: {
    flex: 1,
    gap: 2
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs
  },
  tourLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs
  }
});

