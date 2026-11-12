import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Briefcase,
  Building2,
  FileWarning,
  HeartHandshake,
  HelpCircle,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2
} from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextArea } from '@/components/ui/AppTextArea';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppProgressIndicator } from '@/components/ui/AppProgressIndicator';
import { AppModal } from '@/components/ui/AppModal';
import { LegalCategoryCard } from '@/components/legal/LegalCategoryCard';
import { DocumentUploader } from '@/components/legal/DocumentUploader';
import { DocumentCard } from '@/components/legal/DocumentCard';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/AppToast';
import {
  useCreateAISession,
  useCreateMatter,
  useDeleteDraft,
  useIntake,
  useSaveIntake
} from '@/hooks/useCustomerQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { secureStorage } from '@/services/storage/secureStorage';
import { ApiClientError } from '@/services/api/apiClient';
import { CustomerDocument } from '@/types/customer';
import { triggerHaptic } from '@/utils/haptics';

const CATEGORIES = [
  {
    key: 'Property & Tenancy',
    subtitle: 'Rental deposit, eviction notices, property sale or boundary disputes',
    icon: <Building2 size={18} color={Colors.primary} />
  },
  {
    key: 'Consumer Protection',
    subtitle: 'Defective products, denied refunds, warranty or service complaints',
    icon: <ShoppingBag size={18} color={Colors.primary} />
  },
  {
    key: 'Employment & Salary',
    subtitle: 'Unpaid wages, wrongful termination, PF or notice period issues',
    icon: <Briefcase size={18} color={Colors.primary} />
  },
  {
    key: 'Family & Matrimonial',
    subtitle: 'Maintenance, custody, divorce, or inheritance clarity',
    icon: <HeartHandshake size={18} color={Colors.primary} />
  },
  {
    key: 'Cyber & Online Fraud',
    subtitle: 'UPI/bank scams, impersonation, online harassment or account theft',
    icon: <ShieldAlert size={18} color={Colors.primary} />
  },
  {
    key: 'Notices & Contracts',
    subtitle: 'Legal notices received, loan agreements, cheque bounce or contract breach',
    icon: <FileWarning size={18} color={Colors.primary} />
  },
  {
    key: 'Not Sure / Other',
    subtitle: 'Describe what happened in your own words — LegalDost will help classify it',
    icon: <HelpCircle size={18} color={Colors.primary} />
  }
];

const EXAMPLE_PROMPTS = [
  'Landlord refuses to return my ₹60,000 security deposit despite 30 days notice.',
  'My employer terminated my contract without paying last 2 months salary.',
  'I received a demand notice and need help understanding my options.'
];

export interface IntakeWorkflowViewProps {
  draftId?: string;
}

