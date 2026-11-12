import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FileText, Image as ImageIcon, Trash2, Download } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppBadge, BadgeTone } from '../ui/AppBadge';
import { IconButton } from '../ui/IconButton';
import { CustomerDocument } from '@/types/customer';
import { formatDate, formatFileSize } from '@/utils/formatters';

export interface DocumentCardProps {
  document: CustomerDocument;
  onPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  onDownload,
  onDelete
}) => {
  const isImage = document.mimeType?.startsWith('image/');

  const toneMap: Record<string, BadgeTone> = {
    pending: 'neutral',
    reviewed: 'success',
    action_required: 'warning'
  };

  const statusLabel =
    document.reviewStatus === 'action_required'
      ? 'Action Needed'
      : document.reviewStatus === 'reviewed'
      ? 'Reviewed'
      : 'Uploaded';

  return (
    <AppCard onPress={onPress} style={styles.card} accessibilityLabel={document.name}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          {isImage ? (
            <ImageIcon size={20} color={Colors.primary} />
          ) : (
            <FileText size={20} color={Colors.primary} />
          )}
        </View>

        <View style={styles.infoCol}>
          <AppText variant="bodySmall" weight="semibold" color={Colors.textPrimary} numberOfLines={1}>
            {document.name}
          </AppText>
          <AppText variant="caption" color={Colors.textSecondary} style={styles.meta}>
            {formatFileSize(document.fileSize)} • {formatDate(document.uploadedAt)}
          </AppText>
          <View style={styles.badgeWrap}>
            <AppBadge label={statusLabel} tone={toneMap[document.reviewStatus] || 'neutral'} />
          </View>
        </View>

        <View style={styles.actions}>
          {onDownload && (
            <IconButton
              icon={<Download size={16} color={Colors.primary} />}
              onPress={onDownload}
              accessibilityLabel={`Open ${document.name}`}
              size={36}
              variant="sage"
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 size={16} color={Colors.danger} />}
              onPress={onDelete}
              accessibilityLabel={`Remove ${document.name}`}
              size={36}
              variant="ghost"
            />
          )}
        </View>
      </View>

      {document.reviewComments ? (
        <View style={styles.commentBox}>
          <AppText variant="caption" color={Colors.textPrimary}>
            <AppText variant="caption" weight="bold">
              Lawyer note:{' '}
            </AppText>
            {document.reviewComments}
          </AppText>
        </View>
      ) : null}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  infoCol: {
    flex: 1,
    paddingRight: Spacing.xs
  },
  meta: {
    marginTop: 2
  },
  badgeWrap: {
    marginTop: 6
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  commentBox: {
    marginTop: Spacing.sm,
    padding: Spacing.xs + 2,
    backgroundColor: Colors.warningSoft,
    borderRadius: Radii.sm
  }
});

