import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDialog } from '@/components/tixo/dialog';
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
  const dialog = useDialog();
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setProfile(await AuthService.profile(token));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal memuat profil. Coba lagi.');
    }
  }, [token]);

  // Muat ulang tiap tab dibuka.
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
    dialog.show({
      tone: 'danger',
      icon: 'logout',
      title: 'Keluar dari akun?',
      message: 'Kamu perlu masuk lagi untuk melihat tiketmu.',
      actions: [
        { label: 'Batal', style: 'cancel' },
        { label: 'Keluar', style: 'destructive', onPress: signOut },
      ],
    });
  }

  // forgot-password khusus tamu, jadi kirim langsung.
  function confirmPasswordReset() {
    if (!email) return;
    dialog.show({
      icon: 'lock_reset',
      title: 'Ubah kata sandi',
      message: `Kami akan mengirim link untuk membuat kata sandi baru ke ${email}.`,
      actions: [
        { label: 'Batal', style: 'cancel' },
        {
          label: 'Kirim link',
          onPress: async () => {
            try {
              const result = await AuthService.requestPasswordReset(email);
              dialog.show({
                tone: 'success',
                icon: 'mark_email_read',
                title: 'Cek email kamu',
                message: `${result.message}. Link berlaku selama 1 jam.`,
              });
            } catch (e) {
              dialog.show({
                tone: 'danger',
                title: 'Gagal mengirim',
                message: e instanceof ApiError ? e.message : 'Coba lagi nanti.',
              });
            }
          },
        },
      ],
    });
  }

  // Fallback ke data sesi selama memuat.
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
    <View className="flex-1 bg-page">
      <StatusBar style="light" />
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
          <Text className="text-[22px] font-extrabold tracking-tight text-fg">Profil saya</Text>
          <PressableScale
            onPress={() => openEditor()}
            accessibilityRole="button"
            accessibilityLabel="Edit profil"
            className="h-11 w-11 items-center justify-center rounded-full bg-card">
            <Icon name="edit" size={20} />
          </PressableScale>
        </Animated.View>

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
            className="mt-5 flex-row items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3">
            <Text className="flex-1 text-[13px] font-medium leading-5 text-red-400">{error}</Text>
            <Text onPress={fetchProfile} accessibilityRole="button" className="text-[13px] font-bold text-red-400">
              Coba lagi
            </Text>
          </Animated.View>
        ) : null}

        {/* Kelengkapan profil */}
        {profile && missing.length > 0 ? (
          <Animated.View entering={rise(160)} className="mt-5 rounded-3xl bg-card p-5">
            <View className="flex-row items-center gap-3">
              <View style={{ backgroundColor: '#EA580C26' }} className="h-11 w-11 items-center justify-center rounded-full">
                <Icon name="assignment_ind" size={22} color="#EA580C" filled />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-fg">Lengkapi profilmu</Text>
                <Text className="mt-0.5 text-[12px] leading-4 text-muted">
                  Biar pembelian tiket & check-in di venue makin lancar.
                </Text>
              </View>
              <Text className="text-[18px] font-extrabold text-accent">
                {percent}%
              </Text>
            </View>

            <View className="mt-4 h-2 overflow-hidden rounded-full bg-line">
              <View style={{ width: `${percent}%`, backgroundColor: T.accent }} className="h-full rounded-full" />
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {missing.map((field) => (
                <PressableScale
                  key={field.key}
                  onPress={() => openEditor(field.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Isi ${field.label}`}
                  className="h-9 flex-row items-center gap-1 rounded-full pl-2.5 pr-3.5 bg-accent-soft">
                  <Icon name="add" size={16} color={T.accent} />
                  <Text className="text-[12px] font-bold text-accent">
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
          <View className="rounded-3xl bg-card px-4">
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
          <View className="rounded-3xl bg-card px-4">
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
              tintSoft="#EA580C26"
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
          <View className="rounded-3xl bg-card px-4">
            <MenuRow
              icon="lock_reset"
              tint="#2563EB"
              tintSoft="#2563EB26"
              title="Ubah kata sandi"
              subtitle="Kirim link reset ke email kamu"
              onPress={confirmPasswordReset}
            />
            <MenuRow
              icon="logout"
              tint="#DC2626"
              tintSoft="#DC262626"
              title="Keluar"
              subtitle="Keluar dari akun di perangkat ini"
              danger
              last
              onPress={confirmSignOut}
            />
          </View>
        </Animated.View>

        <Text className="mt-6 text-center text-[12px] text-muted">Tixo · Tiket konser favoritmu</Text>
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
        colors={[T.card, '#2A1000', T.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18 }}>
        <View
          pointerEvents="none"
          style={{ backgroundColor: 'rgba(255,122,0,0.18)' }}
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full"
        />
        <View
          pointerEvents="none"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          className="absolute -bottom-16 right-16 h-36 w-36 rounded-full"
        />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Icon name="graphic_eq" size={18} color={T.glow} />
            <Text className="text-[12px] font-extrabold tracking-[2px] text-white/80">TIXO PASS</Text>
          </View>
          <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1 bg-accent">
            <Icon name="verified" size={13} color={T.onAccent} filled />
            <Text className="text-[11px] font-extrabold text-on-accent">
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
      <View className="h-5 flex-row items-center bg-card">
        <View className="-ml-2.5 h-5 w-5 rounded-full bg-page" />
        <View className="mx-2 flex-1 border-t-2 border-dashed border-line" />
        <View className="-mr-2.5 h-5 w-5 rounded-full bg-page" />
      </View>

      <View className="flex-row items-center justify-between bg-card px-5 pb-4 pt-1">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted">ID Member</Text>
          <Text className="mt-0.5 text-[15px] font-extrabold tracking-[1.5px] text-fg">
            {memberId ? `#${memberId}` : '—'}
          </Text>
        </View>
        <PressableScale
          onPress={() => router.navigate('/tickets')}
          accessibilityRole="button"
          accessibilityLabel="Buka tiketku"
          className="h-11 flex-row items-center gap-1.5 rounded-full px-4 bg-accent">
          <Icon name="qr_code_2" size={18} color={T.onAccent} />
          <Text className="text-[13px] font-bold text-on-accent">Tiketku</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="mb-2.5 mt-7 flex-row items-center justify-between px-1">
      <Text className="text-[13px] font-bold uppercase tracking-wider text-muted">{title}</Text>
      {action ? (
        <Text onPress={onAction} accessibilityRole="button" className="text-[13px] font-bold text-accent">
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
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: T.line }}
      className="flex-row items-center gap-3 py-3.5">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-line">
        <Icon name={icon} size={18} color={T.muted} />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] text-muted">{label}</Text>
        <Text
          numberOfLines={2}
          className={`mt-0.5 text-[14px] ${value ? 'font-semibold text-fg' : 'font-medium text-muted/50'}`}>
          {value ?? (loading ? '…' : 'Belum diisi')}
        </Text>
      </View>
      {locked ? (
        <Icon name="lock" size={16} color={T.muted} />
      ) : empty ? (
        <View className="rounded-full px-3 py-1.5 bg-accent-soft">
          <Text className="text-[12px] font-bold text-accent">
            Isi
          </Text>
        </View>
      ) : (
        <Icon name="chevron_right" size={20} color={T.muted} />
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
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: T.line }}
      className="flex-row items-center gap-3.5 py-3.5">
      <View style={{ backgroundColor: tintSoft }} className="h-10 w-10 items-center justify-center rounded-full">
        <Icon name={icon} size={20} color={tint} filled />
      </View>
      <View className="flex-1">
        <Text className={`text-[15px] font-bold ${danger ? 'text-red-400' : 'text-fg'}`}>{title}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12px] text-muted">
          {subtitle}
        </Text>
      </View>
      {busy ? <ActivityIndicator size="small" color={tint} /> : <Icon name="chevron_right" size={20} color={T.muted} />}
    </PressableScale>
  );
}
