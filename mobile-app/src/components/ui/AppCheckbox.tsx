import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppCheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const AppCheckbox: React.FC<AppCheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false
}) => {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <Check size={14} color={Colors.white} strokeWidth={3} />}
      </View>
      <View style={styles.textWrap}>
        <AppText variant="bodySmall" weight="medium" color={Colors.textPrimary}>
          {label}
        </AppText>
        {description && (
          <AppText variant="caption" color={Colors.textSecondary}>
            {description}
          </AppText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs
  },
  disabled: {
    opacity: 0.55
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: Spacing.sm
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  textWrap: {
    flex: 1
  }
});
