import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface AppRadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const AppRadioGroup: React.FC<AppRadioGroupProps> = ({
  options,
  value,
  onChange,
  label
}) => {
  return (
    <View style={styles.wrapper} accessibilityRole="radiogroup">
      {label && (
        <AppText variant="label" color={Colors.textPrimary} style={styles.groupLabel}>
          {label}
        </AppText>
      )}
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            style={[styles.optionCard, selected && styles.selectedCard]}
          >
            <View style={[styles.outerCircle, selected && styles.outerCircleSelected]}>
              {selected && <View style={styles.innerDot} />}
            </View>
            <View style={styles.textWrap}>
              <AppText variant="bodySmall" weight="semibold" color={Colors.textPrimary}>
                {opt.label}
              </AppText>
              {opt.description && (
                <AppText variant="caption" color={Colors.textSecondary}>
                  {opt.description}
                </AppText>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.sm
  },
  groupLabel: {
    marginBottom: Spacing.xs
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xs
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.sageLight
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  outerCircleSelected: {
    borderColor: Colors.primary
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary
  },
  textWrap: {
    flex: 1
  }
});
