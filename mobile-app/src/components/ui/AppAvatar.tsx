import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { Colors } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppAvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({ name, uri, size = 44, style }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'LD';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`${name} avatar`}
        style={[
          { width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.sage },
          style as ImageStyle
        ]}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${name} initials`}
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    >
      <AppText
        variant={size >= 54 ? 'h3' : 'bodySmall'}
        color={Colors.primaryDeep}
        weight="bold"
      >
        {initials}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.sage,
    borderWidth: 1,
    borderColor: '#C5D9CB',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
