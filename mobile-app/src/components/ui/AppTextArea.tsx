import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppTextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  minHeight?: number;
  maxLength?: number;
  showCount?: boolean;
  containerStyle?: ViewStyle;
}

export const AppTextArea: React.FC<AppTextAreaProps> = ({
  label,
  error,
  helperText,
  minHeight = 132,
  maxLength,
  showCount = false,
  value = '',
  containerStyle,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.labelRow}>
        {label ? (
          <AppText variant="label" color={Colors.textPrimary}>
            {label}
          </AppText>
        ) : (
          <View />
        )}
        {showCount && maxLength && (
          <AppText variant="caption" color={Colors.textSecondary}>
            {String(value).length}/{maxLength}
          </AppText>
        )}
      </View>

      <TextInput
        multiline
        textAlignVertical="top"
        value={value}
        maxLength={maxLength}
        placeholderTextColor={Colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        accessibilityLabel={label || props.placeholder}
        style={[
          styles.textarea,
          { minHeight },
          focused && styles.focused,
          !!error && styles.errorBorder,
          style
        ]}
        {...props}
      />

      {error ? (
        <AppText variant="caption" color={Colors.danger} style={styles.feedback}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color={Colors.textSecondary} style={styles.feedback}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.md
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  textarea: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    color: Colors.textPrimary
  },
  focused: {
    borderColor: Colors.primary
  },
  errorBorder: {
    borderColor: Colors.danger
  },
  feedback: {
    marginTop: 4
  }
});
