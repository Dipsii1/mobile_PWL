import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/components/tixo/field';
import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { TicketMark } from '@/components/tixo/ticket-mark';
import { EASE_OUT, SPRING, T } from '@/constants/tixo';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { AuthService } from '@/services/auth.service';

type Notice = { tone: 'error' | 'success'; text: string; action?: 'resend' };

// Aturan validasi mengikuti Zod schema backend (Backend_UKK — auth.validation.ts).
type Mode = 'login' | 'signup';
type FieldKey = 'fullName' | 'email' | 'password';
type FieldErrors = Partial<Record<FieldKey, string>>;

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  signup: {
    title: 'Buat akun,\nmulai petualangan.',
    subtitle: 'Simpan semua tiket acaramu di satu tempat.',
    cta: 'Buat akun',
  },
  login: {
    title: 'Selamat datang\nkembali.',
    subtitle: 'Masuk untuk melihat tiket dan acaramu.',
    cta: 'Masuk',
  },
};

const layout = LinearTransition.duration(220);

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const { signIn, signUp } = useAuth();
  const [canGoBack] = useState(() => router.canGoBack());
  const insets = useSafeAreaInsets();

  const segWidth = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => {
    const half = Math.max((segWidth.get() - 8) / 2, 0);
    return {
      width: half,
      transform: [{ translateX: withSpring(mode === 'signup' ? half : 0, SPRING) }],
    };
  });

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));

  function setError(key: FieldKey, message?: string) {
    setErrors((prev) => ({ ...prev, [key]: message }));
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setNotice(null);
  }

  function runShake() {
    shake.set(
      withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      ),
    );
  }

  function showApiError(error: unknown) {
    if (error instanceof ApiError) {
      const fieldErrors: FieldErrors = {};
      for (const key of ['fullName', 'email', 'password'] as const) {
        if (error.fieldErrors[key]) fieldErrors[key] = error.fieldErrors[key];
      }
      setErrors(fieldErrors);
      setNotice({
        tone: 'error',
        text: error.message,
        action: error.message === 'Email belum diverifikasi' ? 'resend' : undefined,
      });
    } else {
      setNotice({ tone: 'error', text: 'Terjadi kesalahan. Coba lagi.' });
    }
    runShake();
  }

  async function handleResendVerification() {
    try {
      const res = await AuthService.requestEmailVerification(email.trim());
      setNotice({ tone: 'success', text: res.message });
    } catch (error) {
      showApiError(error);
    }
  }

  function handleForgotPassword() {
    router.push({ pathname: '/forgot-password', params: email.trim() ? { email: email.trim() } : {} });
  }

  function validateField(key: FieldKey): string | undefined {
    switch (key) {
      case 'fullName':
        return fullName.trim().length >= 2 ? undefined : 'Nama minimal 2 karakter.';
      case 'email':
        return /^\S+@\S+\.\S+$/.test(email) ? undefined : 'Masukkan email yang valid.';
      case 'password':
        if (mode === 'signup') {
          return password.length >= 8 ? undefined : 'Kata sandi minimal 8 karakter.';
        }
        return password.length >= 1 ? undefined : 'Masukkan kata sandi.';
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    const keys: FieldKey[] =
      mode === 'signup' ? ['fullName', 'email', 'password'] : ['email', 'password'];
    const nextErrors: FieldErrors = {};
    for (const key of keys) {
      const message = validateField(key);
      if (message) nextErrors[key] = message;
    }
    setErrors(nextErrors);
    setNotice(null);
    if (Object.keys(nextErrors).length > 0) {
      runShake();
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const res = await signUp({ fullName: fullName.trim(), email: email.trim(), password });
        // Backend mewajibkan verifikasi email sebelum login.
        setMode('login');
        setPassword('');
        setNotice({ tone: 'success', text: res.message });
      } else {
        await signIn({ email: email.trim(), password });
        // Navigasi ke /home ditangani Stack.Protected di _layout.
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setSubmitting(false);
    }
  }

  const copy = COPY[mode];

  return (
    <View className="flex-1 overflow-hidden" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      <View
        pointerEvents="none"
        style={{ backgroundColor: T.accentSoft }}
        className="absolute -right-16 -top-10 h-56 w-56 rounded-full"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}
          contentContainerClassName="px-6">
          <View className="h-11 flex-row items-center justify-between">
            {canGoBack ? (
              <PressableScale
                onPress={() => router.canGoBack() && router.back()}
                accessibilityLabel="Kembali"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-full bg-white">
                <Icon name="arrow_back" size={20} />
              </PressableScale>
            ) : (
              <View className="h-11 w-11" />
            )}
            <Text className="text-base font-extrabold tracking-tight text-slate-900">tixo</Text>
            <View className="h-11 w-11" />
          </View>

          <Animated.View entering={FadeInDown.duration(360).easing(EASE_OUT)} className="mt-10">
            <TicketMark size={1.1} />
          </Animated.View>

          <View className="mt-7 min-h-[132px]">
            <Animated.View
              key={mode}
              entering={FadeInDown.duration(300).easing(EASE_OUT)}
              exiting={FadeOutUp.duration(140)}>
              <Text className="text-[32px] font-extrabold leading-[38px] tracking-tight text-slate-900">
                {copy.title}
              </Text>
              <Text className="mt-3 text-[15px] leading-5 text-slate-500">{copy.subtitle}</Text>
            </Animated.View>
          </View>

          <Animated.View
            entering={FadeInUp.delay(100).duration(340).easing(EASE_OUT)}
            onLayout={(e) => segWidth.set(e.nativeEvent.layout.width)}
            className="mt-4 flex-row rounded-2xl bg-slate-200/70 p-1">
            <Animated.View
              style={indicatorStyle}
              className="absolute bottom-1 left-1 top-1 rounded-xl bg-white"
            />
            {(['login', 'signup'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === m }}
                className="z-10 flex-1 items-center py-3">
                <Text
                  className={`text-sm font-bold ${mode === m ? 'text-slate-900' : 'text-slate-500'}`}>
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </Text>
              </Pressable>
            ))}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(160).duration(340).easing(EASE_OUT)}
            layout={layout}
            style={shakeStyle}
            className="mt-7 gap-4">
            {mode === 'signup' && (
              <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(140)}>
                <Field
                  label="Nama lengkap"
                  icon="person"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError('fullName', undefined);
                  }}
                  onBlur={() => setError('fullName', validateField('fullName'))}
                  error={errors.fullName}
                  placeholder="Contoh: Nabila Putri"
                  maxLength={100}
                  autoCapitalize="words"
                  autoComplete="name"
                  accessibilityLabel="Nama lengkap"
                />
              </Animated.View>
            )}

            <Animated.View layout={layout}>
              <Field
                label="Email"
                icon="mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('email', undefined);
                }}
                onBlur={() => setError('email', validateField('email'))}
                error={errors.email}
                placeholder="nama@email.com"
                maxLength={255}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email"
              />
            </Animated.View>

            <Animated.View layout={layout}>
              <Field
                label="Kata sandi"
                icon="lock"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('password', undefined);
                }}
                onBlur={() => setError('password', validateField('password'))}
                error={errors.password}
                placeholder={mode === 'signup' ? 'Minimal 8 karakter' : 'Kata sandi kamu'}
                maxLength={72}
                secureTextEntry={!showPassword}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                accessibilityLabel="Kata sandi"
                right={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    accessibilityRole="button"
                    className="h-12 w-12 items-center justify-center">
                    <Icon
                      name={showPassword ? 'visibility' : 'visibility_off'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </Pressable>
                }
              />
            </Animated.View>

            {mode === 'login' && (
              <Animated.Text
                entering={FadeIn.duration(180)}
                onPress={handleForgotPassword}
                accessibilityRole="button"
                className="self-end text-[13px] font-semibold"
                style={{ color: T.accent }}>
                Lupa kata sandi?
              </Animated.Text>
            )}
          </Animated.View>

          {notice && (
            <Animated.View
              entering={FadeIn.duration(180)}
              layout={layout}
              className={`mt-6 rounded-2xl px-4 py-3 ${
                notice.tone === 'error' ? 'bg-red-50' : 'bg-emerald-50'
              }`}>
              <Text
                className={`text-[13px] font-medium leading-5 ${
                  notice.tone === 'error' ? 'text-red-600' : 'text-emerald-700'
                }`}>
                {notice.text}
              </Text>
              {notice.action === 'resend' && (
                <Text
                  onPress={handleResendVerification}
                  accessibilityRole="button"
                  className="mt-1 text-[13px] font-bold"
                  style={{ color: T.accent }}>
                  Kirim ulang email verifikasi
                </Text>
              )}
            </Animated.View>
          )}

          <Animated.View layout={layout}>
            <PressableScale
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityState={{ busy: submitting, disabled: submitting }}
              style={{ backgroundColor: T.ink, opacity: submitting ? 0.7 : 1 }}
              className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl">
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-base font-bold text-white">{copy.cta}</Text>
                  <Icon name="arrow_forward" size={20} color="#fff" />
                </>
              )}
            </PressableScale>

            <Text className="mt-5 text-center text-xs leading-5 text-slate-400">
              Dengan melanjutkan, kamu menyetujui ketentuan layanan tixo.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
