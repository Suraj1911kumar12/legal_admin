import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const AppSwitch: React.FC<AppSwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <AppText variant="bodySmall" weight="semibold" color={Colors.textPrimary}>
          {label}
        </AppText>
        {description && (
          <AppText variant="caption" color={Colors.textSecondary}>
            {description}
          </AppText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.borderStrong, true: Colors.primary }}
        thumbColor={Colors.white}
        accessibilityLabel={label}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs
  },
  textWrap: {
    flex: 1,
    paddingRight: Spacing.md
  }
});
