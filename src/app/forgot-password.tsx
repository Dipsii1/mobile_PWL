import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/components/tixo/field';
import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { EASE_OUT, rise, smoothLayout, T } from '@/constants/tixo';
import { useShake } from '@/hooks/use-shake';
import { ApiError } from '@/lib/api';
import { AuthService } from '@/services/auth.service';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  const [serverError, setServerError] = useState<string>();
  const [sentMessage, setSentMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const { style: shakeStyle, shake: runShake } = useShake();
  // Masuk bertahap, sama seperti halaman masuk/daftar.
  const step = (i: number) => rise(i * 80);

  function validate() {
    return /^\S+@\S+\.\S+$/.test(email.trim()) ? undefined : 'Masukkan email yang valid.';
  }

  async function handleSubmit() {
    if (submitting) return;
    const message = validate();
    setError(message);
    setServerError(undefined);
    if (message) {
      runShake();
      return;
    }

    setSubmitting(true);
    try {
      const res = await AuthService.requestPasswordReset(email.trim());
      setSentMessage(res.message);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.email) setError(e.fieldErrors.email);
      setServerError(e instanceof ApiError ? e.message : 'Terjadi kesalahan. Coba lagi.');
      runShake();
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/auth');
  }

  return (
    <View className="flex-1 overflow-hidden bg-page">
      <StatusBar style="light" />
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-accent-soft"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}
          contentContainerClassName="px-6">
          <Animated.View entering={rise(0)} className="h-11 flex-row items-center justify-between">
            <PressableScale
              onPress={goBack}
              accessibilityLabel="Kembali"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-full bg-card">
              <Icon name="arrow_back" size={20} />
            </PressableScale>
            <Text className="text-base font-extrabold tracking-tight text-fg">Tixo</Text>
            <View className="h-11 w-11" />
          </Animated.View>

          <Animated.View
            key={sentMessage ? 'icon-sent' : 'icon-form'}
            entering={step(1)}
            className="mt-10 h-16 w-16 items-center justify-center rounded-3xl bg-accent-soft">
            <Icon name={sentMessage ? 'mark_email_read' : 'lock_reset'} size={30} color={T.accent} />
          </Animated.View>

          <Animated.View
            key={sentMessage ? 'title-sent' : 'title-form'}
            entering={step(2)}
            className="mt-7">
            <Text className="text-[32px] font-extrabold leading-[38px] tracking-tight text-fg">
              {sentMessage ? 'Cek email\nkamu.' : 'Lupa kata\nsandi?'}
            </Text>
            <Text className="mt-3 text-[15px] leading-5 text-muted">
              {sentMessage
                ? `${sentMessage}. Link berlaku selama 1 jam.`
                : 'Masukkan email akunmu, kami akan mengirim link untuk membuat kata sandi baru.'}
            </Text>
          </Animated.View>

          {sentMessage ? (
            <Animated.View key="body-sent" entering={step(3)}>
              <View className="mt-7 flex-row items-center gap-3 rounded-2xl bg-card px-4 py-4">
                <Icon name="mail" size={20} color={T.muted} />
                <Text className="flex-1 text-[15px] font-semibold text-fg">{email.trim()}</Text>
              </View>

              <PressableScale
                onPress={goBack}
                accessibilityRole="button"
                className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-accent">
                <Text className="text-base font-bold text-on-accent">Kembali ke halaman masuk</Text>
                <Icon name="arrow_forward" size={20} color={T.onAccent} />
              </PressableScale>

              <Text
                onPress={() => setSentMessage(undefined)}
                accessibilityRole="button"
                className="mt-5 text-center text-[13px] font-semibold text-accent">
                Belum menerima email? Kirim ulang
              </Text>
            </Animated.View>
          ) : (
            <Animated.View key="body-form" entering={step(3)}>
              <Animated.View style={shakeStyle} className="mt-7">
                <Field
                  label="Email"
                  icon="mail"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(undefined);
                  }}
                  onBlur={() => setError(validate())}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="send"
                  error={error}
                  placeholder="nama@email.com"
                  maxLength={255}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus={!params.email}
                  accessibilityLabel="Email"
                />
              </Animated.View>

              {serverError && (
                <Animated.View
                  entering={FadeInDown.duration(360).easing(EASE_OUT)}
                  exiting={FadeOut.duration(160)}
                  layout={smoothLayout}
                  className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3">
                  <Text className="text-[13px] font-medium leading-5 text-red-400">{serverError}</Text>
                </Animated.View>
              )}

              <Animated.View layout={smoothLayout}>
                <PressableScale
                  onPress={handleSubmit}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityState={{ busy: submitting, disabled: submitting }}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                  className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-accent">
                  {submitting ? (
                    <Animated.View key="busy" entering={FadeIn.duration(200)}>
                      <ActivityIndicator color={T.onAccent} />
                    </Animated.View>
                  ) : (
                    <Animated.View
                      key="cta"
                      entering={FadeIn.duration(260).easing(EASE_OUT)}
                      className="flex-row items-center gap-2">
                      <Text className="text-base font-bold text-on-accent">Kirim link reset</Text>
                      <Icon name="arrow_forward" size={20} color={T.onAccent} />
                    </Animated.View>
                  )}
                </PressableScale>
              </Animated.View>

              <Text
                onPress={goBack}
                accessibilityRole="button"
                className="mt-5 text-center text-[13px] font-semibold text-muted">
                Ingat kata sandimu? <Text className="text-accent">Masuk</Text>
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
