import { Text } from 'react-native';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
};

// Font Material Symbols dimuat sekali di src/app/_layout.tsx.
export function Icon({ name, size = 22, color = '#FFFFFF', filled = false }: IconProps) {
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
        textAlignVertical: 'center',
        // Android menambah padding font di atas/bawah glyph — bikin ikon tidak center.
        includeFontPadding: false,
        color,
      }}>
      {name}
    </Text>
  );
}
