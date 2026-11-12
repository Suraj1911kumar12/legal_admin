import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEYS = {
  ONBOARDING_COMPLETED: 'legaldost_pref_onboarding_completed',
  NOTIFICATION_EXPLAINER_SEEN: 'legaldost_pref_notification_explainer_seen'
} as const;

export const localPreferences = {
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(PREF_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingCompleted(completed = true): Promise<void> {
    try {
      await AsyncStorage.setItem(PREF_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    } catch {
      // ignore storage write error
    }
  },

  async hasSeenNotificationExplainer(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(PREF_KEYS.NOTIFICATION_EXPLAINER_SEEN);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setNotificationExplainerSeen(): Promise<void> {
    try {
      await AsyncStorage.setItem(PREF_KEYS.NOTIFICATION_EXPLAINER_SEEN, 'true');
    } catch {
      // ignore
    }
  }
};
