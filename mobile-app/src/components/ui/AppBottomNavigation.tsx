import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useReducedMotion } from 'react-native-reanimated';
import { Home, Briefcase, Sparkles, Scale, User } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { triggerHaptic } from '@/utils/haptics';
import { MotionConfig } from '@/animations/motion';

export interface BottomTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarAccessibilityLabel?: string;
      };
    }
  >;
  navigation?: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
  navigateToTab?: (routeKey: string) => void;
}

const TAB_CONFIG: Record<string, { label: string; isCenter?: boolean }> = {
  home: { label: 'Home' },
  matters: { label: 'My Matters' },
  assistant: { label: 'AI Help', isCenter: true },
  lawyers: { label: 'Lawyers' },
  profile: { label: 'Profile' }
};

export const AppBottomNavigation: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation
}) => {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Spacing.xs) }
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation?.emit
              ? navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true
                })
              : { defaultPrevented: false };

            if (!isFocused && !event.defaultPrevented) {
              triggerHaptic.selection();
              if (navigation?.navigate) {
                navigation.navigate(route.name, route.params);
              }
            }
          };

          const renderIcon = (color: string, size: number) => {
            switch (route.name) {
              case 'home':
                return <Home size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.9} />;
              case 'matters':
                return <Briefcase size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.9} />;
              case 'assistant':
                return <Sparkles size={size} color={color} strokeWidth={2.2} />;
              case 'lawyers':
                return <Scale size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.9} />;
              case 'profile':
                return <User size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.9} />;
              default:
                return null;
            }
          };

          if (config.isCenter) {
            return (
              <TabItemButton
                key={route.key}
                isFocused={isFocused}
                isCenter
                label={config.label}
                accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
                onPress={onPress}
                reducedMotion={Boolean(reducedMotion)}
                icon={renderIcon(isFocused ? Colors.white : Colors.primaryDeep, 20)}
              />
            );
          }

          return (
            <TabItemButton
              key={route.key}
              isFocused={isFocused}
              label={config.label}
              accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
              onPress={onPress}
              reducedMotion={Boolean(reducedMotion)}
              icon={renderIcon(isFocused ? Colors.primary : Colors.textSecondary, 21)}
            />
          );
        })}
      </View>
    </View>
  );
};

interface TabItemProps {
  isFocused: boolean;
  isCenter?: boolean;
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  icon: React.ReactNode;
  reducedMotion: boolean;
}

const TabItemButton: React.FC<TabItemProps> = ({
  isFocused,
  isCenter = false,
  label,
  accessibilityLabel,
  onPress,
  icon,
  reducedMotion
}) => {
  const pillStyle = useAnimatedStyle(() => {
    const targetScale = isFocused ? 1.04 : 1;
    return {
      transform: [
        {
          scale: reducedMotion ? targetScale : withSpring(targetScale, MotionConfig.springSnappy)
        }
      ]
    };
  });

  if (isCenter) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={accessibilityLabel}
        style={styles.tabTouch}
      >
        <Animated.View
          style={[
            styles.centerPill,
            isFocused ? styles.centerPillActive : styles.centerPillInactive,
            pillStyle
          ]}
        >
          {icon}
        </Animated.View>
        <AppText
          variant="caption"
          weight={isFocused ? 'bold' : 'medium'}
          color={isFocused ? Colors.primary : Colors.textSecondary}
          style={styles.tabLabel}
          numberOfLines={1}
        >
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel}
      style={styles.tabTouch}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          isFocused && styles.activeIconPill,
          pillStyle
        ]}
      >
        {icon}
      </Animated.View>
      <AppText
        variant="caption"
        weight={isFocused ? 'bold' : 'medium'}
        color={isFocused ? Colors.primary : Colors.textSecondary}
        style={styles.tabLabel}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    ...(Shadows.soft as object)
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  tabTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeIconPill: {
    backgroundColor: Colors.sageLight
  },
  centerPill: {
    width: 48,
    height: 32,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerPillActive: {
    backgroundColor: Colors.primary
  },
  centerPillInactive: {
    backgroundColor: Colors.sage,
    borderWidth: 1,
    borderColor: '#C5D9CB'
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 11
  }
});
