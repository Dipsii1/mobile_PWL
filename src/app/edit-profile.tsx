import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateBoxes } from '@/components/tixo/date-boxes';
import { Field } from '@/components/tixo/field';
import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { EASE_OUT, rise, smoothLayout, T } from '@/constants/tixo';
import { useAuth } from '@/context/auth-context';
import { useShake } from '@/hooks/use-shake';
import { ApiError } from '@/lib/api';
import {
  GENDER_OPTIONS,
  inputToIso,
  isoToInput,
  PHONE_PATTERN,
  type ProfileField,
} from '@/lib/profile';
import { AuthService } from '@/services/auth.service';
import type { Gender, ProfileResult, UpdateProfileInput } from '@/types/auth.types';

type Form = {
  full_name: string;
  phone: string;
  gender: Gender | null;
  birth_date: string; // DD/MM/YYYY
  address: string;
};

type Errors = Partial<Record<ProfileField, string>>;

function toForm(profile: ProfileResult): Form {
  return {
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    gender: (profile.gender as Gender | null) ?? null,
    birth_date: isoToInput(profile.birth_date),
    address: profile.address ?? '',
  };
}

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (form.full_name.trim().length < 2) errors.full_name = 'Nama minimal 2 karakter';
  const phone = form.phone.replace(/[\s-]/g, '');
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = 'Gunakan format 08xxxxxxxxxx';
  if (form.birth_date && !inputToIso(form.birth_date)) errors.birth_date = 'Tanggal lahir tidak valid';
  return errors;
}

