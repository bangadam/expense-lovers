import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function getEffectiveColorScheme(
  themeMode: ThemeMode,
  systemColorScheme: ColorSchemeName
): 'light' | 'dark' {
  if (themeMode === 'system') {
    return systemColorScheme ?? 'light';
  }
  return themeMode;
}
