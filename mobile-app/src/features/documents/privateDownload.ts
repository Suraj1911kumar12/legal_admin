import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { getApiBaseUrl } from '@/services/api/apiClient';
import { secureStorage } from '@/services/storage/secureStorage';

export async function downloadAndPreviewPrivateDocument(
  documentId: string,
  fileName: string,
  mimeType?: string
): Promise<{ uri: string }> {
  const accessToken = await secureStorage.getAccessToken();
  if (!accessToken) {
    throw new Error('Authentication required to view this document');
  }

  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const url = `${getApiBaseUrl()}/customer/documents/${documentId}/download`;

  if (Platform.OS === 'web') {
    await WebBrowser.openBrowserAsync(url);
    return { uri: url };
  }

  const destination = new File(Paths.cache, `${documentId}-${sanitizedName}`);
  const downloaded = await File.downloadFileAsync(url, destination, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    idempotent: true
  });

  if (await File.canPreview(downloaded)) {
    await File.preview(downloaded, {
      title: fileName,
      mimeType: mimeType || undefined
    });
  }

  return { uri: downloaded.uri };
}