export const IntakeWorkflowView: React.FC<IntakeWorkflowViewProps> = ({ draftId }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const { showToast } = useToast();
  const { isConnected } = useNetworkStatus();

  const existingIntake = useIntake(draftId || '');
  const saveIntake = useSaveIntake();
  const deleteDraft = useDeleteDraft();
  const createAISession = useCreateAISession();
  const createMatter = useCreateMatter();

  const [submissionKey] = useState(
    () => `intake-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('Not Sure / Other');
  const [summary, setSummary] = useState('');
  const [specificQuestion, setSpecificQuestion] = useState('');
  const [location, setLocation] = useState(customer?.city || '');
  const [preferredLanguage, setPreferredLanguage] = useState(customer?.preferredLanguage || 'en');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [uploadedDocs, setUploadedDocs] = useState<CustomerDocument[]>([]);
  const [discardOpen, setDiscardOpen] = useState(false);

  // Hydrate existing backend draft or offline encrypted draft
  useEffect(() => {
    if (draftId && existingIntake.data) {
      const d = existingIntake.data;
      setCategory(d.category || 'Not Sure / Other');
      setSummary(d.summary || '');
      setSpecificQuestion(d.specificQuestion || '');
      setLocation(d.customerLocation || customer?.city || '');
      setPreferredLanguage(d.preferredLanguage || customer?.preferredLanguage || 'en');
      setUrgency(d.urgency || 'medium');
      return;
    }

    if (!draftId) {
      secureStorage.getOfflineDraft().then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.summary) setSummary(parsed.summary);
          if (parsed.specificQuestion) setSpecificQuestion(parsed.specificQuestion);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.urgency) setUrgency(parsed.urgency);
        } catch {
          // ignore malformed local draft
        }
      });
    }
  }, [draftId, existingIntake.data, customer?.city, customer?.preferredLanguage]);

  const persistOfflineFallback = async () => {
    await secureStorage.saveOfflineDraft(
      JSON.stringify({
        category,
        summary,
        specificQuestion,
        location,
        preferredLanguage,
        urgency,
        savedAt: new Date().toISOString()
      })
    );
  };

  const handleSaveDraft = async () => {
    if (!summary.trim()) {
      showToast('Please write a brief summary before saving a draft.', 'error');
      return;
    }

    if (!isConnected) {
      await persistOfflineFallback();
      showToast('Saved offline on this device. You can sync when online.', 'info');
      router.back();
      return;
    }

    try {
      await saveIntake.mutateAsync({
        id: draftId,
        category,
        summary: summary.trim(),
        specificQuestion: specificQuestion.trim(),
        customerLocation: location.trim() || 'India',
        preferredLanguage,
        urgency,
        isDraft: true,
        documentIds: uploadedDocs.map((d) => d._id),
        clientSubmissionKey: submissionKey
      });
      await secureStorage.clearOfflineDraft();
      await triggerHaptic.success();
      showToast('Draft saved to your account', 'success');
      router.replace('/(tabs)/matters');
    } catch {
      await persistOfflineFallback();
      showToast('Saved locally on this device — could not reach server.', 'info');
    }
  };

  const handleSubmit = async () => {
    if (summary.trim().length < 15) {
      showToast('Please describe your problem in at least a sentence or two.', 'error');
      setStep(2);
      return;
    }

    try {
      const intake = await saveIntake.mutateAsync({
        id: draftId,
        category,
        summary: summary.trim(),
        specificQuestion: specificQuestion.trim(),
        customerLocation: location.trim() || 'India',
        preferredLanguage,
        urgency,
        isDraft: false,
        documentIds: uploadedDocs.map((d) => d._id),
        clientSubmissionKey: submissionKey
      });
      await secureStorage.clearOfflineDraft();
      await triggerHaptic.success();

      try {
        const aiSession = await createAISession.mutateAsync({
          intakeId: intake._id,
          title: summary.trim().slice(0, 70),
          preferredLanguage
        });
        router.replace(`/assistant/${aiSession._id}` as never);
      } catch {
        // If AI session cannot initialize, create/open matter safely
        const matter = await createMatter.mutateAsync({
          title: summary.trim().slice(0, 70),
          category,
          description: summary.trim(),
          intakeId: intake._id
        });
        showToast('Problem saved as a matter in My Matters', 'success');
        router.replace(`/matters/${matter._id}` as never);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.isNetworkError) {
        await persistOfflineFallback();
        showToast('Offline right now — saved encrypted draft on this device.', 'info');
      } else {
        showToast(
          err instanceof ApiClientError ? err.message : 'Unable to submit right now.',
          'error'
        );
      }
    }
  };

  const handleDiscardDraft = async () => {
    setDiscardOpen(false);
    await secureStorage.clearOfflineDraft();
    if (draftId) {
      try {
        await deleteDraft.mutateAsync(draftId);
      } catch {
        // ignore if already removed
      }
    }
    showToast('Draft discarded', 'info');
    router.back();
  };

  const stepProgress = step / 3;

  return (
    <View style={styles.screen}>
      <AppHeader
        title={draftId ? 'Resume Draft' : 'Describe Legal Problem'}
        subtitle={`Step ${step} of 3`}
        showBack
        rightActions={
          draftId ? (
            <Pressable onPress={() => setDiscardOpen(true)} hitSlop={8}>
              <Trash2 size={20} color={Colors.danger} />
            </Pressable>
          ) : null
        }
      />

      <OfflineBanner />

      <View style={styles.progressBar}>
        <AppProgressIndicator progress={stepProgress} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxl }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            <View style={styles.stepSection}>
              <AppText variant="h2" color={Colors.textPrimary}>
                What kind of issue is this?
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Pick the closest topic. Do not worry if you are unsure — choose &quot;Not Sure / Other&quot;.
              </AppText>

              <View style={styles.categoryList}>
                {CATEGORIES.map((cat) => (
                  <LegalCategoryCard
                    key={cat.key}
                    title={cat.key}
                    subtitle={cat.subtitle}
                    icon={cat.icon}
                    selected={category === cat.key}
                    onPress={() => {
                      triggerHaptic.selection();
                      setCategory(cat.key);
                    }}
                  />
                ))}
              </View>

              <AppButton title="Continue to Details" size="lg" fullWidth onPress={() => setStep(2)} />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.stepSection}>
              <AppText variant="h2" color={Colors.textPrimary}>
                Tell us what happened
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Include dates, amounts, notices received, or what the other side said.
              </AppText>

              <View style={styles.examplesBox}>
                <AppText variant="caption" color={Colors.primary} weight="semibold">
                  Tap an example to fill quickly:
                </AppText>
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setSummary(ex)}
                    style={styles.exampleChip}
                  >
                    <AppText variant="caption" color={Colors.textPrimary}>
                      “{ex}”
                    </AppText>
                  </Pressable>
                ))}
              </View>

              <AppTextArea
                label="What happened? *"
                placeholder="Write in simple everyday words..."
                value={summary}
                onChangeText={setSummary}
                minHeight={130}
              />

              <AppTextArea
                label="Your main question (Optional)"
                placeholder="e.g., Can I claim a refund or send a notice?"
                value={specificQuestion}
                onChangeText={setSpecificQuestion}
                minHeight={84}
              />

              <View style={styles.twoCol}>
                <AppInput
                  label="City / State"
                  placeholder="e.g., Pune, Maharashtra"
                  value={location}
                  onChangeText={setLocation}
                  containerStyle={styles.flex}
                />
                <View style={styles.flex}>
                  <AppSelect
                    label="Urgency"
                    value={urgency}
                    options={[
                      { label: 'Low', value: 'low' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'High', value: 'high' },
                      { label: 'Urgent', value: 'urgent' }
                    ]}
                    onSelect={(val: string) => setUrgency(val as typeof urgency)}
                  />
                </View>
              </View>

              <AppSelect
                label="Preferred Explanation Language"
                value={preferredLanguage}
                options={[
                  { label: 'English', value: 'en' },
                  { label: 'Hindi (हिन्दी)', value: 'hi' },
                  { label: 'Marathi (मराठी)', value: 'mr' },
                  { label: 'Tamil (தமிழ்)', value: 'ta' },
                  { label: 'Telugu (తెలుగు)', value: 'te' }
                ]}
                onSelect={setPreferredLanguage}
              />

              <View style={styles.navActions}>
                <AppButton
                  title="Back"
                  variant="outline"
                  onPress={() => setStep(1)}
                  style={styles.flex}
                />
                <AppButton
                  title="Next: Documents"
                  onPress={() => {
                    if (summary.trim().length < 10) {
                      showToast('Please write a short description of your problem first.', 'error');
                      return;
                    }
                    setStep(3);
                  }}
                  style={styles.flex}
                />
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.stepSection}>
              <AppText variant="h2" color={Colors.textPrimary}>
                Attach documents (Optional)
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Upload agreements, receipts, or notices if you have them handy. You can also skip and
                upload later.
              </AppText>

              <DocumentUploader
                queryId={draftId}
                documentType={category}
                onUploaded={(doc) => setUploadedDocs((prev) => [doc, ...prev])}
              />

              {uploadedDocs.length > 0 ? (
                <View style={styles.docsList}>
                  {uploadedDocs.map((doc) => (
                    <DocumentCard key={doc._id} document={doc} />
                  ))}
                </View>
              ) : null}

              <AppCard variant="sage" style={styles.reviewCard}>
                <AppText variant="label" color={Colors.primary}>
                  REVIEW YOUR SUMMARY
                </AppText>
                <AppText variant="subtitle" color={Colors.textPrimary}>
                  {category}
                </AppText>
                <AppText variant="bodySmall" color={Colors.textSecondary}>
                  {summary}
                </AppText>
              </AppCard>

              <View style={styles.submitStack}>
                <AppButton
                  title="Submit & Get Clarity"
                  size="lg"
                  fullWidth
                  leftIcon={<Sparkles size={18} color={Colors.white} />}
                  loading={
                    saveIntake.isPending || createAISession.isPending || createMatter.isPending
                  }
                  onPress={handleSubmit}
                />
                <View style={styles.navActions}>
                  <AppButton
                    title="Back"
                    variant="outline"
                    onPress={() => setStep(2)}
                    style={styles.flex}
                  />
                  <AppButton
                    title="Save Draft"
                    variant="secondary"
                    loading={saveIntake.isPending}
                    onPress={handleSaveDraft}
                    style={styles.flex}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard this draft?"
      >
        <View style={styles.modalBody}>
          <AppText variant="body" color={Colors.textSecondary}>
            This will remove your saved draft permanently.
          </AppText>
          <View style={styles.navActions}>
            <AppButton
              title="Keep Draft"
              variant="outline"
              onPress={() => setDiscardOpen(false)}
              style={styles.flex}
            />
            <AppButton
              title="Discard"
              variant="danger"
              onPress={handleDiscardDraft}
              style={styles.flex}
            />
          </View>
        </View>
      </AppModal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  flex: {
    flex: 1
  },
  progressBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg
  },
  stepSection: {
    gap: Spacing.md
  },
  categoryList: {
    gap: Spacing.sm
  },
  examplesBox: {
    gap: Spacing.xs
  },
  exampleChip: {
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sage,
    borderRadius: Radii.md,
    padding: Spacing.sm
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  docsList: {
    gap: Spacing.xs
  },
  reviewCard: {
    gap: 6
  },
  submitStack: {
    gap: Spacing.sm,
    marginTop: Spacing.xs
  },
  navActions: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  modalBody: {
    gap: Spacing.md
  }
});
