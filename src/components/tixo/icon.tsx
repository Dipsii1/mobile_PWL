import { Text } from 'react-native';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
};

// Font Material Symbols dimuat sekali di src/app/_layout.tsx.
export function Icon({ name, size = 22, color = '#0E1525', filled = false }: IconProps) {
  return (
    <Text
      accessible={false}
      style={{
        fontFamily: filled ? 'MaterialSymbolsFilled' : 'MaterialSymbols',
        fontSize: size,
        lineHeight: size,
        width: size,
        height: size,
        textAlign: 'center',
        color,
      }}>
      {name}
    </Text>
  );
}
