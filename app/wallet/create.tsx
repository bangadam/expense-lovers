import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Layout, Text, Input, Button, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useWalletStore } from '@/stores/wallet-store';

const BackIcon = (props: any) => (
  <Ionicons name="arrow-back" size={24} color={props.style?.tintColor || '#000'} />
);

export default function CreateWalletScreen() {
  const addWallet = useWalletStore((state) => state.addWallet);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatBalance = (value: string): string => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]?.length > 2) return parts[0] + '.' + parts[1].slice(0, 2);
    return cleaned;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Wallet name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const numBalance = parseFloat(balance || '0');
      const balanceInCents = Math.round(numBalance * 100);
      await addWallet(name.trim(), balanceInCents);
      router.back();
    } catch (e) {
      console.error('Failed to create wallet:', e);
      setError('Failed to create wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title="Create Wallet"
        alignment="center"
        accessoryLeft={BackAction}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Layout style={styles.content}>
          <Input
            style={styles.input}
            label="Wallet Name"
            placeholder="e.g., Cash, Bank Account, Savings"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            status={error ? 'danger' : 'basic'}
            caption={error || undefined}
            autoFocus
          />

          <Input
            style={styles.input}
            label="Initial Balance"
            placeholder="0.00"
            value={balance}
            onChangeText={(text) => setBalance(formatBalance(text))}
            keyboardType="decimal-pad"
            accessoryLeft={(props) => <Text {...props}>$</Text>}
          />

          <Button
            style={styles.button}
            size="large"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Wallet'}
          </Button>
        </Layout>
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
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
