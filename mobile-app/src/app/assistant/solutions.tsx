import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookmarkCheck, Compass, Scale } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { SolutionCard } from '@/components/legal/SolutionCard';
import {
  useAISession,
  useCreateMatter,
  useSelectSolutionPath
} from '@/hooks/useCustomerQueries';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';
import { triggerHaptic } from '@/utils/haptics';

export default function PossibleSolutionsScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data, isLoading } = useAISession(sessionId || '');
  const selectPath = useSelectSolutionPath(sessionId || '');
  const createMatter = useCreateMatter();

  const session = data?.session;
  const options = session?.latestAnalysis?.possibleOptions || [];

  const handleChoosePath = async (
    choice: 'continue_alone' | 'get_legal_help',
    optionTitle: string
  ) => {
    try {
      await selectPath.mutateAsync({ choice, optionTitle });
      await triggerHaptic.success();
      if (choice === 'get_legal_help') {
        showToast('Saved choice — explore verified lawyers next', 'success');
        router.push('/(tabs)/lawyers');
      } else {
        showToast('Saved self-help path to your session', 'success');
      }
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Unable to save selection', 'error');
    }
  };

  const handleSaveMatter = async () => {
    if (!session) return;
    try {
      const matter = await createMatter.mutateAsync({
        title: session.title,
        category: session.likelyCategory || 'General Legal',
        description: session.messages[0]?.content || session.title,
        intakeId: session.intakeId || undefined,
        aiSessionId: session._id,
        aiSummary: session.latestAnalysis?.understandingYourProblem,
        importantFacts: session.latestAnalysis?.importantFacts || [],
        selectedSolution: session.selectedSolutionPath?.optionTitle || options[0]?.title
      });
      await triggerHaptic.success();
      showToast('Matter saved with your guidance & options', 'success');
      router.push(`/matters/${matter._id}` as never);
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Could not save matter', 'error');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Possible Solutions"
        subtitle="Compare paths calmly before deciding"
        showBack
      />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading solution pathways..." />
        </View>
      ) : options.length === 0 ? (
        <View style={styles.center}>
          <AppEmptyState
            icon={<Compass size={26} color={Colors.primary} />}
            title="No structured pathways yet"
            description="Complete an AI analysis session first, or browse verified lawyers directly."
            actionLabel="Browse Verified Lawyers"
            onAction={() => router.push('/(tabs)/lawyers')}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxl }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <AppCard variant="sage" style={styles.infoCard}>
            <AppText variant="bodySmall" color={Colors.primaryDeep}>
              LegalDost compares general options side by side so you can either follow self-help
              steps or speak with a verified lawyer.
            </AppText>
          </AppCard>

          {options.map((opt, idx) => {
            const isSelected = session?.selectedSolutionPath?.optionTitle === opt.title;
            return (
              <SolutionCard
                key={`${idx}-${opt.title}`}
                option={opt}
                isSelected={isSelected}
                loading={selectPath.isPending}
                onContinueAlone={() => handleChoosePath('continue_alone', opt.title)}
                onGetLegalHelp={() => handleChoosePath('get_legal_help', opt.title)}
              />
            );
          })}

          <View style={styles.bottomActions}>
            <AppButton
              title="Save Case to My Matters"
              variant="outline"
              size="lg"
              fullWidth
              leftIcon={<BookmarkCheck size={18} color={Colors.primary} />}
              loading={createMatter.isPending}
              onPress={handleSaveMatter}
            />
            <AppButton
              title="Browse Verified Lawyers"
              size="lg"
              fullWidth
              leftIcon={<Scale size={18} color={Colors.white} />}
              onPress={() => router.push('/(tabs)/lawyers')}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md
  },
  infoCard: {
    padding: Spacing.sm
  },
  bottomActions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs
  }
});

