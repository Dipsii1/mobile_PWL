import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { EASE_OUT } from '@/constants/tixo';

// Getaran horizontal yang meredam pelan — dipakai saat validasi form gagal.
export function useShake() {
  const offset = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  function shake() {
    offset.set(
      withSequence(
        withTiming(-10, { duration: 60, easing: EASE_OUT }),
        withTiming(9, { duration: 70, easing: EASE_OUT }),
        withTiming(-5, { duration: 70, easing: EASE_OUT }),
        withTiming(3, { duration: 70, easing: EASE_OUT }),
        withTiming(0, { duration: 80, easing: EASE_OUT }),
      ),
    );
  }

  return { style, shake };
}
