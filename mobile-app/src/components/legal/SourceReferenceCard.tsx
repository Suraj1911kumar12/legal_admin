import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';

export interface SourceReferenceCardProps {
  sources: { title: string; reference: string }[];
}

export const SourceReferenceCard: React.FC<SourceReferenceCardProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Toggle legal reference context"
        style={styles.header}
      >
        <View style={styles.left}>
          <BookOpen size={15} color={Colors.primary} />
          <AppText variant="label" color={Colors.primary} style={styles.title}>
            General References ({sources.length})
          </AppText>
        </View>
        {expanded ? (
          <ChevronUp size={16} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={16} color={Colors.textSecondary} />
        )}
      </Pressable>

      {expanded && (
        <View style={styles.list}>
          {sources.map((src, i) => (
            <View key={i} style={styles.item}>
              <AppText variant="caption" weight="semibold" color={Colors.textPrimary}>
                {src.title}
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                {src.reference}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginTop: Spacing.xs
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    marginLeft: 6
  },
  list: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    gap: 6
  },
  item: {
    paddingVertical: 2
  }
});

