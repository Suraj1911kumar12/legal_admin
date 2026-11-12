import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Calendar,
  ChevronRight,
  Edit3,
  FileText,
  Lock,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck
} from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppAvatar } from '@/components/ui/AppAvatar';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { useAuth } from '@/features/auth/AuthContext';
import { apiClient, ApiClientError } from '@/services/api/apiClient';
import { useToast } from '@/components/ui/AppToast';

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi (हिन्दी)', value: 'hi' },
  { label: 'Marathi (मराठी)', value: 'mr' },
  { label: 'Tamil (தமிழ்)', value: 'ta' },
  { label: 'Telugu (తెలుగు)', value: 'te' },
  { label: 'Kannada (ಕನ್ನಡ)', value: 'kn' },
  { label: 'Bengali (বাংলা)', value: 'bn' }
];

export default function ProfileTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customer, logout, refreshCustomer } = useAuth();
  const { showToast } = useToast();

  const [editVisible, setEditVisible] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [city, setCity] = useState(customer?.city || '');
  const [stateName, setStateName] = useState(customer?.state || '');
  const [preferredLanguage, setPreferredLanguage] = useState(customer?.preferredLanguage || 'en');

  const openEditModal = () => {
    setFullName(customer?.fullName || '');
    setPhone(customer?.phone || '');
    setCity(customer?.city || '');
    setStateName(customer?.state || '');
    setPreferredLanguage(customer?.preferredLanguage || 'en');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (fullName.trim().length < 2) {
      showToast('Full name must be at least 2 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/customer/profile', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: stateName.trim(),
        preferredLanguage
      });
      await refreshCustomer();
      setEditVisible(false);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutConfirm(false);
    await logout();
    router.replace('/welcome');
  };

  const menuItems = [
    {
      label: 'My Document Vault',
      subtitle: 'Upload, inspect & organize private documents',
      icon: <FileText size={19} color={Colors.primary} />,
      route: '/documents'
    },
    {
      label: 'Consultations',
      subtitle: 'Manage scheduled & past appointments',
      icon: <Calendar size={19} color={Colors.primary} />,
      route: '/consultations'
    },
    {
      label: 'Lawyer Messages',
      subtitle: 'Private conversations & shared attachments',
      icon: <MessageSquare size={19} color={Colors.primary} />,
      route: '/messages'
    },
    {
      label: 'Notifications',
      subtitle: 'Activity updates & reminders',
      icon: <Bell size={19} color={Colors.primary} />,
      route: '/notifications'
    },
    {
      label: 'Settings & Security',
      subtitle: 'Password, language & alert controls',
      icon: <Settings size={19} color={Colors.primary} />,
      route: '/settings'
    },
    {
      label: 'Privacy & Data Controls',
      subtitle: 'Retention disclosure & account deletion',
      icon: <Lock size={19} color={Colors.primary} />,
      route: '/privacy'
    }
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <AppText variant="h1" color={Colors.textPrimary}>
          Profile & Account
        </AppText>
      </View>

      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppCard variant="sage" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <AppAvatar
              name={customer?.fullName || 'Customer'}
              uri={customer?.profileImage}
              size={60}
            />
            <View style={styles.profileInfo}>
              <AppText variant="h3" color={Colors.textPrimary} numberOfLines={1}>
                {customer?.fullName || 'LegalDost Member'}
              </AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>
                {customer?.email}
              </AppText>
              <View style={styles.badgesRow}>
                <AppBadge
                  label={`Lang: ${(customer?.preferredLanguage || 'en').toUpperCase()}`}
                  tone="neutral"
                />
                {customer?.city ? (
                  <AppBadge label={customer.city} tone="neutral" />
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.profileActions}>
            <AppButton
              title="Edit Profile"
              variant="outline"
              size="sm"
              leftIcon={<Edit3 size={14} color={Colors.primary} />}
              onPress={openEditModal}
            />
            {!customer?.isEmailVerified ? (
              <AppButton
                title="Verification Status"
                variant="ghost"
                size="sm"
                leftIcon={<ShieldCheck size={14} color={Colors.primary} />}
                onPress={() => router.push('/verify-email')}
              />
            ) : null}
          </View>
        </AppCard>

        <View style={styles.menuGroup}>
          {menuItems.map((item) => (
            <AppCard
              key={item.route}
              onPress={() => router.push(item.route as never)}
              padding={Spacing.sm}
            >
              <View style={styles.menuRow}>
                <View style={styles.menuIcon}>{item.icon}</View>
                <View style={styles.menuText}>
                  <AppText variant="subtitle" color={Colors.textPrimary}>
                    {item.label}
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {item.subtitle}
                  </AppText>
                </View>
                <ChevronRight size={18} color={Colors.textMuted} />
              </View>
            </AppCard>
          ))}
        </View>

        <Pressable
          onPress={() => setLogoutConfirm(true)}
          style={styles.logoutBtn}
          accessibilityRole="button"
        >
          <LogOut size={18} color={Colors.danger} />
          <AppText variant="subtitle" color={Colors.danger}>
            Sign Out
          </AppText>
        </Pressable>
      </ScrollView>

      <AppModal visible={editVisible} onClose={() => setEditVisible(false)} title="Edit Profile">
        <View style={styles.modalForm}>
          <AppInput label="Full Name" value={fullName} onChangeText={setFullName} />
          <AppInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <View style={styles.twoCol}>
            <AppInput
              label="City"
              value={city}
              onChangeText={setCity}
              containerStyle={styles.flexOne}
            />
            <AppInput
              label="State"
              value={stateName}
              onChangeText={setStateName}
              containerStyle={styles.flexOne}
            />
          </View>
          <AppSelect
            label="Preferred Language"
            value={preferredLanguage}
            options={LANGUAGE_OPTIONS}
            onSelect={setPreferredLanguage}
          />
          <View style={styles.modalActions}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => setEditVisible(false)}
              style={styles.flexOne}
            />
            <AppButton
              title="Save Changes"
              loading={saving}
              onPress={handleSaveProfile}
              style={styles.flexOne}
            />
          </View>
        </View>
      </AppModal>

      <AppModal
        visible={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="Sign Out of LegalDost?"
      >
        <View style={styles.modalForm}>
          <AppText variant="body" color={Colors.textSecondary}>
            Your saved matters and documents stay safely stored in your account. Any offline draft on
            this device remains encrypted until you sign back in.
          </AppText>
          <View style={styles.modalActions}>
            <AppButton
              title="Stay Signed In"
              variant="outline"
              onPress={() => setLogoutConfirm(false)}
              style={styles.flexOne}
            />
            <AppButton
              title="Sign Out"
              variant="danger"
              onPress={handleConfirmLogout}
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg
  },
  profileCard: {
    gap: Spacing.md
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md
  },
  profileInfo: {
    flex: 1,
    gap: 2
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4
  },
  profileActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs
  },
  menuGroup: {
    gap: Spacing.xs
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuText: {
    flex: 1
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#ECC6C4'
  },
  modalForm: {
    gap: Spacing.md
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  flexOne: {
    flex: 1
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs
  }
});

