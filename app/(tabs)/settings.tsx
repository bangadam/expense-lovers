import { StyleSheet, View, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsStore, getEffectiveColorScheme } from '@/stores/settings-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

const themeModes: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useSettingsStore();
  const effectiveScheme = getEffectiveColorScheme(themeMode, systemColorScheme);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Settings</ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <ThemedView style={styles.optionGroup}>
            {themeModes.map((mode) => (
              <Pressable
                key={mode.value}
                style={[
                  styles.optionButton,
                  themeMode === mode.value && {
                    backgroundColor: Colors[effectiveScheme].tint,
                  },
                ]}
                onPress={() => setThemeMode(mode.value)}>
                <ThemedText
                  style={[
                    styles.optionText,
                    themeMode === mode.value && styles.optionTextSelected,
                  ]}>
                  {mode.label}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Version</ThemedText>
            <ThemedText style={styles.infoValue}>{appVersion}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>App Name</ThemedText>
            <ThemedText style={styles.infoValue}>Expense Lovers</ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  optionText: {
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '500',
  },
});
