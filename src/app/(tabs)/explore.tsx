import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventRow } from '@/components/tixo/event-row';
import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { EASE_OUT, T, TAB_INSET } from '@/constants/tixo';
import { CATEGORIES, CATEGORY_ICON, EVENTS, type Category } from '@/data/events';

type TileCategory = Exclude<Category, 'Semua'>;

const TILE_COLOR: Record<TileCategory, { tint: string; soft: string }> = {
  Musik: { tint: '#5B4BFF', soft: '#ECEAFF' },
  Olahraga: { tint: '#0EA472', soft: '#DDF6EC' },
  Seminar: { tint: '#F08A24', soft: '#FFEEDC' },
  Festival: { tint: '#E5487A', soft: '#FDE3EC' },
};

const TILES = CATEGORIES.filter((c): c is TileCategory => c !== 'Semua').map((c) => ({
  name: c,
  count: EVENTS.filter((e) => e.category === c).length,
  ...TILE_COLOR[c],
}));

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('Semua');

  const q = query.trim().toLowerCase();
  const results = EVENTS.filter(
    (e) =>
      (category === 'Semua' || e.category === category) &&
      (q === '' || e.title.toLowerCase().includes(q) || e.place.toLowerCase().includes(q)),
  );

  return (
    <View className="flex-1" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + TAB_INSET + 24,
        }}
        contentContainerClassName="px-6">
        <Animated.View entering={FadeInDown.duration(360).easing(EASE_OUT)}>
          <Text className="text-[28px] font-extrabold tracking-tight text-slate-900">Jelajah</Text>
          <Text className="mt-1 text-[14px] text-slate-500">Temukan acara seru di sekitarmu.</Text>

          <View className="mt-5 h-14 flex-row items-center gap-3 rounded-2xl bg-white px-4">
            <Icon name="search" size={22} color={T.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari acara atau lokasi"
              placeholderTextColor="#A0A6B4"
              returnKeyType="search"
              accessibilityLabel="Cari acara"
              className="h-full flex-1 text-[15px] font-medium text-slate-900"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                accessibilityLabel="Hapus pencarian"
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <Icon name="close" size={16} color={T.muted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(380).easing(EASE_OUT)}
          className="mt-6 flex-row flex-wrap justify-between gap-y-3">
          {TILES.map((tile) => {
            const active = category === tile.name;
            return (
              <PressableScale
                key={tile.name}
                onPress={() => setCategory(active ? 'Semua' : tile.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{ backgroundColor: active ? tile.tint : T.card }}
                className="h-[104px] w-[48.5%] justify-between rounded-3xl p-4">
                <View
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.22)' : tile.soft }}
                  className="h-10 w-10 items-center justify-center rounded-2xl">
                  <Icon name={CATEGORY_ICON[tile.name]} size={22} color={active ? '#fff' : tile.tint} />
                </View>
                <View className="flex-row items-end justify-between">
                  <Text className={`text-[15px] font-bold ${active ? 'text-white' : 'text-slate-900'}`}>
                    {tile.name}
                  </Text>
                  <Text className={`text-xs font-semibold ${active ? 'text-white/80' : 'text-slate-400'}`}>
                    {tile.count} acara
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </Animated.View>

        <Animated.View
          layout={LinearTransition.duration(220)}
          className="mt-7 flex-row items-center justify-between">
          <Text className="text-lg font-extrabold text-slate-900">
            {category === 'Semua' ? 'Semua acara' : category}
          </Text>
          <Text className="text-[13px] font-semibold text-slate-500">{results.length} hasil</Text>
        </Animated.View>

        <View className="mt-3 gap-3">
          {results.map((ev, i) => (
            <EventRow key={ev.id} event={ev} index={i} />
          ))}
          {results.length === 0 && (
            <Animated.View entering={FadeIn.duration(240)} className="items-center py-12">
              <View
                style={{ backgroundColor: T.accentSoft }}
                className="h-16 w-16 items-center justify-center rounded-3xl">
                <Icon name="search_off" size={30} color={T.accent} />
              </View>
              <Text className="mt-4 text-base font-bold text-slate-900">Belum ada yang cocok</Text>
              <Text className="mt-1 text-[13px] text-slate-500">Coba kata kunci atau kategori lain.</Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
