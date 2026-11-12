import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  Scale,
  Sparkles,
  CheckCircle2
} from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { SourceReferenceCard } from './SourceReferenceCard';
import { AIStructuredResponse } from '@/types/customer';

export interface AIResponseCardProps {
  response: AIStructuredResponse;
  onExploreSolutions?: () => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({
  response,
  onExploreSolutions
}) => {
  const reducedMotion = useReducedMotion();
  const [expandedLaw, setExpandedLaw] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState(false);

  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(300)}>
      <AppCard style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Sparkles size={16} color={Colors.primary} />
            <AppText variant="label" color={Colors.primary} style={styles.brandLabel}>
              AI Legal Information
            </AppText>
          </View>
          <AppBadge label={response.likelyCategory || 'General Legal'} tone="sage" />
        </View>

        {/* Mandatory legal safety disclaimer */}
        <View style={styles.disclaimerBox}>
          <AlertCircle size={14} color="#9A6B22" />
          <AppText variant="caption" color="#7B5416" style={styles.disclaimerText}>
            {response.disclaimer ||
              'AI-generated general legal information only. Not formal legal advice or a lawyer’s opinion.'}
          </AppText>
        </View>

        {/* 1. Understanding Your Problem */}
        {response.understandingYourProblem ? (
          <View style={styles.section}>
            <AppText variant="subtitle" color={Colors.textPrimary} style={styles.sectionTitle}>
              1. Understanding Your Problem
            </AppText>
            <AppText variant="body" color={Colors.textSecondary}>
              {response.understandingYourProblem}
            </AppText>
          </View>
        ) : null}

        {/* 2. Important Facts */}
        {response.importantFacts && response.importantFacts.length > 0 && (
          <View style={styles.section}>
            <AppText variant="subtitle" color={Colors.textPrimary} style={styles.sectionTitle}>
              2. Important Facts Noted
            </AppText>
            {response.importantFacts.map((fact, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <CheckCircle2 size={14} color={Colors.success} />
                <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.bulletText}>
                  {fact}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* 3. What the Law Generally Says */}
        {response.whatLawGenerallySays ? (
          <View style={styles.section}>
            <Pressable
              onPress={() => setExpandedLaw((v) => !v)}
              accessibilityRole="button"
              style={styles.collapseHeader}
            >
              <View style={styles.collapseTitleWrap}>
                <Scale size={15} color={Colors.primary} />
                <AppText variant="subtitle" color={Colors.textPrimary} style={styles.collapseTitle}>
                  3. What the Law Generally Says
                </AppText>
              </View>
              {expandedLaw ? (
                <ChevronUp size={18} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={18} color={Colors.textSecondary} />
              )}
            </Pressable>
            {expandedLaw && (
              <AppText variant="body" color={Colors.textSecondary} style={styles.collapseBody}>
                {response.whatLawGenerallySays}
              </AppText>
            )}
          </View>
        ) : null}

        {/* 4. Possible Options */}
        {response.possibleOptions && response.possibleOptions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Compass size={15} color={Colors.primary} />
              <AppText variant="subtitle" color={Colors.textPrimary} style={styles.collapseTitle}>
                4. Possible Options ({response.possibleOptions.length})
              </AppText>
            </View>
            {response.possibleOptions.slice(0, 2).map((opt, idx) => (
              <View key={idx} style={styles.optionMini}>
                <AppText variant="bodySmall" weight="bold" color={Colors.primaryDeep}>
                  {opt.title}
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary} style={styles.optDesc}>
                  {opt.explanation}
                </AppText>
              </View>
            ))}
            {onExploreSolutions && (
              <AppButton
                title="Explore All Possible Solutions"
                variant="secondary"
                size="sm"
                onPress={onExploreSolutions}
                style={styles.solutionsBtn}
              />
            )}
          </View>
        )}

        {/* 5. Documents You May Need */}
        {response.documentsYouMayNeed && response.documentsYouMayNeed.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setExpandedDocs((v) => !v)}
              accessibilityRole="button"
              style={styles.collapseHeader}
            >
              <View style={styles.collapseTitleWrap}>
                <FileText size={15} color={Colors.primary} />
                <AppText variant="subtitle" color={Colors.textPrimary} style={styles.collapseTitle}>
                  5. Documents You May Need
                </AppText>
              </View>
              {expandedDocs ? (
                <ChevronUp size={18} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={18} color={Colors.textSecondary} />
              )}
            </Pressable>
            {expandedDocs &&
              response.documentsYouMayNeed.map((doc, idx) => (
                <AppText key={idx} variant="bodySmall" color={Colors.textSecondary} style={styles.docItem}>
                  • {doc}
                </AppText>
              ))}
          </View>
        )}

        {/* 6. Suggested Next Steps */}
        {response.suggestedNextSteps && response.suggestedNextSteps.length > 0 && (
          <View style={styles.section}>
            <AppText variant="subtitle" color={Colors.textPrimary} style={styles.sectionTitle}>
              6. Suggested Next Steps
            </AppText>
            {response.suggestedNextSteps.map((step, idx) => (
              <AppText key={idx} variant="bodySmall" color={Colors.textSecondary} style={styles.stepItem}>
                {idx + 1}. {step}
              </AppText>
            ))}
          </View>
        )}

        {/* 7. When Professional Help May Be Useful */}
        {response.whenProfessionalHelpUseful ? (
          <View style={styles.proHelpBox}>
            <AppText variant="label" color={Colors.primaryDeep}>
              7. When Professional Help May Be Useful
            </AppText>
            <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.proHelpText}>
              {response.whenProfessionalHelpUseful}
            </AppText>
          </View>
        ) : null}

        {response.uncertaintyNotes ? (
          <AppText variant="caption" color={Colors.textSecondary} style={styles.uncertainty}>
            Note: {response.uncertaintyNotes}
          </AppText>
        ) : null}

        <SourceReferenceCard sources={response.sources || []} />
      </AppCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandLabel: {
    marginLeft: 6
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warningSoft,
    borderRadius: Radii.sm,
    padding: Spacing.xs + 2,
    marginBottom: Spacing.md
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 6
  },
  section: {
    marginBottom: Spacing.md
  },
  sectionTitle: {
    marginBottom: 4
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4
  },
  bulletText: {
    flex: 1,
    marginLeft: 6
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  collapseTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  collapseTitle: {
    marginLeft: 6
  },
  collapseBody: {
    marginTop: 6
  },
  optionMini: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6
  },
  optDesc: {
    marginTop: 2
  },
  solutionsBtn: {
    marginTop: 4
  },
  docItem: {
    marginTop: 4,
    paddingLeft: 6
  },
  stepItem: {
    marginTop: 4
  },
  proHelpBox: {
    backgroundColor: Colors.accentSoft,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#F0CBB4',
    marginBottom: Spacing.xs
  },
  proHelpText: {
    marginTop: 4
  },
  uncertainty: {
    marginTop: 4,
    fontStyle: 'italic'
  }
});

