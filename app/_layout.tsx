// Polyfill for crypto.getRandomValues() required by uuid
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { initializeDatabase, seedDefaultCategories } from '@/db';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWalletStore } from '@/stores/wallet-store';
import { useCategoryStore } from '@/stores/category-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useSettingsStore, getEffectiveColorScheme } from '@/stores/settings-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const effectiveColorScheme = getEffectiveColorScheme(themeMode, systemColorScheme);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function initDb() {
      try {
        await initializeDatabase();
        await seedDefaultCategories();

        // Hydrate stores from database
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

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const evaTheme = effectiveColorScheme === 'dark' ? eva.dark : eva.light;

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={evaTheme}>
        <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </ApplicationProvider>
    </>
  );
}
