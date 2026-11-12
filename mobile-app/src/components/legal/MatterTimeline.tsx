import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import {
  Calendar,
  FileCheck2,
  FileText,
  Scale,
  Sparkles,
  CheckCircle2
} from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';
import { formatDateTime } from '@/utils/formatters';

export interface TimelineEventItem {
  _id?: string;
  title: string;
  description?: string;
  eventType:
    | 'problem_submitted'
    | 'document_uploaded'
    | 'ai_analysis'
    | 'lawyer_assigned'
    | 'consultation'
    | 'matter_updated';
  createdAt: string;
}

export interface MatterTimelineProps {
  events: TimelineEventItem[];
}

export const MatterTimeline: React.FC<MatterTimelineProps> = ({ events }) => {
  const reducedMotion = useReducedMotion();

  if (!events || events.length === 0) {
    return (
      <AppText variant="bodySmall" color={Colors.textSecondary}>
        No timeline activity recorded yet.
      </AppText>
    );
  }

  const getIcon = (type: TimelineEventItem['eventType']) => {
    switch (type) {
      case 'problem_submitted':
        return <FileText size={14} color={Colors.primary} />;
      case 'document_uploaded':
        return <FileCheck2 size={14} color={Colors.primary} />;
      case 'ai_analysis':
        return <Sparkles size={14} color={Colors.primary} />;
      case 'lawyer_assigned':
        return <Scale size={14} color={Colors.primary} />;
      case 'consultation':
        return <Calendar size={14} color={Colors.primary} />;
      default:
        return <CheckCircle2 size={14} color={Colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      {events.map((ev, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <Animated.View
            key={ev._id || `${ev.eventType}-${idx}`}
            entering={reducedMotion ? undefined : FadeInDown.duration(260).delay(idx * 60)}
            style={styles.row}
          >
            <View style={styles.railCol}>
              <View style={styles.dotCircle}>{getIcon(ev.eventType)}</View>
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={[styles.contentCol, !isLast && styles.contentSpacing]}>
              <AppText variant="bodySmall" weight="semibold" color={Colors.textPrimary}>
                {ev.title}
              </AppText>
              {ev.description && (
                <AppText variant="caption" color={Colors.textSecondary} style={styles.desc}>
                  {ev.description}
                </AppText>
              )}
              <AppText variant="caption" color={Colors.textMuted} style={styles.time}>
                {formatDateTime(ev.createdAt)}
              </AppText>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  railCol: {
    alignItems: 'center',
    width: 32,
    marginRight: Spacing.sm
  },
  dotCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center'
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4
  },
  contentCol: {
    flex: 1,
    paddingTop: 2
  },
  contentSpacing: {
    paddingBottom: Spacing.md
  },
  desc: {
    marginTop: 2
  },
  time: {
    marginTop: 3,
    fontSize: 11
  }
});

