import React, { ComponentRef, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, BookmarkPlus, Compass, Send } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { AIMessageBubble } from '@/components/legal/AIMessageBubble';
import { useAISession, useCreateMatter, useSendAIMessage } from '@/hooks/useCustomerQueries';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';
import { triggerHaptic } from '@/utils/haptics';

export default function AISessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useAISession(sessionId || '');
  const sendMessage = useSendAIMessage(sessionId || '');
  const createMatter = useCreateMatter();
  const [input, setInput] = useState('');

  const session = data?.session;
  const aiStatus = data?.aiStatus;

  const handleSend = async (customText?: string) => {
    const content = (customText ?? input).trim();
    if (!content) return;

    try {
      await sendMessage.mutateAsync(content);
      if (!customText) setInput('');
      triggerHaptic.lightImpact();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (err) {
      showToast(
        err instanceof ApiClientError
          ? err.message
          : 'Unable to get AI response right now.',
        'error'
      );
    }
  };

  const handleSaveAsMatter = async () => {
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
        selectedSolution: session.selectedSolutionPath?.optionTitle
      });
      await triggerHaptic.success();
      showToast('Saved to My Matters', 'success');
      router.push(`/matters/${matter._id}` as never);
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Could not save matter', 'error');
    }
  };

  const openSolutions = () => {
    router.push({
      pathname: '/assistant/solutions',
      params: { sessionId: sessionId || '' }
    } as never);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={session?.title || 'AI Guidance'}
        subtitle={session?.likelyCategory || 'Legal Clarity Session'}
        showBack
        rightActions={
          session ? (
            <Pressable onPress={handleSaveAsMatter} hitSlop={8} accessibilityLabel="Save as matter">
              <BookmarkPlus size={20} color={Colors.primary} />
            </Pressable>
          ) : null
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading guidance session..." />
        </View>
      ) : isError || !session ? (
        <View style={styles.center}>
          <AppErrorState title="Could not load AI session" onRetry={() => refetch()} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {aiStatus && !aiStatus.configured ? (
              <AppCard variant="muted" style={styles.unavailableCard}>
                <View style={styles.warnRow}>
                  <AlertCircle size={18} color="#9A6B22" />
                  <AppText variant="bodySmall" color="#7B5416" style={styles.flex}>
                    {aiStatus.message}
                  </AppText>
                </View>
                <View style={styles.fallbackBtns}>
                  <AppButton
                    title="Save as Matter"
                    variant="outline"
                    size="sm"
                    onPress={handleSaveAsMatter}
                  />
                  <AppButton
                    title="Find Verified Lawyer"
                    size="sm"
                    onPress={() => router.push('/(tabs)/lawyers')}
                  />
                </View>
              </AppCard>
            ) : null}

            {session.messages.map((msg, index) => (
              <AIMessageBubble
                key={`${msg._id || index}-${msg.createdAt}`}
                message={msg}
                onExploreSolutions={msg.structuredResponse ? openSolutions : undefined}
                onSelectFollowUp={(q) => setInput(`Regarding "${q}": `)}
              />
            ))}

            {sendMessage.isPending ? (
              <AppCard variant="sage" style={styles.typingCard}>
                <AppLoader size="small" label="Reviewing legal context..." />
              </AppCard>
            ) : null}

            {session.latestAnalysis?.possibleOptions?.length ? (
              <AppCard variant="sage" style={styles.solutionsCta}>
                <View style={styles.warnRow}>
                  <Compass size={18} color={Colors.primary} />
                  <AppText variant="subtitle" color={Colors.primary} style={styles.flex}>
                    Ready to compare your next options?
                  </AppText>
                </View>
                <AppButton
                  title="Explore Possible Solutions"
                  size="md"
                  fullWidth
                  onPress={openSolutions}
                />
              </AppCard>
            ) : null}
          </ScrollView>

          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
            <TextInput
              style={styles.textInput}
              placeholder={
                aiStatus?.configured
                  ? 'Ask a follow-up or share another fact...'
                  : 'AI provider unavailable — save matter or consult a lawyer'
              }
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              editable={Boolean(aiStatus?.configured) && !sendMessage.isPending}
              multiline
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!aiStatus?.configured || !input.trim() || sendMessage.isPending}
              style={[
                styles.sendBtn,
                (!aiStatus?.configured || !input.trim() || sendMessage.isPending) &&
                  styles.sendDisabled
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send question"
            >
              <Send size={18} color={Colors.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  flex: {
    flex: 1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl
  },
  unavailableCard: {
    backgroundColor: Colors.warningSoft,
    borderColor: Colors.warning,
    gap: Spacing.sm,
    marginBottom: Spacing.md
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  fallbackBtns: {
    flexDirection: 'row',
    gap: Spacing.xs
  },
  typingCard: {
    marginBottom: Spacing.md
  },
  solutionsCta: {
    gap: Spacing.sm,
    marginTop: Spacing.xs
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    color: Colors.textPrimary,
    fontSize: 15
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendDisabled: {
    backgroundColor: Colors.borderStrong
  }
});
