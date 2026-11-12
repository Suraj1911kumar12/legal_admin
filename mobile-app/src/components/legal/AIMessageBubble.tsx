import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';
import { AIMessage } from '@/types/customer';
import { formatDateTime } from '@/utils/formatters';
import { AIResponseCard } from './AIResponseCard';
import { FollowUpQuestionCard } from './FollowUpQuestionCard';

export interface AIMessageBubbleProps {
  message: AIMessage;
  onExploreSolutions?: () => void;
  onSelectFollowUp?: (question: string) => void;
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({
  message,
  onExploreSolutions,
  onSelectFollowUp
}) => {
  const reducedMotion = useReducedMotion();
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Animated.View
        entering={reducedMotion ? undefined : FadeInDown.duration(220)}
        style={styles.userRow}
      >
        <View style={styles.userBubble}>
          <AppText variant="body" color={Colors.white}>
            {message.content}
          </AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.7)" style={styles.userTime}>
            {formatDateTime(message.createdAt)}
          </AppText>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(240)}
      style={styles.assistantColumn}
    >
      <View style={styles.assistantHeader}>
        <View style={styles.botBadge}>
          <Sparkles size={13} color={Colors.primary} />
        </View>
        <AppText variant="label" color={Colors.primary}>
          LegalDost AI Assistant
        </AppText>
        <AppText variant="caption" color={Colors.textMuted}>
          {formatDateTime(message.createdAt)}
        </AppText>
      </View>

      {message.structuredResponse ? (
        <AIResponseCard
          response={message.structuredResponse}
          onExploreSolutions={onExploreSolutions}
        />
      ) : (
        <View style={styles.assistantBubble}>
          <AppText variant="body" color={Colors.textPrimary}>
            {message.content}
          </AppText>
        </View>
      )}

      {message.followUpQuestions && message.followUpQuestions.length > 0 && onSelectFollowUp ? (
        <FollowUpQuestionCard
          questions={message.followUpQuestions}
          onSelectQuestion={onSelectFollowUp}
        />
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md
  },
  userBubble: {
    maxWidth: '84%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  userTime: {
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  assistantColumn: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2
  },
  botBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center'
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    borderTopLeftRadius: 4,
    padding: Spacing.md
  },
  followUpStack: {
    marginTop: Spacing.xs,
    gap: Spacing.xs
  }
});