// Hanya kirim field yang berubah; string kosong = kosongkan di backend.
function diff(initial: Form, form: Form): UpdateProfileInput {
  const input: UpdateProfileInput = {};
  const name = form.full_name.trim();
  if (name !== initial.full_name.trim()) input.full_name = name;
  const phone = form.phone.replace(/[\s-]/g, '');
  if (phone !== initial.phone) input.phone = phone || null;
  if (form.gender !== initial.gender) input.gender = form.gender;
  if (form.birth_date !== initial.birth_date) input.birth_date = form.birth_date ? inputToIso(form.birth_date) : null;
  const address = form.address.trim();
  if (address !== initial.address.trim()) input.address = address || null;
  return input;
}

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { focus } = useLocalSearchParams<{ focus?: ProfileField }>();
  const { token, updateProfile } = useAuth();
  const { style: shakeStyle, shake } = useShake();

  const [initial, setInitial] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const fetchProfile = useCallback(
    (isActive: () => boolean = () => true) => {
      if (!token) return;
      AuthService.profile(token)
        .then((profile) => {
          if (!isActive()) return;
          const next = toForm(profile);
          setInitial(next);
          setForm(next);
          setEmail(profile.email);
        })
        .catch((e) => {
          if (isActive()) setLoadError(e instanceof ApiError ? e.message : 'Gagal memuat profil.');
        });
    },
    [token],
  );

  useEffect(() => {
    let active = true;
    fetchProfile(() => active);
    return () => {
      active = false;
    };
  }, [fetchProfile]);

  function load() {
    setLoadError(null);
    fetchProfile();
  }

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError(null);
  }

  const changes = initial && form ? diff(initial, form) : {};
  const dirty = Object.keys(changes).length > 0;

  async function handleSave() {
    if (!form || !initial || saving) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      shake();
      return;
    }
    if (!dirty) {
      router.back();
      return;
    }

    setSaving(true);
    setServerError(null);
    try {
      await updateProfile(changes);
      router.back();
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fieldErrors as Errors);
        setServerError(e.message);
      } else {
        setServerError('Gagal menyimpan profil. Coba lagi.');
      }
      shake();
    } finally {
      setSaving(false);
    }
  }

  // Input paling bawah: tunggu keyboard selesai naik, lalu gulir supaya tetap terlihat.
  function revealBottom() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  }

  return (
    <View className="flex-1" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      {/* Android sudah edge-to-edge, jadi perlu 'padding' juga agar konten terdorong ke atas keyboard. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
          contentContainerClassName="px-6">
          <Animated.View entering={rise(0)} className="h-11 flex-row items-center justify-between">
            <PressableScale
              onPress={() => router.back()}
              accessibilityLabel="Kembali"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-full bg-white">
              <Icon name="arrow_back" size={20} />
            </PressableScale>
            <Text className="text-base font-extrabold tracking-tight text-slate-900">Edit profil</Text>
            <View className="h-11 w-11" />
          </Animated.View>

          <Animated.View entering={rise(80)} className="mt-6">
            <Text className="text-[28px] font-extrabold leading-[34px] tracking-tight text-slate-900">
              Lengkapi data{'\n'}dirimu.
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-slate-500">
              Data ini dipakai untuk tiket dan verifikasi saat masuk venue konser.
            </Text>
          </Animated.View>

          {!form ? (
            <View className="mt-16 items-center">
              {loadError ? (
                <>
                  <Text className="text-center text-[14px] font-medium text-red-600">{loadError}</Text>
                  <Text
                    onPress={load}
                    accessibilityRole="button"
                    className="mt-3 text-[14px] font-bold"
                    style={{ color: T.accent }}>
                    Coba lagi
                  </Text>
                </>
              ) : (
                <ActivityIndicator color={T.accent} />
              )}
            </View>
          ) : (
            <Animated.View entering={FadeIn.duration(300)} style={shakeStyle} className="mt-7 gap-5">
              <Field
                label="Nama lengkap"
                icon="badge"
                value={form.full_name}
                onChangeText={(text) => set('full_name', text)}
                error={errors.full_name}
                placeholder="Sesuai identitas"
                maxLength={100}
                autoCapitalize="words"
                autoComplete="name"
                autoFocus={focus === 'full_name'}
              />

              <View>
                <Text className="mb-2 text-[13px] font-semibold text-slate-600">Email</Text>
                <View className="h-14 flex-row items-center gap-3 rounded-2xl bg-slate-100 px-4">
                  <Icon name="mail" size={20} color="#9CA3AF" />
                  <Text numberOfLines={1} className="flex-1 text-[15px] font-medium text-slate-500">
                    {email}
                  </Text>
                  <Icon name="lock" size={16} color="#9CA3AF" />
                </View>
              </View>

              <Field
                label="Nomor telepon"
                icon="call"
                value={form.phone}
                onChangeText={(text) => set('phone', text.replace(/[^\d+\s-]/g, ''))}
                error={errors.phone}
                placeholder="08xxxxxxxxxx"
                maxLength={16}
                keyboardType="phone-pad"
                autoComplete="tel"
                autoFocus={focus === 'phone'}
              />

              <View>
                <Text className="mb-2 text-[13px] font-semibold text-slate-600">Jenis kelamin</Text>
                <View className="flex-row gap-2">
                  {GENDER_OPTIONS.map((option) => {
                    const selected = form.gender === option.value;
                    return (
                      <PressableScale
                        key={option.value}
                        onPress={() => set('gender', selected ? null : option.value)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={option.label}
                        style={{
                          backgroundColor: selected ? T.accentSoft : T.card,
                          borderColor: selected ? T.accent : T.line,
                        }}
                        className="h-14 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border-[1.5px]">
                        <Icon name={option.icon} size={18} color={selected ? T.accent : T.muted} />
                        <Text
                          className="text-[13px] font-bold"
                          style={{ color: selected ? T.accent : '#475569' }}>
                          {option.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              <DateBoxes
                label="Tanggal lahir"
                value={form.birth_date}
                onChange={(value) => set('birth_date', value)}
                error={errors.birth_date}
                autoFocus={focus === 'birth_date'}
                onFocus={revealBottom}
              />

              <Field
                label="Alamat"
                icon="location_on"
                value={form.address}
                onChangeText={(text) => set('address', text)}
                error={errors.address}
                placeholder="Jalan, kota, provinsi"
                maxLength={500}
                autoComplete="street-address"
                autoFocus={focus === 'address'}
                onFocus={revealBottom}
              />
            </Animated.View>
          )}

          {serverError ? (
            <Animated.View
              entering={FadeInDown.duration(360).easing(EASE_OUT)}
              exiting={FadeOut.duration(160)}
              layout={smoothLayout}
              className="mt-6 rounded-2xl bg-red-50 px-4 py-3">
              <Text className="text-[13px] font-medium leading-5 text-red-600">{serverError}</Text>
            </Animated.View>
          ) : null}
        </ScrollView>

        {form ? (
          <View
            style={{ paddingBottom: insets.bottom + 12, borderTopColor: T.line }}
            className="border-t bg-white px-6 pt-3">
            <PressableScale
              onPress={handleSave}
              disabled={saving || !dirty}
              accessibilityRole="button"
              accessibilityState={{ busy: saving, disabled: saving || !dirty }}
              style={{ backgroundColor: dirty ? T.ink : '#CBD5E1', opacity: saving ? 0.7 : 1 }}
              className="h-14 flex-row items-center justify-center gap-2 rounded-2xl">
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="check" size={20} color="#fff" />
                  <Text className="text-base font-bold text-white">Simpan perubahan</Text>
                </>
              )}
            </PressableScale>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
