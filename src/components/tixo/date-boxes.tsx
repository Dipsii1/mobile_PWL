import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { EASE_OUT, T } from '@/constants/tixo';
import { maskDate } from '@/lib/profile';

type DateBoxesProps = {
  label: string;
  /** "DD/MM/YYYY" */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
};

const ERROR = '#EF4444';
const GROUPS = [
  { caption: 'Tanggal', start: 0, length: 2 },
  { caption: 'Bulan', start: 2, length: 2 },
  { caption: 'Tahun', start: 4, length: 4 },
] as const;

// Satu TextInput tersembunyi, kotak hanya menampilkan digit (seperti input OTP).
export function DateBoxes({ label, value, onChange, error, autoFocus, onFocus }: DateBoxesProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const active = Math.min(digits.length, 7);

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
        {digits.length > 0 ? (
          <Text
            onPress={() => {
              onChange('');
              input.current?.focus();
            }}
            accessibilityRole="button"
            className="text-[12px] font-bold text-accent">
            Hapus
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => input.current?.focus()}
        accessibilityLabel={`${label}, format hari bulan tahun`}
        className="flex-row items-start">
        {GROUPS.map((group, groupIndex) => (
          <View key={group.caption} className="flex-row items-start" style={{ flex: group.length }}>
            {groupIndex > 0 ? (
              <Text className="mx-1 h-11 text-center text-[17px] font-bold leading-[44px] text-muted/50">/</Text>
            ) : null}
            <View className="flex-1">
              <View className="flex-row gap-1">
                {Array.from({ length: group.length }, (_, i) => {
                  const index = group.start + i;
                  const char = digits[index];
                  const current = focused && index === active;
                  const borderColor = error ? ERROR : current ? T.accent : char ? '#3F3F46' : T.line;
                  return (
                    <View
                      key={index}
                      style={{ borderColor }}
                      className={`h-11 flex-1 items-center justify-center rounded-lg border-[1.5px] ${current ? 'bg-accent-soft' : 'bg-card'}`}>
                      <Text className="text-[16px] font-extrabold text-fg">{char ?? ''}</Text>
                      {current && !char ? (
                        <View className="absolute h-5 w-0.5 rounded-full bg-accent" />
                      ) : null}
                    </View>
                  );
                })}
              </View>
              <Text className="mt-1 text-center text-[10px] font-medium text-muted">{group.caption}</Text>
            </View>
          </View>
        ))}

        <TextInput
          ref={input}
          value={digits}
          onChangeText={(text) => onChange(maskDate(text))}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={8}
          autoFocus={autoFocus}
          caretHidden
          contextMenuHidden
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        />
      </Pressable>

      {error ? (
        <Animated.Text
          key={error}
          entering={FadeInDown.duration(260).easing(EASE_OUT)}
          exiting={FadeOut.duration(160)}
          className="ml-1 mt-1.5 text-xs font-medium text-red-400">
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}
