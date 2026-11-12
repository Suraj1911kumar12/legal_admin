import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, MessageSquare } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextArea } from '@/components/ui/AppTextArea';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { LawyerProfileCard } from '@/components/legal/LawyerProfileCard';
import {
  useLawyerSlots,
  useMatters,
  useRequestConsultation,
  useStartConversation,
  useVerifiedLawyer
} from '@/hooks/useCustomerQueries';
import { useToast } from '@/components/ui/AppToast';
import { ApiClientError } from '@/services/api/apiClient';
import { triggerHaptic } from '@/utils/haptics';

function buildUpcomingDates(): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label =
      i === 0
        ? `Today (${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
        : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    days.push({ label, value: iso });
  }
  return days;
}

export default function LawyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data: lawyer, isLoading, isError, refetch } = useVerifiedLawyer(id || '');
  const { data: matters } = useMatters();
  const requestConsultation = useRequestConsultation();
  const startConversation = useStartConversation();

  const dateChoices = useMemo(() => buildUpcomingDates(), []);
  const [selectedDate, setSelectedDate] = useState(dateChoices[0].value);
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'in_person'>(
    'video'
  );
  const [selectedMatterId, setSelectedMatterId] = useState('');
  const [notes, setNotes] = useState('');

  const [bookSheetOpen, setBookSheetOpen] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [shareMatterSummary, setShareMatterSummary] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const { data: slotsData, isLoading: slotsLoading } = useLawyerSlots(
    id || '',
    bookSheetOpen ? selectedDate : ''
  );

  const matterOptions = [
    { label: 'No matter attached', value: '' },
    ...(matters || []).map((m) => ({
      label: `${m.matterReference} — ${m.title}`,
      value: m._id
    }))
  ];

  const allowedTypes = (lawyer?.consultationTypes || ['video']).map((t) => ({
    label: t === 'video' ? 'Video Call' : t === 'phone' ? 'Phone Call' : 'In-Person',
    value: t
  }));

  const handleOpenBooking = () => {
    const firstAllowed = (lawyer?.consultationTypes?.[0] as 'video' | 'phone' | 'in_person') || 'video';
    setConsultationType(firstAllowed);
    setSelectedTime('');
    setBookSheetOpen(true);
  };

  const handleBookSubmit = async () => {
    if (!lawyer) return;
    if (!selectedTime) {
      showToast('Please select an available time slot', 'error');
      return;
    }

    try {
      const created = await requestConsultation.mutateAsync({
        lawyerId: lawyer._id,
        matterId: selectedMatterId || undefined,
        date: selectedDate,
        time: selectedTime,
        timeZone: slotsData?.timeZone || 'Asia/Kolkata',
        type: consultationType,
        notes: notes.trim() || undefined
      });
      await triggerHaptic.success();
      setBookSheetOpen(false);
      showToast('Consultation request sent (pending lawyer confirmation)', 'success');
      router.push(`/consultations/${created._id}` as never);
    } catch (err) {
      showToast(
        err instanceof ApiClientError ? err.message : 'Unable to book consultation slot',
        'error'
      );
    }
  };

  const handleStartChat = async () => {
    if (!lawyer) return;
    try {
      const convo = await startConversation.mutateAsync({
        lawyerId: lawyer._id,
        matterId: selectedMatterId || undefined,
        shareMatterSummary: Boolean(selectedMatterId) && shareMatterSummary,
        initialMessage: initialMessage.trim() || undefined
      });
      setChatSheetOpen(false);
      setInitialMessage('');
      router.push(`/messages/${convo._id}` as never);
    } catch (err) {
      showToast(
        err instanceof ApiClientError ? err.message : 'Unable to start conversation',
        'error'
      );
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Advocate Profile" showBack />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading verified profile..." />
        </View>
      ) : isError || !lawyer ? (
        <View style={styles.center}>
          <AppErrorState title="Could not load lawyer profile" onRetry={() => refetch()} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 110 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <LawyerProfileCard lawyer={lawyer} />
          </ScrollView>

          <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            <AppButton
              title="Message"
              variant="outline"
              leftIcon={<MessageSquare size={17} color={Colors.primary} />}
              onPress={() => setChatSheetOpen(true)}
              style={styles.flexOne}
            />
            <AppButton
              title="Book Consultation"
              leftIcon={<Calendar size={17} color={Colors.white} />}
              onPress={handleOpenBooking}
              disabled={!lawyer.isAvailable}
              style={styles.flexTwo}
            />
          </View>
        </>
      )}

      <AppBottomSheet
        visible={bookSheetOpen}
        onClose={() => setBookSheetOpen(false)}
        title="Request Consultation"
      >
        <View style={styles.sheetForm}>
          <AppSelect
            label="Select Date"
            value={selectedDate}
            options={dateChoices}
            onSelect={(val: string) => {
              setSelectedDate(val);
              setSelectedTime('');
            }}
          />

          <View style={styles.slotSection}>
            <AppText variant="label" color={Colors.textPrimary}>
              Available Slots ({slotsData?.timeZone || 'Asia/Kolkata'})
            </AppText>
            {slotsLoading ? (
              <AppLoader size="small" />
            ) : !slotsData?.isLawyerAvailable ? (
              <AppText variant="bodySmall" color={Colors.warning}>
                This lawyer is currently marked unavailable for new bookings.
              </AppText>
            ) : (
              <View style={styles.slotsGrid}>
                {(slotsData?.slots || []).map((slot) => {
                  const active = selectedTime === slot.time;
                  return (
                    <Pressable
                      key={slot.time}
                      disabled={!slot.available}
                      onPress={() => setSelectedTime(slot.time)}
                      style={[
                        styles.slotChip,
                        !slot.available && styles.slotDisabled,
                        active && styles.slotActive
                      ]}
                    >
                      <AppText
                        variant="bodySmall"
                        weight={active ? 'semibold' : 'regular'}
                        color={
                          !slot.available
                            ? Colors.textMuted
                            : active
                              ? Colors.white
                              : Colors.textPrimary
                        }
                      >
                        {slot.time}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <AppSelect
            label="Consultation Mode"
            value={consultationType}
            options={allowedTypes}
            onSelect={(v: string) => setConsultationType(v as typeof consultationType)}
          />

          {matters && matters.length > 0 ? (
            <AppSelect
              label="Link to Saved Matter (Optional)"
              value={selectedMatterId}
              options={matterOptions}
              onSelect={setSelectedMatterId}
            />
          ) : null}

          <AppTextArea
            label="Brief note for the lawyer (Optional)"
            placeholder="Share your main question or document context..."
            value={notes}
            onChangeText={setNotes}
            minHeight={84}
          />

          <AppButton
            title="Submit Consultation Request"
            size="lg"
            fullWidth
            loading={requestConsultation.isPending}
            onPress={handleBookSubmit}
          />
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        visible={chatSheetOpen}
        onClose={() => setChatSheetOpen(false)}
        title={`Message ${lawyer?.fullName || 'Lawyer'}`}
      >
        <View style={styles.sheetForm}>
          {matters && matters.length > 0 ? (
            <>
              <AppSelect
                label="Related Matter (Optional)"
                value={selectedMatterId}
                options={matterOptions}
                onSelect={(val: string) => {
                  setSelectedMatterId(val);
                  if (!val) setShareMatterSummary(false);
                }}
              />
              {selectedMatterId ? (
                <AppCheckbox
                  checked={shareMatterSummary}
                  onChange={setShareMatterSummary}
                  label="Share selected matter summary with this lawyer"
                  description="You control whether your problem summary is visible in this thread."
                />
              ) : null}
            </>
          ) : null}

          <AppTextArea
            label="First Message (Optional)"
            placeholder="Introduce your legal question briefly..."
            value={initialMessage}
            onChangeText={setInitialMessage}
            minHeight={96}
          />

          <AppButton
            title="Start Conversation"
            size="lg"
            fullWidth
            loading={startConversation.isPending}
            onPress={handleStartChat}
          />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  scrollContent: {
    padding: Spacing.lg
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  flexOne: {
    flex: 1
  },
  flexTwo: {
    flex: 1.4
  },
  sheetForm: {
    gap: Spacing.md
  },
  slotSection: {
    gap: Spacing.xs
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs
  },
  slotChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface
  },
  slotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  slotDisabled: {
    backgroundColor: Colors.surfaceMuted,
    opacity: 0.55
  }
});
