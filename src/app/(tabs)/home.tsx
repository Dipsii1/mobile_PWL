import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/tixo/chip';
import { EventRow } from '@/components/tixo/event-row';
import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { EASE_OUT, T, TAB_INSET } from '@/constants/tixo';
import { CATEGORIES, CATEGORY_ICON, EVENTS, type Category, type TixoEvent } from '@/data/events';

const GAP = 12;
const FEATURED = EVENTS.slice(0, 4);

type CarouselProps = { index: number; width: number; scrollX: SharedValue<number> };

// Kartu mengecil & meredup saat bergeser dari tengah (dihitung di UI thread).
function FeaturedCard({ event, index, width, scrollX }: CarouselProps & { event: TixoEvent }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollX.get() / (width + GAP) - index);
    return {
      opacity: interpolate(d, [0, 1], [1, 0.6], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, 1], [1, 0.92], Extrapolation.CLAMP) }],
    };
  });

  return (
    <Animated.View style={[style, { width }]}>
      <View style={{ backgroundColor: event.tint }} className="h-52 overflow-hidden rounded-[28px] p-5">
        <View className="absolute -bottom-6 -right-4 opacity-20">
          <Icon name={event.icon} size={150} color="#fff" filled />
        </View>
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-white/20 px-3 py-1.5">
            <Text className="text-xs font-semibold text-white">{event.category}</Text>
          </View>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Icon name="favorite" size={18} color="#fff" />
          </View>
        </View>
        <View className="mt-auto">
          <Text numberOfLines={2} className="text-[22px] font-extrabold leading-7 text-white">
            {event.title}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[13px] font-medium text-white/85">{event.date}</Text>
            <View style={{ backgroundColor: T.lime }} className="rounded-full px-3 py-1.5">
              <Text className="text-xs font-extrabold text-slate-900">{event.price}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function Dot({ index, width, scrollX }: CarouselProps) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollX.get() / (width + GAP) - index);
    return {
      width: interpolate(d, [0, 1], [20, 6], Extrapolation.CLAMP),
      opacity: interpolate(d, [0, 1], [1, 0.35], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[style, { backgroundColor: T.ink }]} className="h-1.5 rounded-full" />;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const cardW = screenW - 48;
  const [category, setCategory] = useState<Category>('Semua');

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.set(e.contentOffset.x);
  });

  const upcoming = EVENTS.filter((e) => category === 'Semua' || e.category === category);

  return (
    <View className="flex-1" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + TAB_INSET + 24,
        }}>
        <Animated.View entering={FadeInDown.duration(360).easing(EASE_OUT)}>
          <View className="flex-row items-center justify-between px-6">
            <View>
              <Text className="text-[13px] font-medium text-slate-500">Halo, selamat datang</Text>
              <Text className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
                Mau ke mana hari ini?
              </Text>
            </View>
            <PressableScale
              accessibilityLabel="Notifikasi"
              accessibilityRole="button"
              className="h-12 w-12 items-center justify-center rounded-full bg-white">
              <Icon name="notifications" size={22} />
              <View style={{ backgroundColor: T.accent }} className="absolute right-3 top-3 h-2 w-2 rounded-full" />
            </PressableScale>
          </View>

          <View className="mt-5 px-6">
            <PressableScale
              scaleTo={0.98}
              onPress={() => router.navigate('/explore')}
              accessibilityRole="search"
              className="h-14 flex-row items-center gap-3 rounded-2xl bg-white px-4">
              <Icon name="search" size={22} color={T.muted} />
              <Text className="flex-1 text-[15px] text-slate-400">Cari konser, seminar, festival…</Text>
              <View style={{ backgroundColor: T.accentSoft }} className="h-9 w-9 items-center justify-center rounded-xl">
                <Icon name="tune" size={18} color={T.accent} />
              </View>
            </PressableScale>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400).easing(EASE_OUT)}>
          <View className="mt-7 flex-row items-end justify-between px-6">
            <Text className="text-lg font-extrabold text-slate-900">Unggulan</Text>
            <Text className="text-[13px] font-semibold" style={{ color: T.accent }}>
              Lihat semua
            </Text>
          </View>

          <Animated.ScrollView
            horizontal
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardW + GAP}
            contentContainerStyle={{ paddingHorizontal: 24, gap: GAP }}
            className="mt-3">
            {FEATURED.map((ev, i) => (
              <FeaturedCard key={ev.id} event={ev} index={i} width={cardW} scrollX={scrollX} />
            ))}
          </Animated.ScrollView>
          <View className="mt-3 flex-row justify-center gap-1.5">
            {FEATURED.map((ev, i) => (
              <Dot key={ev.id} index={i} width={cardW} scrollX={scrollX} />
            ))}
          </View>

          <Text className="mt-7 px-6 text-lg font-extrabold text-slate-900">Segera hadir</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
            className="mt-3">
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                icon={CATEGORY_ICON[c]}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <View className="mt-4 gap-3 px-6">
          {upcoming.map((ev, i) => (
            <EventRow key={ev.id} event={ev} index={i} />
          ))}
        </View>

        <View className="mt-6 items-center">
          <PressableScale
            onPress={() => router.push('/')}
            accessibilityRole="link"
            className="flex-row items-center gap-1.5 rounded-full bg-white px-4 py-2.5">
            <Icon name="logout" size={16} color={T.muted} />
            <Text className="text-[13px] font-semibold text-slate-500">Halaman masuk / daftar</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}
