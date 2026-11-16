import { View } from 'react-native';

import { T } from '@/constants/tixo';

export function TicketMark({ size = 1, cutout = T.bg }: { size?: number; cutout?: string }) {
  const w = 64 * size;
  const h = 42 * size;
  const notch = 14 * size;
  const dot = 8 * size;

  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: 14 * size,
        backgroundColor: T.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          position: 'absolute',
          left: -notch / 2,
          width: notch,
          height: notch,
          borderRadius: notch,
          backgroundColor: cutout,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: -notch / 2,
          width: notch,
          height: notch,
          borderRadius: notch,
          backgroundColor: cutout,
        }}
      />
      <View
        style={{
          height: h * 0.55,
          borderLeftWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: 'rgba(255,255,255,0.45)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: dot,
          right: 12 * size,
          width: dot,
          height: dot,
          borderRadius: dot,
          backgroundColor: T.lime,
        }}
      />
    </View>
  );
}
