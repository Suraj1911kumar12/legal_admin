import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Briefcase, Languages, MapPin } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppAvatar } from '../ui/AppAvatar';
import { AppBadge } from '../ui/AppBadge';
import { VerificationBadge } from './VerificationBadge';
import { PublicLawyer } from '@/types/customer';
import { formatCurrencyINR } from '@/utils/formatters';

export interface LawyerCardProps {
  lawyer: PublicLawyer;
  onPress: () => void;
}

export const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onPress }) => {
  return (
    <AppCard onPress={onPress} style={styles.card} accessibilityLabel={`Advocate ${lawyer.fullName}`}>
      <View style={styles.headerRow}>
        <AppAvatar name={lawyer.fullName} uri={lawyer.profileImage} size={50} />
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1} style={styles.name}>
              {lawyer.fullName}
            </AppText>
            <VerificationBadge verified={lawyer.verificationStatus === 'verified'} />
          </View>
          <View style={styles.metaRow}>
            <MapPin size={13} color={Colors.textSecondary} />
            <AppText variant="caption" color={Colors.textSecondary} style={styles.metaText} numberOfLines={1}>
              {[lawyer.city, lawyer.state].filter(Boolean).join(', ')}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.chipsRow}>
        {(lawyer.practiceAreas || []).slice(0, 3).map((area) => (
          <AppBadge key={area} label={area} tone="sage" style={styles.chip} />
        ))}
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Briefcase size={14} color={Colors.textSecondary} />
          <AppText variant="caption" color={Colors.textPrimary} style={styles.detailText}>
            {lawyer.yearsOfExperience} yrs exp
          </AppText>
        </View>
        <View style={styles.detailItem}>
          <Languages size={14} color={Colors.textSecondary} />
          <AppText variant="caption" color={Colors.textPrimary} style={styles.detailText} numberOfLines={1}>
            {(lawyer.languages || []).slice(0, 2).join(', ')}
          </AppText>
        </View>
        <AppText variant="bodySmall" weight="bold" color={Colors.primary}>
          {formatCurrencyINR(lawyer.consultationFee)}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  infoCol: {
    flex: 1,
    marginLeft: Spacing.sm
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  name: {
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  metaText: {
    marginLeft: 4
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm
  },
  chip: {
    marginRight: 2
  },
  detailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '38%'
  },
  detailText: {
    marginLeft: 5
  }
});

