import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { rise, T, TAB_INSET } from '@/constants/tixo';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import {
  formatDate,
  GENDER_LABEL,
  initials,
  missingFields,
  PROFILE_FIELDS,
  ROLE_LABEL,
  type ProfileField,
} from '@/lib/profile';
import { AuthService } from '@/services/auth.service';
import type { ProfileResult } from '@/types/auth.types';

function openEditor(focus?: ProfileField) {
  router.push({ pathname: '/edit-profile', params: focus ? { focus } : {} });
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, token, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setProfile(await AuthService.profile(token));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal memuat profil. Coba lagi.');
    }
  }, [token]);

  // Muat ulang tiap kali tab dibuka — termasuk setelah kembali dari Edit profil.
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }

  function confirmSignOut() {
    Alert.alert('Keluar dari akun?', 'Kamu perlu masuk lagi untuk melihat tiketmu.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: signOut },
    ]);
  }

  // Halaman lupa sandi hanya untuk tamu, jadi kirim link reset langsung dari sini.
  function confirmPasswordReset() {
    if (!email || sendingReset) return;
    Alert.alert('Ubah kata sandi', `Kami akan mengirim link untuk membuat kata sandi baru ke ${email}.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Kirim link',
        onPress: async () => {
          setSendingReset(true);
          try {
            const result = await AuthService.requestPasswordReset(email);
            Alert.alert('Cek email kamu', `${result.message}. Link berlaku selama 1 jam.`);
          } catch (e) {
            Alert.alert('Gagal mengirim', e instanceof ApiError ? e.message : 'Coba lagi nanti.');
          } finally {
            setSendingReset(false);
          }
        },
      },
    ]);
  }

  // Selama /auth/me dimuat, tampilkan data sesi yang tersimpan.
  const name = profile?.full_name || user?.full_name || 'Pengguna Tixo';
  const email = profile?.email ?? user?.email ?? '';
  const role = profile?.role ?? user?.role ?? 'buyer';
  const memberId = (profile?.public_id ?? user?.public_id ?? '').replace(/-/g, '').slice(0, 10).toUpperCase();
  const missing = missingFields(profile);
  const filled = PROFILE_FIELDS.length - missing.length;
  const percent = Math.round((filled / PROFILE_FIELDS.length) * 100);

  const values: Record<ProfileField, string | null> = {
    full_name: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    gender: profile?.gender ? (GENDER_LABEL[profile.gender] ?? profile.gender) : null,
    birth_date: formatDate(profile?.birth_date),
    address: profile?.address ?? null,
  };

  return (
    <View className="flex-1" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} colors={[T.accent]} />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + TAB_INSET + 24,
        }}
        contentContainerClassName="px-6">
        <Animated.View entering={rise(0)} className="h-11 flex-row items-center justify-between">
          <Text className="text-[22px] font-extrabold tracking-tight text-slate-900">Profil saya</Text>
          <PressableScale
            onPress={() => openEditor()}
            accessibilityRole="button"
            accessibilityLabel="Edit profil"
            className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <Icon name="edit" size={20} />
          </PressableScale>
        </Animated.View>

        {/* Kartu member bergaya tiket konser */}
        <Animated.View entering={rise(80)} className="mt-5">
          <MemberPass
            name={name}
            email={email}
            role={ROLE_LABEL[role] ?? role}
            memberId={memberId}
            avatar={profile?.avatar ?? null}
            loading={!profile && !error}
          />
        </Animated.View>

        {error ? (
          <Animated.View
            entering={FadeIn.duration(240)}
            className="mt-5 flex-row items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
            <Text className="flex-1 text-[13px] font-medium leading-5 text-red-600">{error}</Text>
            <Text onPress={fetchProfile} accessibilityRole="button" className="text-[13px] font-bold text-red-600">
              Coba lagi
            </Text>
          </Animated.View>
        ) : null}

        {/* Kelengkapan profil */}
        {profile && missing.length > 0 ? (
          <Animated.View entering={rise(160)} className="mt-5 rounded-3xl bg-white p-5">
            <View className="flex-row items-center gap-3">
              <View style={{ backgroundColor: '#FFF7ED' }} className="h-11 w-11 items-center justify-center rounded-full">
                <Icon name="assignment_ind" size={22} color="#EA580C" filled />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-slate-900">Lengkapi profilmu</Text>
                <Text className="mt-0.5 text-[12px] leading-4 text-slate-500">
                  Biar pembelian tiket & check-in di venue makin lancar.
                </Text>
              </View>
              <Text className="text-[18px] font-extrabold" style={{ color: T.accent }}>
                {percent}%
              </Text>
            </View>

            <View className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <View style={{ width: `${percent}%`, backgroundColor: T.accent }} className="h-full rounded-full" />
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {missing.map((field) => (
                <PressableScale
                  key={field.key}
                  onPress={() => openEditor(field.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Isi ${field.label}`}
                  style={{ backgroundColor: T.accentSoft }}
                  className="h-9 flex-row items-center gap-1 rounded-full pl-2.5 pr-3.5">
                  <Icon name="add" size={16} color={T.accent} />
                  <Text className="text-[12px] font-bold" style={{ color: T.accent }}>
                    {field.label}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {/* Data pribadi */}
        <Animated.View entering={rise(220)}>
          <SectionTitle title="Data pribadi" action="Edit" onAction={() => openEditor()} />
          <View className="rounded-3xl bg-white px-4">
            {PROFILE_FIELDS.map((field, index) => (
              <InfoRow
                key={field.key}
                icon={field.icon}
                label={field.label}
                value={values[field.key]}
                loading={!profile}
                last={index === PROFILE_FIELDS.length - 1}
                onPress={() => openEditor(field.key)}
              />
            ))}
            <InfoRow icon="mail" label="Email" value={email || null} loading={false} last locked />
          </View>
        </Animated.View>

        {/* Tiket & konser */}
        <Animated.View entering={rise(280)}>
          <SectionTitle title="Tiket & konser" />
          <View className="rounded-3xl bg-white px-4">
            <MenuRow
              icon="confirmation_number"
              tint={T.accent}
              tintSoft={T.accentSoft}
              title="Tiketku"
              subtitle="E-ticket & QR untuk masuk venue"
              onPress={() => router.navigate('/tickets')}
            />
            <MenuRow
              icon="music_note"
              tint="#EA580C"
              tintSoft="#FFF7ED"
              title="Jelajah konser"
              subtitle="Temukan konser band favoritmu"
              onPress={() => router.navigate('/explore')}
              last
            />
          </View>
        </Animated.View>

        {/* Keamanan */}
        <Animated.View entering={rise(340)}>
          <SectionTitle title="Keamanan akun" />
          <View className="rounded-3xl bg-white px-4">
            <MenuRow
              icon="lock_reset"
              tint="#2563EB"
              tintSoft="#EFF6FF"
              title="Ubah kata sandi"
              subtitle="Kirim link reset ke email kamu"
              busy={sendingReset}
              onPress={confirmPasswordReset}
            />
            <MenuRow
              icon="logout"
              tint="#DC2626"
              tintSoft="#FEF2F2"
              title="Keluar"
              subtitle="Keluar dari akun di perangkat ini"
              danger
              last
              onPress={confirmSignOut}
            />
          </View>
        </Animated.View>

        <Text className="mt-6 text-center text-[12px] text-slate-400">Tixo · Tiket konser favoritmu</Text>
      </ScrollView>
    </View>
  );
}

