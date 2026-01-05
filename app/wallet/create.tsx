import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import {
  Box,
  VStack,
  Text,
  Heading,
  Input,
  InputField,
  InputSlot,
  Button,
  ButtonText,
  HStack,
  Pressable,
  Icon,
} from '@gluestack-ui/themed';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useWalletStore } from '@/stores/wallet-store';

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

  return (
    <Box flex={1} bg="$backgroundLight0">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <HStack
          p="$4"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderLight200"
        >
          <Pressable onPress={() => router.back()} p="$2" mr="$2">
            <Icon as={ArrowLeft} size="xl" color="$textLight900" />
          </Pressable>
          <Heading size="md">Create Wallet</Heading>
        </HStack>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <VStack flex={1} p="$4" space="md">
            <VStack space="xs">
              <Text size="sm" fontWeight="$medium" color="$textLight700">
                Wallet Name
              </Text>
              <Input
                size="lg"
                isInvalid={!!error}
                variant="outline"
              >
                <InputField
                  placeholder="e.g., Cash, Bank Account, Savings"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) setError(null);
                  }}
                  autoFocus
                />
              </Input>
              {error && (
                <Text size="xs" color="$error600">
                  {error}
                </Text>
              )}
            </VStack>

            <VStack space="xs">
              <Text size="sm" fontWeight="$medium" color="$textLight700">
                Initial Balance
              </Text>
              <Input size="lg" variant="outline">
                <InputSlot pl="$3">
                  <Text color="$textLight500">$</Text>
                </InputSlot>
                <InputField
                  placeholder="0.00"
                  value={balance}
                  onChangeText={(text) => setBalance(formatBalance(text))}
                  keyboardType="decimal-pad"
                />
              </Input>
            </VStack>

            <Box mt="$4">
              <Button
                size="lg"
                onPress={handleSubmit}
                isDisabled={isSubmitting}
              >
                <ButtonText>
                  {isSubmitting ? 'Creating...' : 'Create Wallet'}
                </ButtonText>
              </Button>
            </Box>
          </VStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
});
