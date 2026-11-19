import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, type ImageSourcePropType, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Keyframe,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/tixo/icon';
import { PressableScale } from '@/components/tixo/pressable-scale';
import { EASE_OUT, rise, T } from '@/constants/tixo';

// Foto dari Wikimedia Commons (lisensi CC) — atribusi di assets/images/bands/CREDITS.md.
type Photo = { name: string; source: ImageSourcePropType; ratio: number };

const COLUMNS: Photo[][] = [
  [
    { name: 'Slank', source: require('@/assets/images/bands/slank.jpg'), ratio: 1.35 },
    { name: 'NOAH', source: require('@/assets/images/bands/noah.jpg'), ratio: 1.1 },
  ],
  [
    { name: 'Sheila on 7', source: require('@/assets/images/bands/sheila-on-7.jpg'), ratio: 0.95 },
    { name: 'Dewa 19', source: require('@/assets/images/bands/dewa19.jpg'), ratio: 1.4 },
  ],
];

const GAP = 10;
const SPEED = 22; // px per detik — pelan agar terasa tenang, bukan sibuk.

// Kolase masuk dengan zoom-out halus.
const collageEnter = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 1.12 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: EASE_OUT },
}).duration(1400);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const colWidth = (width - GAP * 3) / 2;

  return (
    <View className="flex-1 overflow-hidden" style={{ backgroundColor: T.bg }}>
      <StatusBar style="dark" />

      {/* Kolase foto band yang bergerak sebagai latar */}
      <Animated.View
        entering={reduceMotion ? undefined : collageEnter}
        pointerEvents="none"
        className="absolute inset-0 flex-row"
        style={{ gap: GAP, paddingHorizontal: GAP }}>
        {COLUMNS.map((photos, c) => (
          <MarqueeColumn
            key={c}
            photos={photos}
            width={colWidth}
            viewport={height}
            direction={c === 0 ? 'up' : 'down'}
            paused={reduceMotion}
          />
        ))}
      </Animated.View>

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(245,246,250,0.6)', 'rgba(245,246,250,0)', 'rgba(245,246,250,0.9)', T.bg]}
        locations={[0, 0.14, 0.5, 0.66]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />

      <View className="flex-1 justify-end px-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Animated.Text
          entering={rise(500)}
          className="text-[32px] font-extrabold leading-[38px] tracking-tight text-slate-900">
          Konser impianmu,
        </Animated.Text>
        <Animated.Text
          entering={rise(600)}
          className="text-[32px] font-extrabold leading-[38px] tracking-tight text-slate-900">
          lebih dekat bersama Tixo.
        </Animated.Text>
        <Animated.Text entering={rise(720)} className="mt-3 text-[15px] leading-5 text-slate-500">
          Dari band legendaris hingga musisi favoritmu. Temukan konser, amankan tiket, dan nikmati
          setiap momennya bersama Tixo.
        </Animated.Text>

        <View className="mt-8 gap-3">
          <Animated.View entering={rise(860)}>
            <PressableScale
              onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })}
              accessibilityRole="button"
              style={{ backgroundColor: T.ink }}
              className="h-14 flex-row items-center justify-center gap-2 rounded-2xl">
              <Text className="text-base font-bold text-white">Daftar sekarang</Text>
              <Icon name="arrow_forward" size={20} color="#fff" />
            </PressableScale>
          </Animated.View>
          <Animated.View entering={rise(960)}>
            <PressableScale
              onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })}
              accessibilityRole="button"
              className="h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <Text className="text-base font-bold text-slate-900">Saya sudah punya akun</Text>
            </PressableScale>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

type MarqueeProps = {
  photos: Photo[];
  width: number;
  viewport: number;
  direction: 'up' | 'down';
  paused: boolean;
};

// Kolom yang bergulir terus-menerus. Isi diulang beberapa kali agar loop tidak terlihat sambungannya.
function MarqueeColumn({ photos, width, viewport, direction, paused }: MarqueeProps) {
  const cycle = photos.reduce((sum, p) => sum + width * p.ratio + GAP, 0);
  const copies = Math.ceil(viewport / cycle) + 1;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (paused) return;
    progress.set(0);
    progress.set(
      withRepeat(withTiming(1, { duration: (cycle / SPEED) * 1000, easing: Easing.linear }), -1),
    );
    return () => cancelAnimation(progress);
  }, [cycle, paused, progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.get();
    const y = direction === 'up' ? -p * cycle : (p - 1) * cycle;
    return { transform: [{ translateY: y }] };
  });

  return (
    <Animated.View renderToHardwareTextureAndroid style={[{ width, gap: GAP }, style]}>
      {Array.from({ length: copies }, (_, copy) =>
        photos.map((photo) => (
          <View
            key={`${copy}-${photo.name}`}
            className="overflow-hidden rounded-3xl bg-slate-200"
            style={{ height: width * photo.ratio }}>
            <Image
              source={photo.source}
              resizeMode="cover"
              // Android: decode seukuran tampilan & tanpa fade bawaan per salinan foto.
              resizeMethod="resize"
              fadeDuration={0}
              className="h-full w-full"
              accessibilityLabel={copy === 0 ? photo.name : undefined}
              accessibilityElementsHidden={copy > 0}
            />
            <View className="absolute bottom-2.5 left-2.5 rounded-full bg-black/45 px-2.5 py-1">
              <Text className="text-[11px] font-bold text-white">{photo.name}</Text>
            </View>
          </View>
        )),
      )}
    </Animated.View>
  );
}
