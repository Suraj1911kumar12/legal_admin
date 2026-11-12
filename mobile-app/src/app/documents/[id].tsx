import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Download, FileText, Trash2 } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppErrorState } from '@/components/ui/AppErrorState';
import {
  useAssociateDocumentMatter,
  useDeleteDocument,
  useDocuments,
  useMatters
} from '@/hooks/useCustomerQueries';
import { useToast } from '@/components/ui/AppToast';
import { downloadAndPreviewPrivateDocument } from '@/features/documents/privateDownload';
import { formatDateTime, formatFileSize } from '@/utils/formatters';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data: docs, isLoading, isError, refetch } = useDocuments();
  const { data: matters } = useMatters();
  const associateMatter = useAssociateDocumentMatter();
  const deleteDoc = useDeleteDocument();
  const [opening, setOpening] = useState(false);

  const document = useMemo(() => docs?.find((d) => d._id === id), [docs, id]);

  const matterOptions = [
    { label: 'Not linked to any matter', value: '' },
    ...(matters || []).map((m) => ({
      label: `${m.matterReference} — ${m.title}`,
      value: m._id
    }))
  ];

  const handlePreview = async () => {
    if (!document) return;
    setOpening(true);
    try {
      await downloadAndPreviewPrivateDocument(document._id, document.name, document.mimeType);
    } catch {
      showToast('Unable to download or preview document', 'error');
    } finally {
      setOpening(false);
    }
  };

  const handleLinkMatter = async (matterId: string) => {
    if (!document) return;
    try {
      await associateMatter.mutateAsync({
        docId: document._id,
        matterId: matterId || null
      });
      showToast('Document matter link updated', 'success');
    } catch {
      showToast('Could not update linked matter', 'error');
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      await deleteDoc.mutateAsync(document._id);
      showToast('Document deleted', 'info');
      router.back();
    } catch {
      showToast('Could not delete document', 'error');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Document Details" showBack />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading document..." />
        </View>
      ) : isError || !document ? (
        <View style={styles.center}>
          <AppErrorState title="Document not found" onRetry={() => refetch()} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxl }
          ]}
        >
          <AppCard variant="sage" style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.iconWrap}>
                <FileText size={24} color={Colors.primary} />
              </View>
              <View style={styles.flexOne}>
                <AppText variant="h3" color={Colors.textPrimary}>
                  {document.name}
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary}>
                  {document.documentType} • {formatFileSize(document.fileSize)}
                </AppText>
              </View>
            </View>

            <View style={styles.metaRow}>
              <AppBadge
                label={document.reviewStatus.replace('_', ' ')}
                tone={
                  document.reviewStatus === 'reviewed'
                    ? 'success'
                    : document.reviewStatus === 'action_required'
                      ? 'warning'
                      : 'neutral'
                }
              />
              <AppText variant="caption" color={Colors.textSecondary}>
                Uploaded {formatDateTime(document.uploadedAt)}
              </AppText>
            </View>

            {document.reviewComments ? (
              <AppCard variant="default" padding={Spacing.sm}>
                <AppText variant="label" color={Colors.primary}>
                  Lawyer Review Comment
                </AppText>
                <AppText variant="bodySmall" color={Colors.textPrimary}>
                  {document.reviewComments}
                </AppText>
              </AppCard>
            ) : null}
          </AppCard>

          <AppButton
            title="Download & Preview Securely"
            size="lg"
            fullWidth
            leftIcon={<Download size={18} color={Colors.white} />}
            loading={opening}
            onPress={handlePreview}
          />

          {matters && matters.length > 0 ? (
            <AppCard>
              <AppSelect
                label="Associated Matter"
                value={document.matterId || ''}
                options={matterOptions}
                onSelect={handleLinkMatter}
              />
            </AppCard>
          ) : null}

          <AppButton
            title="Delete Document"
            variant="danger"
            leftIcon={<Trash2 size={16} color={Colors.white} />}
            loading={deleteDoc.isPending}
            onPress={handleDelete}
          />
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
    gap: Spacing.md
  },
  card: {
    gap: Spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexOne: {
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});

