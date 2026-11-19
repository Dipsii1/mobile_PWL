This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

# Konteks proyek: Tixo (aplikasi tiket konser)

Bagian di bawah ini khusus untuk proyek ini. Baca sampai selesai sebelum mengubah kode.

## Gambaran singkat

- **Tixo** = aplikasi mobile pembelian tiket konser (UKK 2026). Bahasa UI, komentar kode, dan pesan error: **Bahasa Indonesia**.
- Stack: Expo SDK 58, React Native 0.88, React 19 (React Compiler aktif), TypeScript, Expo Router (typed routes), NativeWind v4 (Tailwind 3), Reanimated 4.
- Backend terpisah di repo **Backend_UKK** (folder `../backend`, Express + Prisma + Zod). Repo mobile: **mobile_PWL**.

## Struktur folder

```
src/
  app/                 # HANYA screen/route (Expo Router)
    _layout.tsx        # root Stack + Stack.Protected (tamu vs login) + font ikon
    index.tsx          # redirect: token ? /home : /welcome
    welcome.tsx, auth.tsx, forgot-password.tsx   # khusus tamu (belum login)
    edit-profile.tsx   # khusus login
    (tabs)/            # home, explore, tickets, profile + _layout (pakai AppTabs)
  components/
    app-tabs.tsx       # tab bar melengkung custom (expo-router/ui + SVG + Reanimated)
    tixo/              # komponen UI dasar: icon, pressable-scale, field, chip, event-row, date-boxes
  constants/tixo.ts    # design token (T), animasi (rise, SPRING, EASE_OUT), TAB_INSET
  context/auth-context.tsx  # sesi login: user, token, signIn/signUp/signOut/updateProfile
  services/auth.service.ts  # semua panggilan endpoint /auth
  lib/api.ts           # wrapper fetch `request<T>()` + ApiError
  lib/profile.ts       # helper profil: label gender/role, format tanggal, kelengkapan
  lib/token-storage.ts # SecureStore (native) / localStorage (web)
  data/events.ts       # DATA CONTOH event (belum dari backend)
  types/               # tipe API, disamakan dengan backend
```

## Konvensi UI (wajib diikuti)

- **Warna** (tema gelap "Neon Blaze"): palet di `src/global.css` (`--color-*`). Pakai class: `bg-page`, `bg-card`,
  `border-line`, `bg-accent`/`text-accent`, `bg-accent-soft`, `text-glow`, `text-fg`, `text-muted`.
  Teks/ikon di atas oranye **wajib** `text-on-accent` / `T.onAccent` (hitam). Jangan pakai `bg-white`/`text-slate-*`.
  `T` (`@/constants/tixo`) hanya untuk prop JS (Icon, SVG, gradient, animasi); ubah warna di keduanya.
- **Styling**: NativeWind `className` untuk layout/teks; `style` untuk nilai dinamis atau token `T`.
- **Ikon**: `<Icon name="..." />` dari `@/components/tixo/icon` — nama ikon **Material Symbols** (snake_case, mis. `confirmation_number`, `lock_reset`). Prop `filled` untuk versi solid. Jangan tambah library ikon lain.
- **Tombol/area tekan**: `PressableScale` (efek mengecil saat ditekan), bukan `TouchableOpacity`.
- **Input teks**: `Field` (label, ikon, animasi fokus, pesan error). Tanggal: `DateBoxes`.
- **Dialog/konfirmasi**: `useDialog().show({ title, message, tone, icon, actions })` dari
  `@/components/tixo/dialog` — **jangan** pakai `Alert.alert` bawaan. `onPress` boleh async (tombol otomatis loading).
- **Animasi masuk**: `entering={rise(delayMs)}` pada `Animated.View`, delay bertahap ±60–80ms per blok.
- **Layar di dalam tab**: tab bar mengambang di atas konten, jadi `ScrollView` wajib diberi
  `paddingBottom: insets.bottom + TAB_INSET + 24`.
- **Form + keyboard**: bungkus dengan `KeyboardAvoidingView behavior="padding"` (Android sudah edge-to-edge,
  jangan `undefined`), lihat `edit-profile.tsx`.
- Bahasa teks UI santai pakai "kamu" (bukan "Anda").

## Backend & API

- Base URL otomatis di `lib/api.ts`: IP mesin Metro `:5000/api/v1` (HP fisik), `10.0.2.2` (emulator Android),
  atau override dengan env `EXPO_PUBLIC_API_URL`.
- Respons backend: `{ success, code, status, message, data, errors }`. `request<T>()` mengembalikan `data`,
  atau melempar `ApiError` (`message`, `status`, `code`, `fieldErrors` per field). Tampilkan `fieldErrors` di bawah input.
- Endpoint yang sudah dipakai mobile (prefix `/api/v1/auth`):
  - `POST /register`, `POST /login`, `POST /refresh-token`, `POST /logout`
  - `GET /me` — profil lengkap (full_name, phone, gender, birth_date, address, avatar, …)
  - `PATCH /me` — ubah profil sendiri; field yang tidak dikirim tidak berubah, `null`/`""` = kosongkan.
    (Ada di branch backend `feat/update-profile` — pastikan sudah di-merge/dijalankan.)
  - `POST /reset-password/request`, `POST /verify-email/request`
- Tambah endpoint baru → tambahkan di `services/*.service.ts` + tipe di `types/`, jangan `fetch` langsung dari screen.
- Ubah data profil lewat `useAuth().updateProfile()` agar nama di sesi ikut tersinkron.
- Event, tiket, dan pembayaran **masih memakai data contoh** (`data/events.ts`, isi `tickets.tsx`).
  Backend sudah punya `GET /api/v1/event` dan `GET /api/v1/event/:id` untuk menggantinya.

## Auth & navigasi

- Token disimpan di SecureStore (`tixo.accessToken`, `tixo.user`); saat app dibuka sesi dipulihkan
  dan di-refresh bila 401 (lihat `auth-context.tsx`).
- Rute dijaga `Stack.Protected` di `src/app/_layout.tsx`. Screen baru **wajib didaftarkan** di grup yang benar
  (tamu atau login). Contoh: `forgot-password` hanya untuk tamu, jadi dari halaman profil link reset dikirim langsung via API.

## Git

- Kerjakan di branch `feat/<nama-fitur>`, jangan commit langsung ke `main`; gabung lewat Pull Request.
- Pesan commit gaya Conventional Commits (`feat:`, `fix:`, `refactor:`, …) dalam bahasa Inggris.
- **Jangan** menambahkan baris atribusi AI (`Co-Authored-By: <AI>`, "Generated with …") di commit maupun PR.
- Jangan commit file pribadi: `.claude/settings.local.json`, `.env`, `ios/`, `android/`.

## Sebelum menyatakan tugas selesai

```bash
npx tsc --noEmit
npx expo lint
```
Keduanya harus bersih. Untuk perubahan backend: `npx tsc --noEmit` dan `npx vitest run` di folder `backend`.
