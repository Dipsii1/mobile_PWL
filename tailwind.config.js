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
    extend: {},
  },
  plugins: [],
};
