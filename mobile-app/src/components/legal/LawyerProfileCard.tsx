import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Award, MapPin, Phone, Video, Users } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppAvatar } from '../ui/AppAvatar';
import { AppBadge } from '../ui/AppBadge';
import { AppDivider } from '../ui/AppDivider';
import { VerificationBadge } from './VerificationBadge';
import { PublicLawyer } from '@/types/customer';
import { formatCurrencyINR } from '@/utils/formatters';

export interface LawyerProfileCardProps {
  lawyer: PublicLawyer;
}

export const LawyerProfileCard: React.FC<LawyerProfileCardProps> = ({ lawyer }) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppAvatar name={lawyer.fullName} uri={lawyer.profileImage} size={68} />
        <View style={styles.headerInfo}>
          <AppText variant="h2" color={Colors.textPrimary}>
            {lawyer.fullName}
          </AppText>
          <View style={styles.badgeRow}>
            <VerificationBadge verified={lawyer.verificationStatus === 'verified'} label="Verified Advocate" />
            <AppBadge
              label={lawyer.isAvailable ? 'Available' : 'Busy'}
              tone={lawyer.isAvailable ? 'sage' : 'warning'}
            />
          </View>
          <View style={styles.locRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.locText}>
              {[lawyer.city, lawyer.state].filter(Boolean).join(', ')}
            </AppText>
          </View>
        </View>
      </View>

      <AppDivider />

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <AppText variant="caption" color={Colors.textSecondary}>
            Experience
          </AppText>
          <AppText variant="subtitle" color={Colors.primaryDeep}>
            {lawyer.yearsOfExperience} Years
          </AppText>
        </View>
        <View style={styles.statCol}>
          <AppText variant="caption" color={Colors.textSecondary}>
            Consultation Fee
          </AppText>
          <AppText variant="subtitle" color={Colors.primaryDeep}>
            {formatCurrencyINR(lawyer.consultationFee)}
          </AppText>
        </View>
        <View style={styles.statCol}>
          <AppText variant="caption" color={Colors.textSecondary}>
            Bar Council
          </AppText>
          <AppText variant="bodySmall" weight="semibold" color={Colors.textPrimary} numberOfLines={1}>
            {lawyer.enrollmentState || 'State Bar'}
          </AppText>
        </View>
      </View>

      {lawyer.professionalBio ? (
        <>
          <AppDivider />
          <AppText variant="label" color={Colors.textPrimary} style={styles.sectionLabel}>
            About Advocate
          </AppText>
          <AppText variant="body" color={Colors.textSecondary}>
            {lawyer.professionalBio}
          </AppText>
        </>
      ) : null}

      <AppDivider />

      <AppText variant="label" color={Colors.textPrimary} style={styles.sectionLabel}>
        Verified Credentials & Practice Areas
      </AppText>
      <View style={styles.credRow}>
        <Award size={15} color={Colors.primary} />
        <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.credText}>
          Registered with {lawyer.barCouncil} ({lawyer.enrollmentState})
        </AppText>
      </View>

      <View style={styles.chipsWrap}>
        {(lawyer.practiceAreas || []).map((area) => (
          <AppBadge key={area} label={area} tone="sage" />
        ))}
      </View>

      <AppDivider />

      <View style={styles.twoCol}>
        <View style={styles.half}>
          <AppText variant="label" color={Colors.textPrimary} style={styles.sectionLabel}>
            Languages
          </AppText>
          <AppText variant="bodySmall" color={Colors.textSecondary}>
            {(lawyer.languages || []).join(', ') || 'English'}
          </AppText>
        </View>
        <View style={styles.half}>
          <AppText variant="label" color={Colors.textPrimary} style={styles.sectionLabel}>
            Consultation Modes
          </AppText>
          <View style={styles.modesRow}>
            {lawyer.consultationTypes?.includes('video') && <Video size={16} color={Colors.primary} />}
            {lawyer.consultationTypes?.includes('phone') && <Phone size={16} color={Colors.primary} />}
            {lawyer.consultationTypes?.includes('in_person') && <Users size={16} color={Colors.primary} />}
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  locText: {
    marginLeft: 4
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCol: {
    flex: 1
  },
  sectionLabel: {
    marginBottom: 6
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  credText: {
    marginLeft: 6,
    flex: 1
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  half: {
    flex: 1,
    paddingRight: Spacing.sm
  },
  modesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2
  }
});

