import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppSwitch } from '@/components/ui/AppSwitch';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { useAuth } from '@/features/auth/AuthContext';
import { apiClient, ApiClientError } from '@/services/api/apiClient';
import { registerForPushNotificationsAsync } from '@/services/notifications/pushService';
import { useToast } from '@/components/ui/AppToast';

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi (हिन्दी)', value: 'hi' },
  { label: 'Marathi (मराठी)', value: 'mr' },
  { label: 'Tamil (தமிழ்)', value: 'ta' },
  { label: 'Telugu (తెలుగు)', value: 'te' }
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { customer, refreshCustomer } = useAuth();
  const { showToast } = useToast();

  const prefs = customer?.notificationPreferences || {
    pushEnabled: true,
    emailEnabled: true,
    matterUpdates: true,
    messages: true,
    consultations: true
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const updatePreference = async (patch: Record<string, boolean>) => {
    try {
      if (patch.pushEnabled === true) {
        await registerForPushNotificationsAsync();
      }
      await apiClient.patch('/customer/profile', {
        notificationPreferences: { ...prefs, ...patch }
      });
      await refreshCustomer();
      showToast('Preferences saved', 'success');
    } catch {
      showToast('Could not save preferences', 'error');
    }
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      await apiClient.patch('/customer/profile', { preferredLanguage: lang });
      await refreshCustomer();
      showToast('Preferred language updated', 'success');
    } catch {
      showToast('Could not update language', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || newPassword.length < 8) {
      showToast('Enter current password and a new password (min 8 chars)', 'error');
      return;
    }

    setSavingPwd(true);
    try {
      await apiClient.post('/customer/auth/change-password', {
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password updated. Other sessions were signed out.', 'success');
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Password change failed', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Settings & Security" showBack />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.card}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Language Preference
          </AppText>
          <AppSelect
            label="Preferred Guidance Language"
            value={customer?.preferredLanguage || 'en'}
            options={LANGUAGE_OPTIONS}
            onSelect={handleLanguageChange}
          />
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Notification Controls
          </AppText>
          <AppSwitch
            label="Push Notifications"
            description="Deliver consultation, matter, and message alerts to this device"
            value={prefs.pushEnabled}
            onValueChange={(val) => updatePreference({ pushEnabled: val })}
          />
          <AppSwitch
            label="Matter Updates"
            description="Notify when a lawyer posts an update or requests documents"
            value={prefs.matterUpdates}
            onValueChange={(val) => updatePreference({ matterUpdates: val })}
          />
          <AppSwitch
            label="Lawyer Messages"
            description="Notify when you receive a direct chat message"
            value={prefs.messages}
            onValueChange={(val) => updatePreference({ messages: val })}
          />
          <AppSwitch
            label="Consultation Reminders"
            description="Notify when consultation requests are confirmed or updated"
            value={prefs.consultations}
            onValueChange={(val) => updatePreference({ consultations: val })}
          />
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="h3" color={Colors.textPrimary}>
            Change Password
          </AppText>
          <AppInput
            label="Current Password"
            isPassword
            leftIcon={<Lock size={17} color={Colors.textSecondary} />}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <AppInput
            label="New Password"
            placeholder="Minimum 8 characters"
            isPassword
            leftIcon={<Lock size={17} color={Colors.textSecondary} />}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <AppButton
            title="Update Password"
            loading={savingPwd}
            onPress={handleChangePassword}
          />
        </AppCard>
      </ScrollView>
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
    gap: Spacing.lg
  },
  card: {
    gap: Spacing.md
  }
});

