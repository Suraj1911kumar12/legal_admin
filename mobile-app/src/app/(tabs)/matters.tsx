import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase, FileEdit, Plus, ArrowRight } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppSearchBar } from '@/components/ui/AppSearchBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { MatterCard } from '@/components/legal/MatterCard';
import { useIntakes, useMatters } from '@/hooks/useCustomerQueries';
import { formatDateTime } from '@/utils/formatters';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'intake', label: 'Intake' },
  { key: 'active', label: 'Active' },
  { key: 'pending_court', label: 'Court' },
  { key: 'under_negotiation', label: 'Negotiation' },
  { key: 'resolved', label: 'Resolved' }
];

export default function MattersTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const {
    data: matters,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useMatters(statusFilter === 'all' ? undefined : statusFilter);

  const { data: drafts } = useIntakes(true);

  const filteredMatters = useMemo(() => {
    if (!matters) return [];
    const term = search.trim().toLowerCase();
    if (!term) return matters;
    return matters.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term) ||
        m.matterReference.toLowerCase().includes(term)
    );
  }, [matters, search]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <View>
          <AppText variant="h1" color={Colors.textPrimary}>
            My Matters
          </AppText>
          <AppText variant="caption" color={Colors.textSecondary}>
            Track your legal issues, updates, and drafts
          </AppText>
        </View>
        <AppButton
          title="New"
          size="sm"
          leftIcon={<Plus size={16} color={Colors.white} />}
          onPress={() => router.push('/intake/new')}
        />
      </View>

      <OfflineBanner />

      <View style={styles.controls}>
        <AppSearchBar
          placeholder="Search matters by title, category, or ID..."
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map((f) => {
            const selected = statusFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setStatusFilter(f.key)}
                style={[styles.filterPill, selected && styles.filterPillActive]}
              >
                <AppText
                  variant="bodySmall"
                  weight={selected ? 'semibold' : 'regular'}
                  color={selected ? Colors.white : Colors.textPrimary}
                >
                  {f.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { void refetch(); }}
            tintColor={Colors.primary}
          />
        }
      >
        {drafts && drafts.length > 0 && statusFilter === 'all' ? (
          <View style={styles.draftsSection}>
            <AppText variant="label" color={Colors.primary}>
              Saved Drafts ({drafts.length})
            </AppText>
            {drafts.map((draft) => (
              <AppCard
                key={draft._id}
                variant="muted"
                onPress={() => router.push(`/intake/${draft._id}` as never)}
              >
                <View style={styles.draftRow}>
                  <View style={styles.draftMeta}>
                    <AppBadge label="Draft" tone="warning" icon={<FileEdit size={11} color="#9A6B22" />} />
                    <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1}>
                      {draft.summary || draft.category || 'Untitled draft'}
                    </AppText>
                    <AppText variant="caption" color={Colors.textSecondary}>
                      Saved {formatDateTime(draft.updatedAt)}
                    </AppText>
                  </View>
                  <ArrowRight size={16} color={Colors.primary} />
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.listGap}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : isError ? (
          <AppErrorState
            title="Could not load matters"
            onRetry={() => refetch()}
          />
        ) : filteredMatters.length === 0 ? (
          <AppEmptyState
            icon={<Briefcase size={26} color={Colors.primary} />}
            title={search ? 'No matching matters' : 'No saved legal matters yet'}
            description={
              search
                ? 'Try clearing your search or switching status filters.'
                : 'Describe a legal problem or explore solutions in AI Help to save and track your first matter.'
            }
            actionLabel={search ? 'Clear Search' : 'Describe a Problem'}
            onAction={() => (search ? setSearch('') : router.push('/intake/new'))}
          />
        ) : (
          <View style={styles.listGap}>
            {filteredMatters.map((matter) => (
              <MatterCard
                key={matter._id}
                matter={matter}
                onPress={() => router.push(`/matters/${matter._id}` as never)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm
  },
  controls: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm
  },
  filterRow: {
    gap: Spacing.xs,
    paddingVertical: 2
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md
  },
  draftsSection: {
    gap: Spacing.xs
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm
  },
  draftMeta: {
    flex: 1,
    gap: 4
  },
  listGap: {
    gap: Spacing.sm
  }
});
