import { useColorScheme as useRNColorScheme } from 'react-native';
import { getEffectiveColorScheme, useSettingsStore } from '@/stores/settings-store';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  return getEffectiveColorScheme(themeMode, systemColorScheme);
}
