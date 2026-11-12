import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  transparent?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActions,
  transparent = false
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, Spacing.sm) },
        !transparent && styles.bordered
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <IconButton
            icon={<ArrowLeft size={20} color={Colors.primaryDeep} />}
            onPress={handleBack}
            accessibilityLabel="Go back"
            size={40}
            style={styles.backBtn}
          />
        )}
        <View style={styles.titleBlock}>
          <AppText variant="h3" color={Colors.textPrimary} numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {rightActions && <View style={styles.right}>{rightActions}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    marginRight: Spacing.sm
  },
  titleBlock: {
    flex: 1
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm
  }
});

