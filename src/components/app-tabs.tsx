import { usePathname } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { memo, useEffect, type ComponentProps, type ReactNode } from 'react';
import { Pressable, useWindowDimensions, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/tixo/icon';
import { EASE_OUT, SPRING, SPRING_SOFT, T } from '@/constants/tixo';

const TABS = [
  { name: 'home', href: '/home', label: 'Beranda', icon: 'home' },
  { name: 'explore', href: '/explore', label: 'Jelajah', icon: 'explore' },
  { name: 'tickets', href: '/tickets', label: 'Tiketku', icon: 'qr_code_2' },
  { name: 'profile', href: '/profile', label: 'Profil', icon: 'person' },
] as const;

export const BAR_HEIGHT = 64;
const BUBBLE = 54;
const NOTCH_DEPTH = 36;
const NOTCH_HALF = 58;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CurvedBar>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={tab.label} />
            </TabTrigger>
          ))}
        </CurvedBar>
      </TabList>
    </Tabs>
  );
}

// Bentuk bar dengan lekukan di tengah. Digambar 3x lebar layar lalu digeser,
// sehingga lekukan bisa berpindah tanpa menganimasikan path SVG.
// Di-memo: SVG hanya digambar ulang kalau ukuran layar berubah, bukan tiap pindah tab.
const NotchShape = memo(function NotchShape({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width * 3} height={height}>
      <Path d={notchPath(width, height)} fill={T.card} stroke={T.line} strokeWidth={1} />
    </Svg>
  );
});

function notchPath(width: number, height: number) {
  const c = width * 1.5;
  return [
    'M0 0',
    `L${c - NOTCH_HALF} 0`,
    `C${c - 36} 0 ${c - 38} ${NOTCH_DEPTH} ${c} ${NOTCH_DEPTH}`,
    `C${c + 38} ${NOTCH_DEPTH} ${c + 36} 0 ${c + NOTCH_HALF} 0`,
    `L${width * 3} 0`,
    `L${width * 3} ${height}`,
    `L0 ${height}`,
    'Z',
  ].join(' ');
}

// `style` dari TabList (flexDirection: row) dibuang — membuat baris tombol menyusut jadi lebar 0.
function CurvedBar({ children, style: _ignored, ...props }: ViewProps & { children?: ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const height = BAR_HEIGHT + insets.bottom;
  const slot = width / TABS.length;

  const found = TABS.findIndex((t) => pathname.startsWith(t.href));
  const index = found === -1 ? 0 : found;
  const centerOf = (i: number) => slot * (i + 0.5);

  const x = useSharedValue(centerOf(index));
  const pop = useSharedValue(1);

  useEffect(() => {
    x.set(withSpring(centerOf(index), SPRING_SOFT));
    pop.set(withSequence(withTiming(0.82, { duration: 110 }), withSpring(1, SPRING)));
    // centerOf berubah hanya jika lebar layar berubah — ikut di-trigger lewat `slot`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slot]);

  const notchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() - width * 1.5 }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() - BUBBLE / 2 }, { scale: pop.get() }],
  }));

  const active = TABS[index];

  return (
    <View
      {...props}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height }}>
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={[{ position: 'absolute', top: 0, left: 0, width: width * 3, height }, notchStyle]}>
        <NotchShape width={width} height={height} />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 2 - BUBBLE / 2,
            left: 0,
            width: BUBBLE,
            height: BUBBLE,
            borderRadius: BUBBLE / 2,
            backgroundColor: T.accent,
            shadowColor: T.accent,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          },
          bubbleStyle,
        ]}>
        <Animated.View
          key={active.name}
          entering={ZoomIn.duration(300).easing(EASE_OUT)}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          className="items-center justify-center">
          <Icon name={active.icon} size={26} color="#fff" filled />
        </Animated.View>
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height: BAR_HEIGHT,
          flexDirection: 'row',
        }}>
        {children}
      </View>
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: string; label: string };

// `style` dari TabTrigger (flexDirection: row, space-between) sengaja dibuang
// karena menggeser ikon dari tengah slot.
function TabButton({ icon, label, isFocused, style: _ignored, ...props }: TabButtonProps) {
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.set(withTiming(isFocused ? 1 : 0, { duration: 320, easing: EASE_OUT }));
  }, [isFocused, focus]);

  // Ikon tenggelam & memudar saat aktif (ikonnya pindah ke gelembung), label muncul.
  const iconStyle = useAnimatedStyle(() => ({
    opacity: 1 - focus.get(),
    transform: [{ translateY: focus.get() * 14 }, { scale: 1 - focus.get() * 0.3 }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: focus.get(),
    transform: [{ translateY: (1 - focus.get()) * 6 }],
  }));

  return (
    // Cast tipe: ref slot expo-router/ui belum cocok dengan tipe ref Pressable.
    <Pressable
      {...(props as unknown as ComponentProps<typeof Pressable>)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={{ flex: 1, height: BAR_HEIGHT, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <Animated.View
        style={[{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }, iconStyle]}>
        <Icon name={icon} size={24} color={T.muted} />
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 8, textAlign: 'center', color: T.accent },
          labelStyle,
        ]}
        className="text-[11px] font-bold">
        {label}
      </Animated.Text>
    </Pressable>
  );
}
