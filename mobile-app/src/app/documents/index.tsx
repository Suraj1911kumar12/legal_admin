import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { SkeletonCard } from '@/components/ui/AppSkeleton';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { DocumentUploader } from '@/components/legal/DocumentUploader';
import { DocumentCard } from '@/components/legal/DocumentCard';
import { useDeleteDocument, useDocuments, useMatters } from '@/hooks/useCustomerQueries';
import { useToast } from '@/components/ui/AppToast';
import { downloadAndPreviewPrivateDocument } from '@/features/documents/privateDownload';
import { CustomerDocument } from '@/types/customer';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';

const DOC_TYPES = [
  { label: 'Legal Notice / Letter', value: 'Legal Notice' },
  { label: 'Contract / Agreement', value: 'Contract / Agreement' },
  { label: 'Receipt / Invoice / Payment Proof', value: 'Payment Proof' },
  { label: 'Court / Police Document', value: 'Court / Official Record' },
  { label: 'ID / Address Verification', value: 'Identity / Proof' },
  { label: 'General Evidence / Other', value: 'General Evidence' }
];

export default function DocumentVaultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [selectedDocType, setSelectedDocType] = useState('Legal Notice');
  const [selectedMatterId, setSelectedMatterId] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<CustomerDocument | null>(null);

  const { data: docs, isLoading, isError, refetch, isRefetching } = useDocuments();
  const { data: matters } = useMatters();
  const deleteDoc = useDeleteDocument();

  const matterOptions = [
    { label: 'Personal Vault (Not linked to a matter)', value: '' },
    ...(matters || []).map((m) => ({
      label: `${m.matterReference} — ${m.title}`,
      value: m._id
    }))
  ];

  const handleOpenDocument = async (doc: CustomerDocument) => {
    try {
      await downloadAndPreviewPrivateDocument(doc._id, doc.name, doc.mimeType);
    } catch {
      showToast('Could not open document preview right now', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
      showToast('Document removed from vault', 'success');
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Document Vault"
        subtitle="Private authorized storage (PDF, JPG, PNG)"
        showBack
      />

      <OfflineBanner />

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
        <View style={styles.uploadBox}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Upload New Document
          </AppText>
          <AppSelect
            label="Document Category"
            value={selectedDocType}
            options={DOC_TYPES}
            onSelect={setSelectedDocType}
          />
          {matters && matters.length > 0 ? (
            <AppSelect
              label="Link to Matter (Optional)"
              value={selectedMatterId}
              options={matterOptions}
              onSelect={setSelectedMatterId}
            />
          ) : null}

          <DocumentUploader
            documentType={selectedDocType}
            matterId={selectedMatterId || undefined}
            onUploaded={() => {
              refetch();
              showToast('Document uploaded securely', 'success');
            }}
          />
        </View>

        <View style={styles.listSection}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Your Uploaded Documents ({docs?.length || 0})
          </AppText>

          {isLoading ? (
            <SkeletonCard />
          ) : isError ? (
            <AppErrorState title="Could not load documents" onRetry={() => refetch()} />
          ) : !docs || docs.length === 0 ? (
            <AppEmptyState
              icon={<FileText size={26} color={Colors.primary} />}
              title="Your vault is empty"
              description="Upload contracts, notices, bills, or IDs here. Documents stay private unless shared with an assigned lawyer."
            />
          ) : (
            <View style={styles.listGap}>
              {docs.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onPress={() => router.push(`/documents/${doc._id}` as never)}
                  onDownload={() => handleOpenDocument(doc)}
                  onDelete={() => setDeleteTarget(doc)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <AppModal
        visible={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this document?"
      >
        <View style={styles.modalBody}>
          <AppText variant="body" color={Colors.textSecondary}>
            “{deleteTarget?.name}” will be removed permanently from LegalDost.
          </AppText>
          <View style={styles.modalActions}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => setDeleteTarget(null)}
              style={styles.flexOne}
            />
            <AppButton
              title="Delete"
              variant="danger"
              loading={deleteDoc.isPending}
              onPress={handleConfirmDelete}
              style={styles.flexOne}
            />
          </View>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.xl
  },
  uploadBox: {
    gap: Spacing.sm
  },
  listSection: {
    gap: Spacing.sm
  },
  listGap: {
    gap: Spacing.sm
  },
  modalBody: {
    gap: Spacing.md
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  flexOne: {
    flex: 1
  }
});
