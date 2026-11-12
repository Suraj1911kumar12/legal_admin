import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { ConsultationCard } from '@/components/legal/ConsultationCard';
import { useConsultations } from '@/hooks/useCustomerQueries';

export default function ConsultationsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: consultations, isLoading, isError, refetch, isRefetching } = useConsultations();

  return (
    <View style={styles.screen}>
      <AppHeader
        title="My Consultations"
        subtitle="Booked slots & appointment updates"
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
          <AppErrorState title="Could not load consultations" onRetry={() => refetch()} />
        ) : !consultations || consultations.length === 0 ? (
          <AppEmptyState
            icon={<Calendar size={26} color={Colors.primary} />}
            title="No consultations booked yet"
            description="Browse verified lawyers to inspect available slots and book a private consultation."
            actionLabel="Browse Verified Lawyers"
            onAction={() => router.push('/(tabs)/lawyers')}
          />
        ) : (
          <View style={styles.listGap}>
            {consultations.map((c) => (
              <ConsultationCard
                key={c._id}
                consultation={c}
                onPress={() => router.push(`/consultations/${c._id}` as never)}
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
