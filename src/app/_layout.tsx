import '@/global.css';

import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';
import { MaterialSymbols_400Regular_Filled } from '@expo-google-fonts/material-symbols/400Regular_Filled';
import { useFonts } from '@expo-google-fonts/material-symbols/useFonts';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { T } from '@/constants/tixo';

SplashScreen.preventAutoHideAsync();

const TixoTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: T.bg, card: T.card, primary: T.accent },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    MaterialSymbols: MaterialSymbols_400Regular,
    MaterialSymbolsFilled: MaterialSymbols_400Regular_Filled,
  });
  const ready = fontsLoaded || fontError != null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={TixoTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
