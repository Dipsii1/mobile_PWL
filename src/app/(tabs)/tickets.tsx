import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { rise, T, TAB_INSET } from '@/constants/tixo';

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + TAB_INSET + 24,
        }}
        contentContainerClassName="px-6">
        <Animated.View entering={rise(0)}>
          <Text className="text-[28px] font-extrabold tracking-tight text-slate-900">Tiketku</Text>
          <Text className="mt-1 text-[14px] text-slate-500">Semua tiket yang sudah kamu beli.</Text>
        </Animated.View>

        <Animated.View entering={rise(120)} className="flex-1 items-center justify-center py-16">
          <View
            style={{ backgroundColor: T.accentSoft }}
            className="h-20 w-20 items-center justify-center rounded-3xl">
            <Icon name="qr_code_2" size={38} color={T.accent} />
          </View>
          <Text className="mt-5 text-lg font-extrabold text-slate-900">Belum ada tiket</Text>
          <Text className="mt-1.5 text-center text-[14px] leading-5 text-slate-500">
            Tiket konser yang kamu beli akan muncul di sini.
          </Text>
          <PressableScale
            onPress={() => router.navigate('/explore')}
            accessibilityRole="button"
            style={{ backgroundColor: T.ink }}
            className="mt-6 h-12 flex-row items-center gap-2 rounded-2xl px-5">
            <Text className="text-[15px] font-bold text-white">Jelajahi konser</Text>
            <Icon name="arrow_forward" size={18} color="#fff" />
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
