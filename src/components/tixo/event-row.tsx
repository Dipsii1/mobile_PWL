import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { EASE_OUT, stagger, T } from '@/constants/tixo';
import type { TixoEvent } from '@/data/events';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';

export const EventRow = memo(function EventRow({ event, index }: { event: TixoEvent; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(stagger(index)).duration(320).easing(EASE_OUT)}
      exiting={FadeOut.duration(120)}
      layout={LinearTransition.duration(220)}>
      <PressableScale
        scaleTo={0.97}
        accessibilityRole="button"
        accessibilityLabel={`${event.title}, ${event.date}`}
        className="flex-row items-center gap-4 rounded-3xl bg-white p-3 pr-4">
        <View
          style={{ backgroundColor: event.tintSoft }}
          className="h-16 w-16 items-center justify-center rounded-2xl">
          <Text style={{ color: event.tint }} className="text-xl font-extrabold leading-6">
            {event.day}
          </Text>
          <Text style={{ color: event.tint }} className="text-[10px] font-bold tracking-widest">
            {event.month}
          </Text>
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[15px] font-bold text-slate-900">
            {event.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Icon name="location_on" size={14} color={T.muted} />
            <Text numberOfLines={1} className="flex-1 text-xs text-slate-500">
              {event.place}
            </Text>
          </View>
          <Text className="mt-1.5 text-xs font-bold" style={{ color: event.tint }}>
            {event.price}
          </Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
          <Icon name="arrow_forward" size={18} color={T.ink} />
        </View>
      </PressableScale>
    </Animated.View>
  );
});
