import React, { createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing } from '@/theme/tokens';
import { AppText } from './AppText';

type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now();
    setToast({ id, message, tone });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3200);
  }, []);

  const palette = toast ? tonePalettes[toast.tone] : tonePalettes.info;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <View pointerEvents="none" style={[styles.container, { top: insets.top + Spacing.xs }]}>
          <Animated.View
            entering={reducedMotion ? undefined : FadeInUp.duration(220)}
            exiting={reducedMotion ? undefined : FadeOutUp.duration(180)}
            style={[styles.pill, { backgroundColor: palette.bg, borderColor: palette.border }]}
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 size={18} color={palette.icon} />
            ) : toast.tone === 'error' ? (
              <AlertCircle size={18} color={palette.icon} />
            ) : (
              <Info size={18} color={palette.icon} />
            )}
            <AppText
              variant="bodySmall"
              weight="medium"
              color={palette.text}
              style={styles.text}
              numberOfLines={2}
            >
              {toast.message}
            </AppText>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: (_msg: string, _tone?: ToastTone) => undefined };
  }
  return ctx;
}

const tonePalettes: Record<ToastTone, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: Colors.primaryDeep, border: Colors.primary, text: Colors.white, icon: Colors.accent },
  error: { bg: Colors.dangerSoft, border: Colors.danger, text: '#8C302B', icon: Colors.danger },
  info: { bg: Colors.surface, border: Colors.borderStrong, text: Colors.textPrimary, icon: Colors.primary }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    alignItems: 'center'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    width: '100%',
    ...(Shadows.card as object)
  },
  text: {
    flex: 1,
    marginLeft: Spacing.xs
  }
});

