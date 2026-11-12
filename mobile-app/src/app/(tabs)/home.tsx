import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import {
  Bell,
  Briefcase,
  Calendar,
  Compass,
  FileText,
  FileUp,
  MessageSquare,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { MatterCard } from '@/components/legal/MatterCard';
import { ConsultationCard } from '@/components/legal/ConsultationCard';
import { useAuth } from '@/features/auth/AuthContext';
import { useCustomerDashboard } from '@/hooks/useCustomerQueries';
import { secureStorage } from '@/services/storage/secureStorage';
import { localPreferences } from '@/services/storage/localStorage';
import {
  getPushPermissionStatus,
  registerForPushNotificationsAsync
} from '@/services/notifications/pushService';
import { useToast } from '@/components/ui/AppToast';
import { formatDateTime } from '@/utils/formatters';

interface ActionTile {
  id: string;
  label: string;
  subtitle: string;
  route: string;
  icon: React.ReactNode;
  tone?: 'sage' | 'default';
}

export default function HomeTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { customer } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, isError, refetch, isRefetching } = useCustomerDashboard(Boolean(customer));

  const [offlineDraftTitle, setOfflineDraftTitle] = useState<string | null>(null);
  const [showPushPromptCard, setShowPushPromptCard] = useState(false);

  useEffect(() => {
    secureStorage.getOfflineDraft().then((raw) => {
      if (!raw) {
        setOfflineDraftTitle(null);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.summary) {
          setOfflineDraftTitle(String(parsed.summary).slice(0, 60));
        }
      } catch {
        setOfflineDraftTitle(null);
      }
    });
  }, [isRefetching]);

  useEffect(() => {
    (async () => {
      const hasShownPrompt = await localPreferences.hasSeenNotificationExplainer();
      const status = await getPushPermissionStatus();
      const hasActivity =
        Boolean(data?.recentMatters?.length) ||
        Boolean(data?.upcomingConsultations?.length) ||
        Boolean(data?.recentDrafts?.length);

      if (!hasShownPrompt && status !== 'granted' && hasActivity) {
        setShowPushPromptCard(true);
      } else {
        setShowPushPromptCard(false);
      }
    })();
  }, [data]);

  const handleEnablePush = async () => {
    await localPreferences.setNotificationExplainerSeen();
    setShowPushPromptCard(false);
    const token = await registerForPushNotificationsAsync();
    if (token) {
      showToast('Push updates enabled for your matters & messages', 'success');
    } else {
      showToast('Notifications were not enabled on this device', 'info');
    }
  };

  const handleDismissPush = async () => {
    await localPreferences.setNotificationExplainerSeen();
    setShowPushPromptCard(false);
  };

  const primaryActions: ActionTile[] = [
    {
      id: 'describe',
      label: 'Describe Problem',
      subtitle: 'Guided intake step-by-step',
      route: '/intake/new',
      icon: <Compass size={20} color={Colors.primary} />,
      tone: 'sage'
    },
    {
      id: 'upload',
      label: 'Upload Document',
      subtitle: 'PDF, JPG, PNG securely',
      route: '/documents',
      icon: <FileUp size={20} color={Colors.primary} />
    },
    {
      id: 'ai',
      label: 'Ask AI Assistant',
      subtitle: 'Plain-language legal clarity',
      route: '/(tabs)/assistant',
      icon: <Sparkles size={20} color={Colors.primary} />
    },
    {
      id: 'lawyers',
      label: 'Find a Lawyer',
      subtitle: 'Bar-verified advocates',
      route: '/(tabs)/lawyers',
      icon: <Scale size={20} color={Colors.primary} />
    },
    {
      id: 'consultations',
      label: 'Consultations',
      subtitle: 'Upcoming & booked slots',
      route: '/consultations',
      icon: <Calendar size={20} color={Colors.primary} />
    },
    {
      id: 'messages',
      label: 'Messages',
      subtitle:
        data?.unreadMessagesCount && data.unreadMessagesCount > 0
          ? `${data.unreadMessagesCount} unread`
          : 'Lawyer conversations',
      route: '/messages',
      icon: <MessageSquare size={20} color={Colors.primary} />
    }
  ];

  const handleContinuePress = () => {
    if (!data?.continueItem) return;
    if (data.continueItem.type === 'draft') {
      router.push(`/intake/${data.continueItem.id}` as never);
    } else if (data.continueItem.type === 'ai_session') {
      router.push(`/assistant/${data.continueItem.id}` as never);
    } else {
      router.push(`/matters/${data.continueItem.id}` as never);
    }
  };

  const firstName = customer?.fullName?.split(' ')[0] || 'there';

  return (
    <View style={styles.screen}>
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <View style={styles.greetingCol}>
          <AppText variant="caption" color={Colors.primary} weight="semibold">
            LEGALDOST CITIZEN PORTAL
          </AppText>
          <AppText variant="h2" color={Colors.textPrimary}>
            Hello, {firstName}
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push('/notifications')}
          style={styles.bellBtn}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Bell size={20} color={Colors.primary} />
          {data?.unreadNotificationsCount && data.unreadNotificationsCount > 0 ? (
            <View style={styles.bellBadge}>
              <AppText variant="caption" color={Colors.white} weight="bold">
                {data.unreadNotificationsCount > 9 ? '9+' : data.unreadNotificationsCount}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      </View>

      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { void refetch(); }}
            tintColor={Colors.primary}
          />
        }
      >
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(260)}>
          <AppCard variant="highlight" style={styles.heroCard}>
            <AppText variant="h1" color={Colors.textPrimary} style={styles.heroQuestion}>
              How can LegalDost help you?
            </AppText>
            <AppText variant="bodySmall" color={Colors.textSecondary}>
              Start by explaining your situation, uploading a notice, or speaking with a verified
              lawyer.
            </AppText>
            <View style={styles.heroCtas}>
              <AppButton
                title="Start New Problem"
                size="md"
                onPress={() => router.push('/intake/new')}
                rightIcon={<ArrowRight size={16} color={Colors.white} />}
                style={styles.heroMainBtn}
              />
            </View>
          </AppCard>
        </Animated.View>

        {offlineDraftTitle ? (
          <AppCard
            variant="muted"
            onPress={() => router.push('/intake/new')}
            style={styles.offlineDraftCard}
          >
            <View style={styles.rowBetween}>
              <View style={styles.flexOne}>
                <AppBadge label="Saved Offline Draft" tone="warning" />
                <AppText variant="subtitle" color={Colors.textPrimary} style={styles.topMargin}>
                  {offlineDraftTitle}
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary}>
                  Tap to review and sync this draft when ready.
                </AppText>
              </View>
              <ArrowRight size={18} color={Colors.primary} />
            </View>
          </AppCard>
        ) : null}

        {showPushPromptCard ? (
          <AppCard variant="sage" style={styles.pushCard}>
            <AppText variant="subtitle" color={Colors.textPrimary}>
              Stay updated on consultations & lawyer replies
            </AppText>
            <AppText variant="bodySmall" color={Colors.textSecondary}>
              Turn on notifications so you never miss consultation confirmations or document review
              updates.
            </AppText>
            <View style={styles.pushActions}>
              <AppButton title="Enable Updates" size="sm" onPress={handleEnablePush} />
              <AppButton title="Not Now" variant="ghost" size="sm" onPress={handleDismissPush} />
            </View>
          </AppCard>
        ) : null}

        {isLoading ? (
          <View style={styles.skeletonStack}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : isError ? (
          <AppErrorState
            title="Could not load dashboard"
            message="Please check your connection or backend API URL and pull to refresh."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            {data?.continueItem ? (
              <Animated.View
                entering={reducedMotion ? undefined : FadeInDown.delay(60).duration(260)}
              >
                <AppCard variant="sage" onPress={handleContinuePress}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flexOne}>
                      <AppText variant="caption" color={Colors.primary} weight="semibold">
                        CONTINUE WHERE YOU LEFT OFF
                      </AppText>
                      <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1}>
                        {data.continueItem.title}
                      </AppText>
                      <AppText variant="caption" color={Colors.textSecondary}>
                        Updated {formatDateTime(data.continueItem.updatedAt)}
                      </AppText>
                    </View>
                    <ArrowRight size={18} color={Colors.primary} />
                  </View>
                </AppCard>
              </Animated.View>
            ) : null}

            <View style={styles.section}>
              <AppText variant="h3" color={Colors.textPrimary}>
                Quick Actions
              </AppText>
              <View style={styles.grid}>
                {primaryActions.map((item) => (
                  <AppCard
                    key={item.id}
                    variant={item.tone || 'default'}
                    onPress={() => router.push(item.route as never)}
                    style={styles.gridTile}
                    padding={Spacing.sm}
                  >
                    <View style={styles.tileIcon}>{item.icon}</View>
                    <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1}>
                      {item.label}
                    </AppText>
                    <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2}>
                      {item.subtitle}
                    </AppText>
                  </AppCard>
                ))}
              </View>
            </View>

            {data?.upcomingConsultations && data.upcomingConsultations.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText variant="h3" color={Colors.textPrimary}>
                    Upcoming Consultations
                  </AppText>
                  <Pressable onPress={() => router.push('/consultations')}>
                    <AppText variant="bodySmall" color={Colors.primary} weight="semibold">
                      See all
                    </AppText>
                  </Pressable>
                </View>
                <View style={styles.listGap}>
                  {data.upcomingConsultations.slice(0, 2).map((c) => (
                    <ConsultationCard
                      key={c._id}
                      consultation={c}
                      onPress={() => router.push(`/consultations/${c._id}` as never)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {data?.recentMatters && data.recentMatters.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText variant="h3" color={Colors.textPrimary}>
                    Recent Matters
                  </AppText>
                  <Pressable onPress={() => router.push('/(tabs)/matters')}>
                    <AppText variant="bodySmall" color={Colors.primary} weight="semibold">
                      View all
                    </AppText>
                  </Pressable>
                </View>
                <View style={styles.listGap}>
                  {data.recentMatters.slice(0, 2).map((m) => (
                    <MatterCard
                      key={m._id}
                      matter={m}
                      onPress={() => router.push(`/matters/${m._id}` as never)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <AppCard variant="default" style={styles.emptyWelcome}>
                <View style={styles.rowGap}>
                  <Briefcase size={20} color={Colors.primary} />
                  <View style={styles.flexOne}>
                    <AppText variant="subtitle" color={Colors.textPrimary}>
                      Your legal workspace is ready
                    </AppText>
                    <AppText variant="bodySmall" color={Colors.textSecondary}>
                      Once you describe a problem, upload a document, or save an option, everything
                      stays organized here.
                    </AppText>
                  </View>
                </View>
              </AppCard>
            )}

            {data?.recentDocuments && data.recentDocuments.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText variant="h3" color={Colors.textPrimary}>
                    Recent Documents
                  </AppText>
                  <Pressable onPress={() => router.push('/documents')}>
                    <AppText variant="bodySmall" color={Colors.primary} weight="semibold">
                      All docs
                    </AppText>
                  </Pressable>
                </View>
                <View style={styles.listGap}>
                  {data.recentDocuments.slice(0, 2).map((doc) => (
                    <AppCard
                      key={doc._id}
                      onPress={() => router.push(`/documents/${doc._id}` as never)}
                      padding={Spacing.sm}
                    >
                      <View style={styles.rowBetween}>
                        <View style={styles.rowGap}>
                          <FileText size={18} color={Colors.primary} />
                          <View>
                            <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1}>
                              {doc.name}
                            </AppText>
                            <AppText variant="caption" color={Colors.textSecondary}>
                              {doc.documentType} • {doc.reviewStatus.replace('_', ' ')}
                            </AppText>
                          </View>
                        </View>
                        <ArrowRight size={16} color={Colors.textMuted} />
                      </View>
                    </AppCard>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background
  },
  greetingCol: {
    gap: 2
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg
  },
  heroCard: {
    gap: Spacing.xs
  },
  heroQuestion: {
    lineHeight: 31
  },
  heroCtas: {
    flexDirection: 'row',
    marginTop: Spacing.xs
  },
  heroMainBtn: {
    alignSelf: 'flex-start'
  },
  offlineDraftCard: {
    borderColor: Colors.warning,
    borderWidth: 1
  },
  topMargin: {
    marginTop: 6
  },
  pushCard: {
    gap: Spacing.xs
  },
  pushActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs
  },
  skeletonStack: {
    gap: Spacing.sm
  },
  section: {
    gap: Spacing.sm
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm
  },
  gridTile: {
    width: '48%',
    minHeight: 112,
    justifyContent: 'space-between',
    gap: 4
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  listGap: {
    gap: Spacing.sm
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1
  },
  flexOne: {
    flex: 1
  },
  emptyWelcome: {
    padding: Spacing.md
  }
});
