import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const T = {
  bg: '#F5F6FA',
  card: '#FFFFFF',
  ink: '#0E1525',
  muted: '#6B7280',
  line: '#E6E8EF',
  accent: '#5B4BFF',
  accentSoft: '#ECEAFF',
  lime: '#D4F66B',
} as const;

export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const SPRING = { damping: 18, stiffness: 260, mass: 0.8 } as const;

// Ruang bawah agar konten tidak tertutup tab bar native.
export const TAB_INSET = Platform.select({ ios: 50, android: 80 }) ?? 0;

export const stagger = (index: number, base = 50) => Math.min(index, 6) * base;
