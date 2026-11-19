/** @type {import('tailwindcss').Config} */
module.exports = {
  // 'class' (bukan 'media'): wajib agar dark mode tidak crash di web dev
  // (nativewind#1489) dan manual toggle tema bisa dipakai. Di native, `dark:`
  // tetap otomatis mengikuti tampilan sistem.
  darkMode: 'class',
  // Semua file yang memakai class Tailwind ada di folder src/
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Dari variabel di src/global.css
      colors: {
        page: 'rgb(var(--color-page) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          soft: 'rgb(var(--color-accent) / 0.15)',
        },
        glow: 'rgb(var(--color-glow) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
