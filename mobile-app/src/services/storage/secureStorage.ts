import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'legaldost_access_token',
  REFRESH_TOKEN: 'legaldost_refresh_token',
  OFFLINE_INTAKE_DRAFT: 'legaldost_secure_intake_draft'
} as const;

let memoryWebFallback: Record<string, string> = {};

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryWebFallback[key] = value;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (memoryWebFallback[key]) return memoryWebFallback[key];
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem(key);
      }
    } catch {
      return null;
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    delete memoryWebFallback[key];
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setItem(KEYS.ACCESS_TOKEN, accessToken),
      setItem(KEYS.REFRESH_TOKEN, refreshToken)
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([removeItem(KEYS.ACCESS_TOKEN), removeItem(KEYS.REFRESH_TOKEN)]);
  },

  async saveOfflineDraft(draftJson: string): Promise<void> {
    // Store offline draft securely rather than unencrypted AsyncStorage
    if (draftJson.length <= 1900) {
      await setItem(KEYS.OFFLINE_INTAKE_DRAFT, draftJson);
    }
  },

  async getOfflineDraft(): Promise<string | null> {
    return getItem(KEYS.OFFLINE_INTAKE_DRAFT);
  },

  async clearOfflineDraft(): Promise<void> {
    await removeItem(KEYS.OFFLINE_INTAKE_DRAFT);
  }
};
