import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  isPassword = false,
  containerStyle,
  editable = true,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <AppText variant="label" color={Colors.textPrimary} style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputBox,
          focused && styles.focused,
          !!error && styles.errorBorder,
          !editable && styles.disabled
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          editable={editable}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          accessibilityLabel={label || props.placeholder}
          style={[styles.input, style]}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            style={styles.rightAction}
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={18} color={Colors.textSecondary} />
            ) : (
              <Eye size={18} color={Colors.textSecondary} />
            )}
          </Pressable>
        ) : (
          rightElement && <View style={styles.rightAction}>{rightElement}</View>
        )}
      </View>
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
  label: {
    marginBottom: 6
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    minHeight: 50,
    paddingHorizontal: Spacing.sm
  },
  focused: {
    borderColor: Colors.primary
  },
  errorBorder: {
    borderColor: Colors.danger
  },
  disabled: {
    backgroundColor: Colors.surfaceMuted,
    opacity: 0.75
  },
  leftIcon: {
    marginRight: Spacing.xs
  },
  input: {
    flex: 1,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs
  },
  rightAction: {
    marginLeft: Spacing.xs
  },
  feedback: {
    marginTop: 4
  }
});
