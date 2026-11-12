import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, ArrowRight, Bot, Sparkles } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextArea } from '@/components/ui/AppTextArea';
import { AppButton } from '@/components/ui/AppButton';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { useAIStatus, useAISessions, useCreateAISession } from '@/hooks/useCustomerQueries';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';
import { formatDateTime } from '@/utils/formatters';

const QUICK_PROMPTS = [
  'My landlord has not returned my security deposit after moving out.',
  'I received a defective product and the seller refuses a refund.',
  'I received a legal notice and want to understand what it means.',
  'My employer has delayed my salary after resignation.'
];

export default function AssistantTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const { showToast } = useToast();

  const [prompt, setPrompt] = useState('');
  const { data: aiStatus, isLoading: statusLoading } = useAIStatus();
  const { data: sessions, isLoading, refetch, isRefetching } = useAISessions();
  const createSession = useCreateAISession();

  const startSession = async (initialText?: string) => {
    const clean = (initialText ?? prompt).trim();
    if (clean.length < 10) {
      showToast('Please describe your legal question in at least a few words.', 'error');
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        initialProblem: clean,
        title: clean.slice(0, 70),
        preferredLanguage: customer?.preferredLanguage || 'en'
      });
      setPrompt('');
      router.push(`/assistant/${session._id}` as never);
    } catch (err) {
      showToast(
        err instanceof ApiClientError ? err.message : 'Unable to start AI session right now.',
        'error'
      );
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <AppText variant="h1" color={Colors.textPrimary}>
          LegalDost AI Help
        </AppText>
        <AppText variant="caption" color={Colors.textSecondary}>
          Structured plain-language legal information & next options
        </AppText>
      </View>

      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { void refetch(); }}
            tintColor={Colors.primary}
          />
        }
      >
        {!statusLoading && aiStatus && !aiStatus.configured ? (
          <AppCard variant="muted" style={styles.unavailableBanner}>
            <View style={styles.bannerRow}>
              <AlertCircle size={20} color="#9A6B22" />
              <View style={styles.flexOne}>
                <AppText variant="subtitle" color={Colors.textPrimary}>
                  AI Assistant Currently Unavailable
                </AppText>
                <AppText variant="bodySmall" color={Colors.textSecondary}>
                  {aiStatus.message ||
                    'No live AI provider is configured on the server right now. LegalDost never fabricates AI advice. You can still submit your problem or consult verified lawyers.'}
                </AppText>
              </View>
            </View>
            <View style={styles.unavailableActions}>
              <AppButton
                title="Submit Problem Intake"
                variant="outline"
                size="sm"
                onPress={() => router.push('/intake/new')}
              />
              <AppButton
                title="Browse Lawyers"
                size="sm"
                onPress={() => router.push('/(tabs)/lawyers')}
              />
            </View>
          </AppCard>
        ) : (
          <AppCard variant="sage" style={styles.composerCard}>
            <View style={styles.brandRow}>
              <Sparkles size={18} color={Colors.primary} />
              <AppText variant="subtitle" color={Colors.primary}>
                Ask a Legal Question
              </AppText>
            </View>
            <AppText variant="caption" color={Colors.textSecondary}>
              General legal information to help you understand your situation — not formal legal
              advice.
            </AppText>
            <AppTextArea
              placeholder="Describe what happened in plain language (dates, amounts, notices, or who is involved)..."
              value={prompt}
              onChangeText={setPrompt}
              minHeight={100}
            />
            <AppButton
              title="Get Structured Guidance"
              fullWidth
              loading={createSession.isPending}
              disabled={!aiStatus?.configured || createSession.isPending}
              onPress={() => startSession()}
            />
          </AppCard>
        )}

        <View style={styles.section}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Common Everyday Situations
          </AppText>
          <View style={styles.promptsList}>
            {QUICK_PROMPTS.map((q, idx) => (
              <AppCard
                key={idx}
                onPress={() => {
                  if (aiStatus?.configured) {
                    startSession(q);
                  } else {
                    router.push('/intake/new');
                  }
                }}
                padding={Spacing.sm}
              >
                <View style={styles.promptRow}>
                  <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.flexOne}>
                    {q}
                  </AppText>
                  <ArrowRight size={16} color={Colors.primary} />
                </View>
              </AppCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Previous AI Sessions
          </AppText>
          {isLoading ? (
            <SkeletonCard />
          ) : !sessions || sessions.length === 0 ? (
            <AppEmptyState
              icon={<Bot size={24} color={Colors.primary} />}
              title="No AI guidance sessions yet"
              description="Your AI legal clarity conversations and chosen next-step paths will appear here."
            />
          ) : (
            <View style={styles.promptsList}>
              {sessions.map((session) => (
                <AppCard
                  key={session._id}
                  onPress={() => router.push(`/assistant/${session._id}` as never)}
                >
                  <View style={styles.sessionTop}>
                    <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1} style={styles.flexOne}>
                      {session.title}
                    </AppText>
                    <AppBadge
                      label={session.likelyCategory || 'General'}
                      tone="sage"
                    />
                  </View>
                  <AppText variant="caption" color={Colors.textSecondary} style={styles.sessionMeta}>
                    {session.messages?.length || 0} messages • Updated {formatDateTime(session.updatedAt)}
                  </AppText>
                </AppCard>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 2
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg
  },
  unavailableBanner: {
    backgroundColor: Colors.warningSoft,
    borderColor: Colors.warning,
    gap: Spacing.sm
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm
  },
  unavailableActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap'
  },
  composerCard: {
    gap: Spacing.sm
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  section: {
    gap: Spacing.sm
  },
  promptsList: {
    gap: Spacing.xs
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs
  },
  sessionMeta: {
    marginTop: 4
  },
  flexOne: {
    flex: 1
  }
});
