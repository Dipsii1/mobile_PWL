import { useState, type ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { T } from '@/constants/tixo';

import { Icon } from './icon';

type FieldProps = TextInputProps & {
  label: string;
  icon: string;
  error?: string;
  right?: ReactNode;
};

export function Field({ label, icon, error, right, onFocus, onBlur, ...input }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#EF4444' : focused ? T.accent : T.line;

  return (
    <View>
      <Text className="mb-2 text-[13px] font-semibold text-slate-600">{label}</Text>
      <View
        style={{ borderColor, borderWidth: 1.5, backgroundColor: T.card }}
        className="h-14 flex-row items-center rounded-2xl pl-4 pr-1">
        <Icon name={icon} size={20} color={focused ? T.accent : '#9CA3AF'} />
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
      </View>
      {error ? (
        <Animated.Text
          entering={FadeIn.duration(160)}
          className="ml-1 mt-1.5 text-xs font-medium text-red-500">
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}
