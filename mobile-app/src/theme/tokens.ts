import { Platform } from 'react-native';

export const Colors = {
  primary: '#203D35',
  primaryDeep: '#172F29',
  accent: '#E9A47B',
  accentSoft: '#F9ECE3',
  background: '#F5F1E8',
  sage: '#DCE8DF',
  sageLight: '#EEF4EF',
  surface: '#FFFFFF',
  surfaceMuted: '#FAF8F4',
  textPrimary: '#252B27',
  textSecondary: '#747B74',
  textMuted: '#9AA09A',
  border: '#E7E6DF',
  borderStrong: '#D3D1C7',
  success: '#32835C',
  successSoft: '#E6F4EC',
  warning: '#D99A42',
  warningSoft: '#FBF2E2',
  danger: '#C65B55',
  dangerSoft: '#FAEAE9',
  white: '#FFFFFF',
  overlay: 'rgba(23, 47, 41, 0.45)'
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999
} as const;

export const Typography = {
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'Inter, system-ui, sans-serif' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'Inter, system-ui, sans-serif' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'Inter, system-ui, sans-serif' }),
    editorial: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' })
  },
  size: {
    xs: 12,
    sm: 13.5,
    md: 15,
    base: 16,
    lg: 18,
    xl: 21,
    xxl: 26,
    display: 30
  },
  lineHeight: {
    xs: 17,
    sm: 19,
    md: 22,
    base: 24,
    lg: 26,
    xl: 28,
    xxl: 33,
    display: 38
  }
} as const;

export const Shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: '#172F29',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 10
    },
    android: {
      elevation: 2
    },
    default: {
      boxShadow: '0px 3px 10px rgba(23, 47, 41, 0.06)'
    }
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#172F29',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14
    },
    android: {
      elevation: 3
    },
    default: {
      boxShadow: '0px 6px 14px rgba(23, 47, 41, 0.08)'
    }
  })
} as const;
