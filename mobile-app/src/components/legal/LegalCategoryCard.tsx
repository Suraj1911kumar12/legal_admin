import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';

export interface LegalCategoryCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
}

export const LegalCategoryCard: React.FC<LegalCategoryCardProps> = ({
  title,
  subtitle,
  icon,
  selected = false,
  onPress
}) => {
  return (
    <AppCard
      onPress={onPress}
      variant={selected ? 'sage' : 'default'}
      style={selected ? styles.selected : undefined}
      accessibilityLabel={title}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, selected && styles.selectedIcon]}>{icon}</View>
        <View style={styles.textWrap}>
          <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2}>
            {subtitle}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  selected: {
    borderColor: Colors.primary,
    borderWidth: 1.5
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
  selectedIcon: {
    backgroundColor: Colors.white
  },
  textWrap: {
    flex: 1
  }
});

