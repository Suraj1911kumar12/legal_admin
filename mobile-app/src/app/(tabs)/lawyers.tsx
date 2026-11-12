import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Scale, SlidersHorizontal } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppSearchBar } from '@/components/ui/AppSearchBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { LawyerCard } from '@/components/legal/LawyerCard';
import { useVerifiedLawyers } from '@/hooks/useCustomerQueries';

const PRACTICE_AREAS = [
  'All',
  'Consumer Protection',
  'Property & Real Estate',
  'Family Law',
  'Employment & Labour',
  'Criminal Law',
  'Cyber Crime',
  'Contract & Civil'
];

export default function LawyersTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [practiceArea, setPracticeArea] = useState('All');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [consultationType, setConsultationType] = useState('all');
  const [minExperience, setMinExperience] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const queryFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      practiceArea: practiceArea !== 'All' ? practiceArea : undefined,
      city: city.trim() || undefined,
      language: language.trim() || undefined,
      consultationType: consultationType !== 'all' ? consultationType : undefined,
      minExperience: minExperience.trim() || undefined,
      maxFee: maxFee.trim() || undefined,
      limit: 30
    }),
    [search, practiceArea, city, language, consultationType, minExperience, maxFee]
  );

  const { data, isLoading, isError, refetch, isRefetching } = useVerifiedLawyers(queryFilters);
  const lawyers = data?.data || [];

  const activeFilterCount = [
    city.trim(),
    language.trim(),
    consultationType !== 'all' ? consultationType : '',
    minExperience.trim(),
    maxFee.trim()
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearch('');
    setPracticeArea('All');
    setCity('');
    setLanguage('');
    setConsultationType('all');
    setMinExperience('');
    setMaxFee('');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <View style={styles.headerText}>
          <AppText variant="h1" color={Colors.textPrimary}>
            Verified Lawyers
          </AppText>
          <AppText variant="caption" color={Colors.textSecondary}>
            Bar-verified advocates ready for private consultations
          </AppText>
        </View>
        <Pressable
          onPress={() => setShowFilters(true)}
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Filter lawyers"
        >
          <SlidersHorizontal
            size={18}
            color={activeFilterCount > 0 ? Colors.white : Colors.primary}
          />
          <AppText
            variant="label"
            color={activeFilterCount > 0 ? Colors.white : Colors.primary}
          >
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filter'}
          </AppText>
        </Pressable>
      </View>

      <OfflineBanner />

      <View style={styles.controls}>
        <AppSearchBar
          placeholder="Search name, city, or legal issue..."
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.areaRow}
        >
          {PRACTICE_AREAS.map((area) => {
            const selected = practiceArea === area;
            return (
              <Pressable
                key={area}
                onPress={() => setPracticeArea(area)}
                style={[styles.areaPill, selected && styles.areaPillActive]}
              >
                <AppText
                  variant="bodySmall"
                  weight={selected ? 'semibold' : 'regular'}
                  color={selected ? Colors.white : Colors.textPrimary}
                >
                  {area}
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
        {isLoading ? (
          <View style={styles.listGap}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : isError ? (
          <AppErrorState
            title="Could not load verified lawyers"
            onRetry={() => refetch()}
          />
        ) : lawyers.length === 0 ? (
          <AppEmptyState
            icon={<Scale size={26} color={Colors.primary} />}
            title="No verified lawyers match these filters"
            description="Try widening your city, fee, or practice area filters to discover more verified lawyers."
            actionLabel="Reset Filters"
            onAction={resetAllFilters}
          />
        ) : (
          <View style={styles.listGap}>
            {lawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer._id}
                lawyer={lawyer}
                onPress={() => router.push(`/lawyers/${lawyer._id}` as never)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AppBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Verified Lawyers"
      >
        <View style={styles.sheetForm}>
          <AppInput
            label="City"
            placeholder="e.g., Delhi, Mumbai, Bengaluru"
            value={city}
            onChangeText={setCity}
          />
          <AppInput
            label="Language Spoken"
            placeholder="e.g., English, Hindi, Marathi"
            value={language}
            onChangeText={setLanguage}
          />
          <AppSelect
            label="Consultation Mode"
            value={consultationType}
            options={[
              { label: 'Any Mode', value: 'all' },
              { label: 'Video Call', value: 'video' },
              { label: 'Phone Call', value: 'phone' },
              { label: 'In-Person', value: 'in_person' }
            ]}
            onSelect={setConsultationType}
          />
          <View style={styles.twoCol}>
            <AppInput
              label="Min Experience (yrs)"
              placeholder="e.g., 3"
              keyboardType="numeric"
              value={minExperience}
              onChangeText={setMinExperience}
              containerStyle={styles.colItem}
            />
            <AppInput
              label="Max Fee (₹)"
              placeholder="e.g., 2000"
              keyboardType="numeric"
              value={maxFee}
              onChangeText={setMaxFee}
              containerStyle={styles.colItem}
            />
          </View>
          <View style={styles.sheetActions}>
            <AppButton
              title="Reset"
              variant="outline"
              onPress={() => {
                resetAllFilters();
                setShowFilters(false);
              }}
              style={styles.colItem}
            />
            <AppButton
              title="Apply Filters"
              onPress={() => setShowFilters(false)}
              style={styles.colItem}
            />
          </View>
        </View>
      </AppBottomSheet>
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
    paddingBottom: Spacing.sm,
    gap: Spacing.sm
  },
  headerText: {
    flex: 1,
    gap: 2
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  controls: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm
  },
  areaRow: {
    gap: Spacing.xs,
    paddingVertical: 2
  },
  areaPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border
  },
  areaPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl
  },
  listGap: {
    gap: Spacing.sm
  },
  sheetForm: {
    gap: Spacing.md
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  colItem: {
    flex: 1
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs
  }
});
