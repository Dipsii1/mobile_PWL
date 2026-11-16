import { NativeTabs } from 'expo-router/native-tabs';

import { T } from '@/constants/tixo';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={T.card}
      indicatorColor={T.accentSoft}
      iconColor={{ default: T.muted, selected: T.accent }}
      labelStyle={{ default: { color: T.muted }, selected: { color: T.accent } }}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Beranda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Jelajah</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
