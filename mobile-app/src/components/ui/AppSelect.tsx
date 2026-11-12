import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { AppBottomSheet } from './AppBottomSheet';

export interface SelectOption {
  label: string;
  value: string;
}

export interface AppSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  helperText?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  onSelect,
  helperText,
  error,
  containerStyle
}) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <AppText variant="label" color={Colors.textPrimary} style={styles.label}>
          {label}
        </AppText>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        style={[styles.trigger, !!error && styles.errorBorder]}
      >
        <AppText
          variant="body"
          color={selectedOption ? Colors.textPrimary : Colors.textMuted}
          numberOfLines={1}
          style={styles.triggerText}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </AppText>
        <ChevronDown size={18} color={Colors.textSecondary} />
      </Pressable>

      {error ? (
        <AppText variant="caption" color={Colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color={Colors.textSecondary} style={styles.errorText}>
          {helperText}
        </AppText>
      ) : null}

      <AppBottomSheet visible={open} onClose={() => setOpen(false)} title={label || placeholder}>
        <View style={styles.optionsList}>
          {options.map((item) => {
            const isSelected = item.value === value;
            return (
              <Pressable
                key={item.value}
                onPress={() => {
                  onChange?.(item.value);
                  onSelect?.(item.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[styles.optionRow, isSelected && styles.selectedOptionRow]}
              >
                <AppText
                  variant="body"
                  weight={isSelected ? 'semibold' : 'regular'}
                  color={isSelected ? Colors.primaryDeep : Colors.textPrimary}
                >
                  {item.label}
                </AppText>
                {isSelected && <Check size={18} color={Colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </AppBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.md
  },
  label: {
    marginBottom: 6
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    minHeight: 50,
    paddingHorizontal: Spacing.sm
  },
  errorBorder: {
    borderColor: Colors.danger
  },
  triggerText: {
    flex: 1,
    paddingRight: Spacing.xs
  },
  errorText: {
    marginTop: 4
  },
  optionsList: {
    paddingBottom: Spacing.md
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
    marginBottom: 4
  },
  selectedOptionRow: {
    backgroundColor: Colors.sageLight
  }
});
