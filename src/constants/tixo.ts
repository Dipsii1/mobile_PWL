import { Easing, FadeInUp, LinearTransition } from 'react-native-reanimated';

// Salinan palet global.css untuk prop yang butuh nilai JS (Icon, SVG, animasi).
export const T = {
  bg: '#09090B',
  card: '#141417',
  line: '#27272A',
  fg: '#FFFFFF',
  muted: '#A1A1AA',
  accent: '#FF4D00',
  glow: '#FF7A00',
  accentSoft: 'rgba(255,77,0,0.15)',
  onAccent: '#09090B',
} as const;

export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const SPRING = { damping: 18, stiffness: 260, mass: 0.8 } as const;
// Pegas lembut tanpa pantulan berlebih — untuk indikator & elemen yang berpindah posisi.
export const SPRING_SOFT = { damping: 26, stiffness: 220, mass: 1 } as const;

// Masuk bertahap: naik + memudar dengan kurva ease-out panjang.
export const rise = (delay = 0) => FadeInUp.delay(delay).duration(800).easing(EASE_OUT);

// Transisi layout halus saat elemen muncul/hilang di sekitarnya.
export const smoothLayout = LinearTransition.duration(420).easing(EASE_OUT);

// Ruang bawah agar konten tidak tertutup tab bar melengkung (tinggi bar 64 + jarak).
export const TAB_INSET = 72;

export const stagger = (index: number, base = 50) => Math.min(index, 6) * base;
