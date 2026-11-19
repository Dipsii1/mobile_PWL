import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';

import { T } from '@/constants/tixo';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <View className="absolute w-full flex-row justify-center p-4">
          <View className="max-w-[800px] flex-1 flex-row items-center gap-2 rounded-full bg-white px-6 py-2">
            <Text className="mr-auto text-base font-extrabold text-slate-900">Tixo</Text>
            <TabTrigger name="home" href="/home" asChild>
              <TabButton>Beranda</TabButton>
            </TabTrigger>
            <TabTrigger name="explore" href="/explore" asChild>
              <TabButton>Jelajah</TabButton>
            </TabTrigger>
          </View>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    // Cast tipe: ref slot expo-router/ui belum cocok dengan tipe ref Pressable (react-native-web).
    <Pressable
      {...(props as unknown as ComponentProps<typeof Pressable>)}
      style={{ backgroundColor: isFocused ? T.accentSoft : 'transparent' }}
      className="rounded-full px-4 py-1.5 active:opacity-70">
      <Text
        style={{ color: isFocused ? T.accent : T.muted }}
        className="text-sm font-semibold">
        {children}
      </Text>
    </Pressable>
  );
}
