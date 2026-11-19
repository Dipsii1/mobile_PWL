import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { rise, T, TAB_INSET } from '@/constants/tixo';
import { useAuth } from '@/context/auth-context';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const name = user?.full_name ?? 'Pengguna Tixo';

  return (
    <View className="flex-1" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + TAB_INSET + 24,
        }}
        contentContainerClassName="px-6">
        <Animated.View entering={rise(0)}>
          <Text className="text-[28px] font-extrabold tracking-tight text-slate-900">Profil</Text>
        </Animated.View>

        <Animated.View entering={rise(100)} className="mt-6 items-center rounded-3xl bg-white px-6 py-7">
          <View
            style={{ backgroundColor: T.accent }}
            className="h-20 w-20 items-center justify-center rounded-full">
            <Text className="text-2xl font-extrabold text-white">{initials(name)}</Text>
          </View>
          <Text className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">{name}</Text>
          {user?.email ? <Text className="mt-1 text-[14px] text-slate-500">{user.email}</Text> : null}
        </Animated.View>

        <Animated.View entering={rise(200)}>
          <PressableScale
            onPress={signOut}
            accessibilityRole="button"
            className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white">
            <Icon name="logout" size={20} color="#EF4444" />
            <Text className="text-base font-bold text-red-500">Keluar</Text>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
