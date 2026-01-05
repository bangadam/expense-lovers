import React, { useState } from 'react';
import { StyleSheet, Alert, Modal as RNModal } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonIcon,
  Pressable,
  Icon,
} from '@gluestack-ui/themed';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useWalletStore } from '@/stores/wallet-store';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const wallet = useWalletStore((state) => state.wallets.find((w) => w.id === id));
  const updateWallet = useWalletStore((state) => state.updateWallet);
  const deleteWallet = useWalletStore((state) => state.deleteWallet);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(wallet?.name ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!wallet) {
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
            <Heading size="md">Wallet Not Found</Heading>
          </HStack>
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text color="$textLight500">This wallet doesn&apos;t exist.</Text>
          </Box>
        </SafeAreaView>
      </Box>
    );
  }

  const handleSave = async () => {
    if (!editName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateWallet(wallet.id, { name: editName.trim() });
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update wallet:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${wallet.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet(wallet.id);
              router.back();
            } catch (e) {
              console.error('Failed to delete wallet:', e);
            }
          },
        },
      ]
    );
  };

  return (
    <Box flex={1} bg="$backgroundLight0">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <HStack
          p="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderLight200"
        >
          <HStack alignItems="center">
            <Pressable onPress={() => router.back()} p="$2" mr="$2">
              <Icon as={ArrowLeft} size="xl" color="$textLight900" />
            </Pressable>
            <Heading size="md">Wallet Details</Heading>
          </HStack>
          <Pressable onPress={() => setIsEditing(true)} p="$2">
            <Icon as={Pencil} size="lg" color="$textLight900" />
          </Pressable>
        </HStack>

        <VStack flex={1} p="$4">
          <Box
            bg="$white"
            p="$6"
            rounded="$xl"
            alignItems="center"
            mb="$6"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={2}
          >
            <Text size="sm" color="$textLight500" mb="$2">
              {wallet.name}
            </Text>
            <Heading size="3xl">{formatCurrency(wallet.balance)}</Heading>
          </Box>

          <Box mt="auto">
            <Button
              size="lg"
              variant="outline"
              action="negative"
              onPress={handleDelete}
            >
              <ButtonIcon as={Trash2} mr="$2" />
              <ButtonText>Delete Wallet</ButtonText>
            </Button>
          </Box>
        </VStack>

        <RNModal
          visible={isEditing}
          transparent
          animationType="fade"
          onRequestClose={() => setIsEditing(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setIsEditing(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Box
                bg="$white"
                p="$6"
                rounded="$xl"
                minWidth={300}
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={16}
                elevation={4}
              >
                <Heading size="lg" mb="$4">
                  Edit Wallet
                </Heading>
                <VStack space="xs" mb="$4">
                  <Text size="sm" fontWeight="$medium" color="$textLight700">
                    Wallet Name
                  </Text>
                  <Input size="lg" variant="outline">
                    <InputField
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                    />
                  </Input>
                </VStack>
                <HStack justifyContent="flex-end" space="sm">
                  <Button
                    variant="outline"
                    action="secondary"
                    onPress={() => {
                      setEditName(wallet.name);
                      setIsEditing(false);
                    }}
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                  <Button onPress={handleSave} isDisabled={isSubmitting}>
                    <ButtonText>{isSubmitting ? 'Saving...' : 'Save'}</ButtonText>
                  </Button>
                </HStack>
              </Box>
            </Pressable>
          </Pressable>
        </RNModal>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
  },
});
