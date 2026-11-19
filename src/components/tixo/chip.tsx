import { Text } from 'react-native';

import { T } from '@/constants/tixo';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';

type ChipProps = {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, icon, selected, onPress }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`h-10 flex-row items-center gap-1.5 rounded-full px-4 ${selected ? 'bg-accent' : 'bg-card'}`}>
      {icon ? <Icon name={icon} size={18} color={selected ? T.onAccent : T.muted} /> : null}
      <Text className={`text-[13px] font-semibold ${selected ? 'text-on-accent' : 'text-muted'}`}>
        {label}
      </Text>
    </PressableScale>
  );
}
