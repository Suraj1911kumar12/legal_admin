import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const AppModal: React.FC<AppModalProps> = ({ visible, onClose, title, children }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close dialog">
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <AppText variant="h3" color={Colors.textPrimary} style={styles.title}>
              {title || ''}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              hitSlop={10}
              style={styles.closeBtn}
            >
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.card as object)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm
  },
  title: {
    flex: 1,
    paddingRight: Spacing.sm
  },
  closeBtn: {
    padding: 4
  }
});
