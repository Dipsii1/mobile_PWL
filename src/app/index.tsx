import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/material-symbols/useFonts';
import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Model Pinterest: lembar putih melengkung di atas, body gelap,
// toggle pil Login/Sign up, input garis bawah, tombol putih.
// Field mengikuti backend (Backend_UKK — auth.validation.ts):
//   register: fullName (2–100) · email (maks 255) · password (8–72)
//   login:    email · password (min 1)
const INK = '#1A1A1D'; // body gelap
const EASE = { duration: 260, easing: Easing.out(Easing.cubic) };

const inputClass =
  'border-b border-zinc-600/50 py-3.5 text-base font-medium text-white focus:border-zinc-100';
const errorClass = 'mt-2 text-xs font-medium text-red-400';
const placeholderClass = '#A1A1AA'; // zinc-400

type Mode = 'login' | 'signup';
type FieldKey = 'fullName' | 'email' | 'password';
type FieldErrors = Partial<Record<FieldKey, string>>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Ikon ligature Material Symbols; tidak dirender bila font belum termuat.
// Dideklarasikan di luar render (aturan react-hooks/static-components).
function MaterialSymbol({
  loaded,
  name,
  className,
}: {
  loaded: boolean;
  name: string;
  className: string;
}) {
  if (!loaded) return null;
  return (
    <Text style={{ fontFamily: 'MaterialSymbols' }} className={className}>
      {name}
    </Text>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signup'); // register = halaman pertama app
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Tombol back hanya tampil bila ada layar di bawahnya (mis. saat dibuka dari Home)
  const [canGoBack] = useState(() => router.canGoBack());

  // Font ikon Material Symbols (ligature) untuk ikon mata
  const [fontsLoaded] = useFonts({ MaterialSymbols: MaterialSymbols_400Regular });

  const insets = useSafeAreaInsets();

  // Lengkung lembar putih "tumbuh" setelah frame pertama — morf halus saat masuk
  const [sheetExpanded, setSheetExpanded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setSheetExpanded(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const sheetStyle = useAnimatedStyle(() => {
    const radius = withTiming(sheetExpanded ? 44 : 0, {
      duration: 700,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    return { borderBottomLeftRadius: radius, borderBottomRightRadius: radius };
  });

  // Animasi indikator pil toggle: meluncur antar posisi
  const segWidth = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => {
    const half = (segWidth.value - 8) / 2;
    return {
      width: half,
      transform: [{ translateX: withTiming(mode === 'signup' ? half : 0, EASE) }],
    };
  });

  // Feedback tekan CTA — digerakkan state, tanpa mutasi shared value
  const [ctaPressed, setCtaPressed] = useState(false);
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withTiming(ctaPressed ? 0.97 : 1, { duration: 130, easing: Easing.out(Easing.cubic) }) },
    ],
  }));

  function setError(key: FieldKey, message?: string) {
    setErrors((prev) => ({ ...prev, [key]: message }));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
  }

  // Aturan disamakan dengan Zod schema backend (auth.validation.ts)
  function validateField(key: FieldKey): string | undefined {
    switch (key) {
      case 'fullName':
        return fullName.trim().length >= 2 ? undefined : 'Enter your full name (min. 2 characters).';
      case 'email':
        return /^\S+@\S+\.\S+$/.test(email) ? undefined : 'Enter a valid email address.';
      case 'password': {
        if (mode === 'signup') {
          return password.length >= 8 ? undefined : 'Use at least 8 characters.';
        }
        return password.length >= 1 ? undefined : 'Enter your password.';
      }
    }
  }

  function handleBlur(key: FieldKey) {
    setError(key, validateField(key));
  }

  function handleSubmit() {
    const keys: FieldKey[] = mode === 'signup' ? ['fullName', 'email', 'password'] : ['email', 'password'];
    const nextErrors: FieldErrors = {};
    for (const key of keys) {
      const message = validateField(key);
      if (message) nextErrors[key] = message;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Berhasil → masuk ke app utama (tab Home); replace agar back tidak kembali ke sini
    router.replace('/home');
  }

  return (
    <View className="flex-1" style={{ backgroundColor: INK }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {/* Lembar putih melengkung berisi logo — masuk dari atas, lengkungnya morf halus */}
        <Animated.View
          entering={FadeInDown.duration(420).easing(Easing.out(Easing.cubic))}
          style={[{ paddingTop: insets.top }, sheetStyle]}
          className="bg-white">
          <View className="flex-row items-center justify-between px-5 pt-2">
            {canGoBack ? (
              <Pressable
                onPress={() => {
                  if (router.canGoBack()) router.back();
                }}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200">
                <Text className="text-lg text-neutral-700">←</Text>
              </Pressable>
            ) : (
              <View className="h-11 w-11" />
            )}
            <View className="h-11 w-11" />
          </View>
          {/* Mark tiket gelap + wordmark tixo */}
          <Animated.View entering={FadeIn.delay(120).duration(320)} className="items-center pb-8 pt-1">
            <View className="h-11 w-[72px] items-center justify-center rounded-xl bg-[#1A1A1D]">
              <View className="absolute -left-1.5 top-3.5 h-4 w-4 rounded-full bg-white" />
              <View className="absolute -right-1.5 top-3.5 h-4 w-4 rounded-full bg-white" />
              <View className="h-6 w-0 border-l border-dashed border-white/30" />
            </View>
            <Text className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900">
              tixo
            </Text>
          </Animated.View>
        </Animated.View>

        <ScrollView contentContainerClassName="px-7 pb-10 pt-8" keyboardShouldPersistTaps="handled">
          {/* Toggle pil Login / Sign up — indikator meluncur halus */}
          <Animated.View
            entering={FadeInUp.duration(380).delay(100)}
            onLayout={(e) => {
              segWidth.value = e.nativeEvent.layout.width;
            }}
            className="flex-row rounded-full bg-white/10 p-1">
            <Animated.View
              style={indicatorStyle}
              className="absolute top-1 bottom-1 left-1 rounded-full bg-zinc-200"
            />
            <Pressable
              onPress={() => switchMode('login')}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'login' }}
              className="z-10 flex-1 items-center rounded-full py-2.5 active:opacity-80">
              <Text className={`text-sm font-semibold ${mode === 'login' ? 'text-neutral-900' : 'text-zinc-400'}`}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode('signup')}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'signup' }}
              className="z-10 flex-1 items-center rounded-full py-2.5 active:opacity-80">
              <Text className={`text-sm font-semibold ${mode === 'signup' ? 'text-neutral-900' : 'text-zinc-400'}`}>
                Sign up
              </Text>
            </Pressable>
          </Animated.View>

          {/* Form — naik saat masuk, reflow halus saat field berganti mode */}
          <Animated.View
            entering={FadeInUp.duration(380).delay(180)}
            layout={LinearTransition.duration(240)}
            className="mt-10 gap-7">
            {/* Full name — hanya Sign up (backend: fullName, 2–100 karakter) */}
            {mode === 'signup' && (
              <Animated.View
                entering={FadeInDown.duration(220)}
                exiting={FadeOutDown.duration(180)}
                layout={LinearTransition.duration(240)}>
                <TextInput
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError('fullName', undefined);
                  }}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Full name"
                  placeholderTextColor={placeholderClass}
                  maxLength={100}
                  autoCapitalize="words"
                  autoComplete="name"
                  accessibilityLabel="Full name"
                  className={inputClass}
                />
                {errors.fullName && <Text className={errorClass}>{errors.fullName}</Text>}
              </Animated.View>
            )}

            {/* Email */}
            <Animated.View layout={LinearTransition.duration(240)}>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('email', undefined);
                }}
                onBlur={() => handleBlur('email')}
                placeholder="Email"
                placeholderTextColor={placeholderClass}
                maxLength={255}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email address"
                className={inputClass}
              />
              {errors.email && <Text className={errorClass}>{errors.email}</Text>}
            </Animated.View>

            {/* Password — garis berhenti sebelum ikon mata */}
            <Animated.View layout={LinearTransition.duration(240)}>
              <View className="flex-row items-end">
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('password', undefined);
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="Password"
                  placeholderTextColor={placeholderClass}
                  maxLength={72}
                  secureTextEntry={!showPassword}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  accessibilityLabel="Password"
                  className={`${inputClass} flex-1`}
                />
                <Pressable
                  onPress={() => setShowPassword((visible) => !visible)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center">
                  <MaterialSymbol
                    loaded={fontsLoaded}
                    name={showPassword ? 'visibility' : 'visibility_off'}
                    className="text-[22px] leading-6 text-zinc-500"
                  />
                </Pressable>
              </View>
              {errors.password && <Text className={errorClass}>{errors.password}</Text>}
            </Animated.View>
          </Animated.View>

          {/* CTA — mengecil halus saat ditekan */}
          <AnimatedPressable
            onPress={handleSubmit}
            onPressIn={() => setCtaPressed(true)}
            onPressOut={() => setCtaPressed(false)}
            accessibilityRole="button"
            layout={LinearTransition.duration(240)}
            className="mt-10 items-center rounded-xl bg-white py-4 active:bg-zinc-200"
            style={ctaStyle}>
            <Text className="text-base font-semibold text-neutral-900">
              {mode === 'signup' ? 'Sign up' : 'Sign in'}
            </Text>
          </AnimatedPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
