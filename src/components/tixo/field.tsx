import { useEffect, useState, type ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_OUT, T } from '@/constants/tixo';

import { Icon } from './icon';

type FieldProps = TextInputProps & {
  label: string;
  icon: string;
  error?: string;
  right?: ReactNode;
};

const ERROR = '#EF4444';
const timing = { duration: 240, easing: EASE_OUT };

export function Field({ label, icon, error, right, onFocus, onBlur, ...input }: FieldProps) {
  const [focused, setFocused] = useState(false);
  // 0 = diam, 1 = fokus; error ditangani terpisah agar warnanya bisa bercampur halus.
  const focus = useSharedValue(0);
  const invalid = useSharedValue(0);

  useEffect(() => {
    focus.set(withTiming(focused ? 1 : 0, timing));
  }, [focused, focus]);

  useEffect(() => {
    invalid.set(withTiming(error ? 1 : 0, timing));
  }, [error, invalid]);

  const boxStyle = useAnimatedStyle(() => {
    const base = interpolateColor(focus.get(), [0, 1], [T.line, T.accent]);
    return { borderColor: interpolateColor(invalid.get(), [0, 1], [base, ERROR]) };
  });

  // Cincin lembut di luar kotak saat fokus.
  const ringStyle = useAnimatedStyle(() => ({
    opacity: focus.get(),
    borderColor: interpolateColor(invalid.get(), [0, 1], [T.accentSoft, '#FEE2E2']),
    transform: [{ scale: 0.98 + focus.get() * 0.02 }],
  }));

  return (
    <View>
      <Text className="mb-2 text-[13px] font-semibold text-slate-600">{label}</Text>
      <View>
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: -4, right: -4, bottom: -4, left: -4, borderWidth: 4, borderRadius: 20 }, ringStyle]}
        />
        <Animated.View
          style={[{ borderWidth: 1.5, backgroundColor: T.card }, boxStyle]}
          className="h-14 flex-row items-center rounded-2xl pl-4 pr-1">
          <Icon name={icon} size={20} color={error ? ERROR : focused ? T.accent : '#9CA3AF'} />
          <TextInput
            {...input}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            placeholderTextColor="#A0A6B4"
            className="h-full flex-1 px-3 text-[15px] font-medium text-slate-900"
          />
          {right}
        </Animated.View>
      </View>
      {error ? (
        <Animated.Text
          key={error}
          entering={FadeInDown.duration(260).easing(EASE_OUT)}
          exiting={FadeOut.duration(160)}
          className="ml-1 mt-1.5 text-xs font-medium text-red-500">
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}
