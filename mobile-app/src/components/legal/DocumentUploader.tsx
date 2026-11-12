import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Camera, FileUp, Image as ImageIcon, RefreshCw, X } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';
import { AppProgressIndicator } from '../ui/AppProgressIndicator';
import { IconButton } from '../ui/IconButton';
import { apiClient, UploadTaskHandle } from '@/services/api/apiClient';
import { CustomerDocument } from '@/types/customer';
import { formatFileSize } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface DocumentUploaderProps {
  matterId?: string;
  queryId?: string;
  documentType?: string;
  onUploaded: (doc: CustomerDocument) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  matterId,
  queryId,
  documentType = 'supporting_document',
  onUploaded
}) => {
  const reducedMotion = useReducedMotion();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error' | 'done'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const activeTaskRef = useRef<UploadTaskHandle | null>(null);

  const validateAndStart = async (file: SelectedFile) => {
    setErrorMsg(null);
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      setErrorMsg('Only PDF, JPG, JPEG, and PNG documents are supported.');
      setStatus('error');
      triggerHaptic.error();
      return;
    }

    if (file.size > MAX_BYTES) {
      setErrorMsg('File exceeds the 10 MB security limit. Please choose a smaller file.');
      setStatus('error');
      triggerHaptic.error();
      return;
    }

    setSelectedFile(file);
    await executeUpload(file);
  };

  const executeUpload = async (file: SelectedFile) => {
    setStatus('uploading');
    setProgress(0.05);
    setErrorMsg(null);

    const handle = apiClient.uploadFile({
      path: '/customer/documents/upload',
      file: { uri: file.uri, name: file.name, type: file.type },
      fields: {
        documentType,
        ...(matterId ? { matterId } : {}),
        ...(queryId ? { queryId } : {})
      },
      onProgress: (p) => setProgress(p)
    });

    activeTaskRef.current = handle;

    try {
      const res = await handle.promise;
      activeTaskRef.current = null;
      setProgress(1);
      setStatus('done');
      triggerHaptic.success();
      onUploaded(res.data);
      setTimeout(() => {
        setSelectedFile(null);
        setStatus('idle');
        setProgress(0);
      }, 900);
    } catch (err: any) {
      activeTaskRef.current = null;
      if (err?.isCancelled) {
        setSelectedFile(null);
        setStatus('idle');
        setProgress(0);
        return;
      }
      setStatus('error');
      setErrorMsg(err?.message || 'Upload failed. Please retry.');
      triggerHaptic.error();
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await validateAndStart({
        uri: asset.uri,
        name: asset.name || 'document.pdf',
        type: asset.mimeType || 'application/pdf',
        size: asset.size || 0
      });
    } catch {
      setErrorMsg('Could not open document selector.');
    }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg('Photo library permission is needed to attach document images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mime = asset.mimeType || (ext === 'png' ? 'image/png' : 'image/jpeg');
    await validateAndStart({
      uri: asset.uri,
      name: asset.fileName || `photo_${Date.now()}.${ext}`,
      type: mime,
      size: asset.fileSize || 0
    });
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg('Camera permission is needed only if you want to capture a document photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    await validateAndStart({
      uri: asset.uri,
      name: asset.fileName || `capture_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      size: asset.fileSize || 0
    });
  };

  return (
    <AppCard variant="muted" style={styles.container}>
      <AppText variant="subtitle" color={Colors.textPrimary}>
        Upload a Legal Document
      </AppText>
      <AppText variant="caption" color={Colors.textSecondary} style={styles.hint}>
        Supported: PDF, JPG, PNG (up to 10 MB). Stored privately and never publicly linked.
      </AppText>

      <View style={styles.btnRow}>
        <AppButton
          title="PDF / File"
          variant="outline"
          size="sm"
          onPress={pickDocument}
          disabled={status === 'uploading'}
          leftIcon={<FileUp size={15} color={Colors.primary} />}
          style={styles.actionBtn}
        />
        <AppButton
          title="Photos"
          variant="outline"
          size="sm"
          onPress={pickPhoto}
          disabled={status === 'uploading'}
          leftIcon={<ImageIcon size={15} color={Colors.primary} />}
          style={styles.actionBtn}
        />
        <AppButton
          title="Camera"
          variant="outline"
          size="sm"
          onPress={takePhoto}
          disabled={status === 'uploading'}
          leftIcon={<Camera size={15} color={Colors.primary} />}
          style={styles.actionBtn}
        />
      </View>

      {selectedFile && (
        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(220)}
          style={styles.progressCard}
        >
          <View style={styles.fileHeader}>
            <View style={styles.fileMeta}>
              <AppText variant="bodySmall" weight="semibold" numberOfLines={1}>
                {selectedFile.name}
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                {formatFileSize(selectedFile.size)} •{' '}
                {status === 'uploading'
                  ? `Uploading ${Math.round(progress * 100)}%`
                  : status === 'done'
                  ? 'Uploaded securely'
                  : 'Upload paused'}
              </AppText>
            </View>
            {status === 'uploading' ? (
              <IconButton
                icon={<X size={16} color={Colors.danger} />}
                onPress={() => activeTaskRef.current?.cancel()}
                accessibilityLabel="Cancel upload"
                size={34}
              />
            ) : status === 'error' ? (
              <IconButton
                icon={<RefreshCw size={16} color={Colors.primary} />}
                onPress={() => executeUpload(selectedFile)}
                accessibilityLabel="Retry upload"
                size={34}
              />
            ) : null}
          </View>
          <AppProgressIndicator
            progress={progress}
            fillColor={status === 'error' ? Colors.danger : Colors.success}
          />
        </Animated.View>
      )}

      {errorMsg && (
        <AppText variant="caption" color={Colors.danger} style={styles.errorText}>
          {errorMsg}
        </AppText>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md
  },
  hint: {
    marginTop: 4,
    marginBottom: Spacing.sm
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: 8
  },
  progressCard: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs
  },
  fileMeta: {
    flex: 1,
    paddingRight: Spacing.xs
  },
  errorText: {
    marginTop: Spacing.xs
  }
});

