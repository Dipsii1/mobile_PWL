import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SPRING } from '@/constants/tixo';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: ComponentProps<typeof AnimatedPressable>['style'];
  scaleTo?: number;
};

export function PressableScale({ scaleTo = 0.96, style, onPressIn, onPressOut, ...props }: Props) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.get() ? scaleTo : 1, SPRING) }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        pressed.set(1);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(0);
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    />
  );
}
