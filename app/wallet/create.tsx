import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWalletStore } from '@/stores/wallet-store';

export default function CreateWalletScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const addWallet = useWalletStore((state) => state.addWallet);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});

  const formatBalance = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');

    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to 2
    if (parts[1]?.length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }

    return cleaned;
  };

  const handleBalanceChange = (value: string) => {
    const formatted = formatBalance(value);
    setBalance(formatted);
    if (errors.balance) {
      setErrors((prev) => ({ ...prev, balance: undefined }));
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; balance?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Wallet name is required';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Wallet name must be 50 characters or less';
    }

    const numBalance = parseFloat(balance || '0');
    if (isNaN(numBalance) || numBalance < 0) {
      newErrors.balance = 'Please enter a valid balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const numBalance = parseFloat(balance || '0');
      await addWallet(name.trim(), numBalance);
      router.back();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].tint} />
            </Pressable>
            <ThemedText type="subtitle">Create Wallet</ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <ThemedView style={styles.form}>
            {/* Wallet Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Wallet Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    color: Colors[colorScheme].text,
                    borderColor: errors.name ? '#ef4444' : 'transparent',
                    borderWidth: errors.name ? 1 : 0,
                  },
                ]}
                placeholder="e.g., Main Account, Cash, Savings"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={name}
                onChangeText={handleNameChange}
                maxLength={50}
                autoFocus
              />
              {errors.name && (
                <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
              )}
            </View>

            {/* Initial Balance */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Initial Balance</ThemedText>
              <View style={styles.balanceInputContainer}>
                <ThemedText style={styles.currencySymbol}>$</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.balanceInput,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      color: Colors[colorScheme].text,
                      borderColor: errors.balance ? '#ef4444' : 'transparent',
                      borderWidth: errors.balance ? 1 : 0,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                  value={balance}
                  onChangeText={handleBalanceChange}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.balance && (
                <ThemedText style={styles.errorText}>{errors.balance}</ThemedText>
              )}
            </View>
          </ThemedView>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              {
                backgroundColor: Colors[colorScheme].tint,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Wallet'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  placeholder: {
    width: 40,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  balanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  balanceInput: {
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  submitButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