type MemberPassProps = {
  name: string;
  email: string;
  role: string;
  memberId: string;
  avatar: string | null;
  loading: boolean;
};

function MemberPass({ name, email, role, memberId, avatar, loading }: MemberPassProps) {
  return (
    <View className="overflow-hidden rounded-[28px]">
      <LinearGradient
        colors={[T.ink, '#2B2170', T.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18 }}>
        {/* Ornamen lingkaran ala lampu panggung */}
        <View
          pointerEvents="none"
          style={{ backgroundColor: 'rgba(212,246,107,0.16)' }}
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full"
        />
        <View
          pointerEvents="none"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          className="absolute -bottom-16 right-16 h-36 w-36 rounded-full"
        />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Icon name="graphic_eq" size={18} color={T.lime} />
            <Text className="text-[12px] font-extrabold tracking-[2px] text-white/80">TIXO PASS</Text>
          </View>
          <View style={{ backgroundColor: T.lime }} className="flex-row items-center gap-1 rounded-full px-2.5 py-1">
            <Icon name="verified" size={13} color={T.ink} filled />
            <Text className="text-[11px] font-extrabold" style={{ color: T.ink }}>
              {role}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center gap-4">
          <View className="rounded-full border-2 border-white/30 p-0.5">
            {avatar ? (
              <Image source={{ uri: avatar }} className="h-16 w-16 rounded-full bg-white/20" />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
                <Text className="text-[22px] font-extrabold text-white">{initials(name)}</Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text numberOfLines={1} className="text-[20px] font-extrabold tracking-tight text-white">
              {name}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[13px] text-white/70">
              {email}
            </Text>
          </View>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : null}
        </View>
      </LinearGradient>

      {/* Sobekan tiket */}
      <View className="h-5 flex-row items-center bg-white">
        <View style={{ backgroundColor: T.bg }} className="-ml-2.5 h-5 w-5 rounded-full" />
        <View className="mx-2 flex-1 border-t-2 border-dashed border-slate-200" />
        <View style={{ backgroundColor: T.bg }} className="-mr-2.5 h-5 w-5 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between bg-white px-5 pb-4 pt-1">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">ID Member</Text>
          <Text className="mt-0.5 text-[15px] font-extrabold tracking-[1.5px] text-slate-900">
            {memberId ? `#${memberId}` : '—'}
          </Text>
        </View>
        <PressableScale
          onPress={() => router.navigate('/tickets')}
          accessibilityRole="button"
          accessibilityLabel="Buka tiketku"
          style={{ backgroundColor: T.ink }}
          className="h-11 flex-row items-center gap-1.5 rounded-full px-4">
          <Icon name="qr_code_2" size={18} color="#fff" />
          <Text className="text-[13px] font-bold text-white">Tiketku</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="mb-2.5 mt-7 flex-row items-center justify-between px-1">
      <Text className="text-[13px] font-bold uppercase tracking-wider text-slate-500">{title}</Text>
      {action ? (
        <Text onPress={onAction} accessibilityRole="button" className="text-[13px] font-bold" style={{ color: T.accent }}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

type InfoRowProps = {
  icon: string;
  label: string;
  value: string | null;
  loading: boolean;
  last?: boolean;
  locked?: boolean;
  onPress?: () => void;
};

function InfoRow({ icon, label, value, loading, last, locked, onPress }: InfoRowProps) {
  const empty = !value && !loading;
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={onPress}
      disabled={locked}
      accessibilityRole={locked ? 'text' : 'button'}
      accessibilityLabel={`${label}: ${value ?? 'belum diisi'}`}
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: '#F1F5F9' }}
      className="flex-row items-center gap-3 py-3.5">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
        <Icon name={icon} size={18} color={T.muted} />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] text-slate-500">{label}</Text>
        <Text
          numberOfLines={2}
          className={`mt-0.5 text-[14px] ${value ? 'font-semibold text-slate-900' : 'font-medium text-slate-300'}`}>
          {value ?? (loading ? '…' : 'Belum diisi')}
        </Text>
      </View>
      {locked ? (
        <Icon name="lock" size={16} color="#CBD5E1" />
      ) : empty ? (
        <View style={{ backgroundColor: T.accentSoft }} className="rounded-full px-3 py-1.5">
          <Text className="text-[12px] font-bold" style={{ color: T.accent }}>
            Isi
          </Text>
        </View>
      ) : (
        <Icon name="chevron_right" size={20} color="#CBD5E1" />
      )}
    </PressableScale>
  );
}

type MenuRowProps = {
  icon: string;
  tint: string;
  tintSoft: string;
  title: string;
  subtitle: string;
  danger?: boolean;
  last?: boolean;
  busy?: boolean;
  onPress: () => void;
};

function MenuRow({ icon, tint, tintSoft, title, subtitle, danger, last, busy, onPress }: MenuRowProps) {
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: '#F1F5F9' }}
      className="flex-row items-center gap-3.5 py-3.5">
      <View style={{ backgroundColor: tintSoft }} className="h-10 w-10 items-center justify-center rounded-full">
        <Icon name={icon} size={20} color={tint} filled />
      </View>
      <View className="flex-1">
        <Text className={`text-[15px] font-bold ${danger ? 'text-red-600' : 'text-slate-900'}`}>{title}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12px] text-slate-500">
          {subtitle}
        </Text>
      </View>
      {busy ? <ActivityIndicator size="small" color={tint} /> : <Icon name="chevron_right" size={20} color="#CBD5E1" />}
    </PressableScale>
  );
}
