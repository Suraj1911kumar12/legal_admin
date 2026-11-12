import React from 'react';
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens';

export interface AppSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export const AppSearchBar: React.FC<AppSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
        >
          <X size={18} color={Colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    height: 46
  },
  icon: {
    marginRight: Spacing.xs
  },
  input: {
    flex: 1,
    fontSize: Typography.size.md,
    color: Colors.textPrimary
  }
});
