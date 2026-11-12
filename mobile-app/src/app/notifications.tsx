import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, CheckCheck } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import {
  useCustomerNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead
} from '@/hooks/useCustomerQueries';
import { formatDateTime } from '@/utils/formatters';
import { CustomerNotification } from '@/types/customer';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: notifications, isLoading, isError, refetch, isRefetching } =
    useCustomerNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleOpenNotification = (item: CustomerNotification) => {
    if (!item.isRead) {
      markRead.mutate(item._id);
    }
    if (item.link && item.link.startsWith('/')) {
      router.push(item.link as never);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
        rightActions={
          unreadCount > 0 ? (
            <Pressable
              onPress={() => markAllRead.mutate()}
              hitSlop={8}
              accessibilityLabel="Mark all read"
            >
              <CheckCheck size={20} color={Colors.primary} />
            </Pressable>
          ) : null
        }
      />

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
        {isLoading ? (
          <View style={styles.listGap}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : isError ? (
          <AppErrorState title="Could not load notifications" onRetry={() => refetch()} />
        ) : !notifications || notifications.length === 0 ? (
          <AppEmptyState
            icon={<Bell size={26} color={Colors.primary} />}
            title="No notifications yet"
            description="Consultation confirmations, lawyer messages, and matter updates will appear here."
          />
        ) : (
          <View style={styles.listGap}>
            {notifications.map((item) => (
              <AppCard
                key={item._id}
                variant={item.isRead ? 'default' : 'sage'}
                onPress={() => handleOpenNotification(item)}
              >
                <View style={styles.topRow}>
                  <AppText variant="subtitle" color={Colors.textPrimary} style={styles.flexOne}>
                    {item.title}
                  </AppText>
                  {!item.isRead ? <AppBadge label="New" tone="primary" /> : null}
                </View>
                <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.message}>
                  {item.message}
                </AppText>
                <AppText variant="caption" color={Colors.textMuted}>
                  {formatDateTime(item.createdAt)}
                </AppText>
              </AppCard>
            ))}
          </View>
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
  scrollContent: {
    padding: Spacing.lg
  },
  listGap: {
    gap: Spacing.sm
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs
  },
  flexOne: {
    flex: 1
  },
  message: {
    marginVertical: 4
  }
});
