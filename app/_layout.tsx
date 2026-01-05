// Polyfill for crypto.getRandomValues() required by uuid
import 'react-native-get-random-values';

import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { initializeDatabase, seedDefaultCategories } from '@/db';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategoryStore } from '@/stores/category-store';
import { getEffectiveColorScheme, useSettingsStore } from '@/stores/settings-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useWalletStore } from '@/stores/wallet-store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const effectiveColorScheme = getEffectiveColorScheme(themeMode, systemColorScheme);
  const [isDbReady, setIsDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function initDb() {
      try {
        await initializeDatabase();
        await seedDefaultCategories();

        await Promise.all([
          useWalletStore.getState().loadWallets(),
          useCategoryStore.getState().loadCategories(),
          useTransactionStore.getState().loadTransactions(),
        ]);

        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }

    initDb();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isDbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isDbReady]);

  if (!fontsLoaded || !isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <GluestackUIProvider config={config} colorMode={effectiveColorScheme}>
        <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="subscription/create" options={{ title: 'Add Subscription' }} />
            <Stack.Screen name="wallet/create" options={{ title: 'Add Wallet' }} />
            <Stack.Screen name="wallet/[id]" options={{ title: 'Wallet Details' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </GluestackUIProvider>
    </>
  );
}
