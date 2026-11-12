import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { ConversationCard } from '@/components/legal/ConversationCard';
import { useConversations } from '@/hooks/useCustomerQueries';

export default function MessagesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: conversations, isLoading, isError, refetch, isRefetching } = useConversations();

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Messages"
        subtitle="Direct conversations with verified lawyers"
        showBack
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
          <AppErrorState title="Could not load conversations" onRetry={() => refetch()} />
        ) : !conversations || conversations.length === 0 ? (
          <AppEmptyState
            icon={<MessageSquare size={26} color={Colors.primary} />}
            title="No lawyer conversations yet"
            description="Visit any verified lawyer profile to start a confidential conversation about your legal question."
            actionLabel="Find Verified Lawyers"
            onAction={() => router.push('/(tabs)/lawyers')}
          />
        ) : (
          <View style={styles.listGap}>
            {conversations.map((convo) => (
              <ConversationCard
                key={convo._id}
                conversation={convo}
                onPress={() => router.push(`/messages/${convo._id}` as never)}
              />
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
  }
});
