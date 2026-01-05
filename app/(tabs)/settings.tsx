import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable,
} from '@gluestack-ui/themed';

import { useSettingsStore, getEffectiveColorScheme } from '@/stores/settings-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
    <Box flex={1} bg="$backgroundLight0">
      <SafeAreaView style={styles.container} edges={['top']}>
        <Box p="$4" flex={1}>
          <Heading size="xl">Settings</Heading>

          <VStack mt="$6" space="lg">
            <Box>
              <Heading size="sm" mb="$3">
                Appearance
              </Heading>
              <HStack
                bg="$white"
                rounded="$lg"
                overflow="hidden"
              >
                {themeModes.map((mode) => (
                  <Pressable
                    key={mode.value}
                    flex={1}
                    py="$3"
                    alignItems="center"
                    bg={themeMode === mode.value ? '$primary500' : '$backgroundLight100'}
                    onPress={() => setThemeMode(mode.value)}
                  >
                    <Text
                      fontWeight={themeMode === mode.value ? '$semibold' : '$medium'}
                      color={themeMode === mode.value ? '$white' : '$textLight700'}
                    >
                      {mode.label}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </Box>

            <Box>
              <Heading size="sm" mb="$3">
                About
              </Heading>
              <Box bg="$white" rounded="$lg" overflow="hidden">
                <HStack
                  p="$4"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottomWidth={StyleSheet.hairlineWidth}
                  borderBottomColor="$borderLight200"
                >
                  <Text color="$textLight500">Version</Text>
                  <Text fontWeight="$medium" color="$textLight900">{appVersion}</Text>
                </HStack>
                <HStack
                  p="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text color="$textLight500">App Name</Text>
                  <Text fontWeight="$medium" color="$textLight900">Expense Lovers</Text>
                </HStack>
              </Box>
            </Box>
          </VStack>
        </Box>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
