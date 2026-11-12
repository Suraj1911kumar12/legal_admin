import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, CheckCircle2, Clock, MessageSquare, Scale, Sparkles } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { MatterTimeline } from '@/components/legal/MatterTimeline';
import { DocumentCard } from '@/components/legal/DocumentCard';
import { DocumentUploader } from '@/components/legal/DocumentUploader';
import { ConsultationCard } from '@/components/legal/ConsultationCard';
import { useMatterDetail } from '@/hooks/useCustomerQueries';
import { downloadAndPreviewPrivateDocument } from '@/features/documents/privateDownload';
import { useToast } from '@/components/ui/AppToast';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { PublicLawyer } from '@/types/customer';

export default function MatterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch, isRefetching } = useMatterDetail(id || '');
  const matter = data?.matter;

  const assignedLawyer =
    matter?.lawyerId && typeof matter.lawyerId === 'object'
      ? (matter.lawyerId as PublicLawyer)
      : null;

  return (
    <View style={styles.screen}>
      <AppHeader
        title={matter?.matterReference || 'Matter Overview'}
        subtitle={matter?.category}
        showBack
      />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading matter details..." />
        </View>
      ) : isError || !matter ? (
        <View style={styles.center}>
          <AppErrorState title="Could not load matter" onRetry={() => refetch()} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxl }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => { void refetch(); }}
              tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <AppCard variant="sage" style={styles.overviewCard}>
            <View style={styles.topRow}>
              <AppBadge label={matter.status.replace('_', ' ').toUpperCase()} tone="primary" />
              <AppBadge label={matter.category} tone="neutral" />
            </View>
            <AppText variant="h2" color={Colors.textPrimary}>
              {matter.title}
            </AppText>
            {matter.description ? (
              <AppText variant="body" color={Colors.textSecondary}>
                {matter.description}
              </AppText>
            ) : null}
            {matter.selectedSolution ? (
              <View style={styles.selectedPathBox}>
                <AppText variant="label" color={Colors.primary}>
                  Selected Path: {matter.selectedSolution}
                </AppText>
              </View>
            ) : null}
          </AppCard>

          {matter.aiSummary || (matter.importantFacts && matter.importantFacts.length > 0) ? (
            <AppCard style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={16} color={Colors.primary} />
                <AppText variant="subtitle" color={Colors.textPrimary}>
                  AI Summary & Key Facts
                </AppText>
              </View>
              {matter.aiSummary ? (
                <AppText variant="bodySmall" color={Colors.textSecondary}>
                  {matter.aiSummary}
                </AppText>
              ) : null}
              {matter.importantFacts?.map((fact, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.flexOne}>
                    {fact}
                  </AppText>
                </View>
              ))}
              {matter.aiSessionId ? (
                <AppButton
                  title="Continue AI Session"
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/assistant/${matter.aiSessionId}` as never)}
                />
              ) : null}
            </AppCard>
          ) : null}

          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Scale size={16} color={Colors.primary} />
              <AppText variant="subtitle" color={Colors.textPrimary}>
                Assigned Lawyer
              </AppText>
            </View>
            {assignedLawyer ? (
              <View style={styles.lawyerBox}>
                <AppText variant="subtitle" color={Colors.textPrimary}>
                  {assignedLawyer.fullName}
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary}>
                  {assignedLawyer.city}, {assignedLawyer.state} •{' '}
                  {assignedLawyer.yearsOfExperience} yrs exp
                </AppText>
                <View style={styles.lawyerActions}>
                  <AppButton
                    title="View Profile"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push(`/lawyers/${assignedLawyer._id}` as never)}
                    style={styles.flexOne}
                  />
                  {data?.conversations?.[0] ? (
                    <AppButton
                      title="Open Chat"
                      size="sm"
                      leftIcon={<MessageSquare size={14} color={Colors.white} />}
                      onPress={() =>
                        router.push(`/messages/${data.conversations[0]._id}` as never)
                      }
                      style={styles.flexOne}
                    />
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.lawyerBox}>
                <AppText variant="bodySmall" color={Colors.textSecondary}>
                  No lawyer is assigned to this matter yet. You can browse verified lawyers and
                  request a consultation anytime.
                </AppText>
                <AppButton
                  title="Find Verified Lawyer"
                  size="sm"
                  onPress={() => router.push('/(tabs)/lawyers')}
                />
              </View>
            )}
          </AppCard>

          {matter.clientUpdates && matter.clientUpdates.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="h3" color={Colors.textPrimary}>
                Lawyer Updates
              </AppText>
              {matter.clientUpdates.map((upd) => (
                <AppCard key={upd._id} padding={Spacing.sm}>
                  <AppText variant="subtitle" color={Colors.textPrimary}>
                    {upd.title}
                  </AppText>
                  <AppText variant="bodySmall" color={Colors.textSecondary}>
                    {upd.message}
                  </AppText>
                  <AppText variant="caption" color={Colors.textMuted}>
                    {formatDateTime(upd.createdAt)}
                  </AppText>
                </AppCard>
              ))}
            </View>
          ) : null}

          {matter.importantDates && matter.importantDates.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="h3" color={Colors.textPrimary}>
                Important Dates
              </AppText>
              {matter.importantDates.map((d) => (
                <AppCard key={d._id} padding={Spacing.sm}>
                  <View style={styles.sectionTitleRow}>
                    <Calendar size={15} color={Colors.primary} />
                    <AppText variant="subtitle" color={Colors.textPrimary}>
                      {d.title} — {formatDate(d.date)}
                    </AppText>
                  </View>
                  {d.description ? (
                    <AppText variant="bodySmall" color={Colors.textSecondary}>
                      {d.description}
                    </AppText>
                  ) : null}
                </AppCard>
              ))}
            </View>
          ) : null}

          {matter.tasks && matter.tasks.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="h3" color={Colors.textPrimary}>
                Checklist & Action Items
              </AppText>
              {matter.tasks.map((task) => (
                <AppCard key={task._id} padding={Spacing.sm}>
                  <View style={styles.sectionTitleRow}>
                    {task.isCompleted ? (
                      <CheckCircle2 size={16} color={Colors.success} />
                    ) : (
                      <Clock size={16} color={Colors.warning} />
                    )}
                    <AppText variant="bodySmall" color={Colors.textPrimary} style={styles.flexOne}>
                      {task.title}
                    </AppText>
                    {task.dueDate ? (
                      <AppText variant="caption" color={Colors.textMuted}>
                        Due {formatDate(task.dueDate)}
                      </AppText>
                    ) : null}
                  </View>
                </AppCard>
              ))}
            </View>
          ) : null}

          {data?.consultations && data.consultations.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="h3" color={Colors.textPrimary}>
                Consultations
              </AppText>
              {data.consultations.map((c) => (
                <ConsultationCard
                  key={c._id}
                  consultation={c}
                  onPress={() => router.push(`/consultations/${c._id}` as never)}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <AppText variant="h3" color={Colors.textPrimary}>
              Documents ({data?.documents?.length || 0})
            </AppText>
            <DocumentUploader
              matterId={matter._id}
              documentType={matter.category}
              onUploaded={() => {
                refetch();
                showToast('Document attached to this matter', 'success');
              }}
            />
            {data?.documents?.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onPress={() => router.push(`/documents/${doc._id}` as never)}
                onDownload={() =>
                  downloadAndPreviewPrivateDocument(doc._id, doc.name, doc.mimeType).catch(() =>
                    showToast('Unable to open document', 'error')
                  )
                }
              />
            ))}
          </View>

          {matter.timeline && matter.timeline.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="h3" color={Colors.textPrimary}>
                Matter Progress Timeline
              </AppText>
              <AppCard>
                <MatterTimeline events={matter.timeline} />
              </AppCard>
            </View>
          ) : null}
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
    gap: Spacing.lg
  },
  overviewCard: {
    gap: Spacing.sm
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs
  },
  selectedPathBox: {
    backgroundColor: Colors.white,
    padding: Spacing.xs,
    borderRadius: 8
  },
  sectionCard: {
    gap: Spacing.sm
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs
  },
  lawyerBox: {
    gap: Spacing.xs
  },
  lawyerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4
  },
  section: {
    gap: Spacing.sm
  },
  flexOne: {
    flex: 1
  }
});
