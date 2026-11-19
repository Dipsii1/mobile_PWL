import '@/global.css';

import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';
import { MaterialSymbols_400Regular_Filled } from '@expo-google-fonts/material-symbols/400Regular_Filled';
import { useFonts } from '@expo-google-fonts/material-symbols/useFonts';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { T } from '@/constants/tixo';
import { AuthProvider, useAuth } from '@/context/auth-context';

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

  if (!ready) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={TixoTheme}>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  // Splash tetap tampil selama sesi dipulihkan dari penyimpanan.
  if (isLoading) return null;

  const signedIn = token != null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
