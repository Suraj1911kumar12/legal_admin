import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { HelpCircle } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';

export interface FollowUpQuestionCardProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export const FollowUpQuestionCard: React.FC<FollowUpQuestionCardProps> = ({
  questions,
  onSelectQuestion
}) => {
  const reducedMotion = useReducedMotion();
  if (!questions || questions.length === 0) return null;

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(260)}
      style={styles.container}
    >
      <View style={styles.header}>
        <HelpCircle size={15} color={Colors.primary} />
        <AppText variant="label" color={Colors.primary} style={styles.title}>
          Helpful Follow-up Questions (Tap to answer)
        </AppText>
      </View>

      {questions.map((q, idx) => (
        <Pressable
          key={idx}
          onPress={() => onSelectQuestion(q)}
          accessibilityRole="button"
          accessibilityLabel={`Answer follow-up: ${q}`}
          style={styles.chip}
        >
          <AppText variant="bodySmall" color={Colors.primaryDeep}>
            {q}
          </AppText>
        </Pressable>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.sageLight,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.sage,
    padding: Spacing.sm
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  title: {
    marginLeft: 6
  },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    marginTop: 6
  }
});

