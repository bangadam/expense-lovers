import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWalletStore } from '@/stores/wallet-store';

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  
  const wallet = useWalletStore((state) => state.wallets.find((w) => w.id === id));
  const updateWallet = useWalletStore((state) => state.updateWallet);
  const deleteWallet = useWalletStore((state) => state.deleteWallet);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(wallet?.name ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!wallet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].tint} />
          </Pressable>
          <ThemedText type="subtitle">Wallet Not Found</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <ThemedView style={styles.notFound}>
          <ThemedText>This wallet does not exist or has been deleted.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!editName.trim()) {
      setError('Wallet name is required');
      return;
    }

    if (editName.trim().length > 50) {
      setError('Wallet name must be 50 characters or less');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateWallet(wallet.id, { name: editName.trim() });
      setIsEditing(false);
      setError(null);
    } catch (e) {
      console.error('Failed to update wallet:', e);
      setError('Failed to update wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${wallet.name}"? This action cannot be undone.`,
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
              Alert.alert('Error', 'Failed to delete wallet');
            }
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditName(wallet.name);
    setIsEditing(false);
    setError(null);
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
            <ThemedText type="subtitle">Wallet Details</ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* Wallet Card */}
          <ThemedView style={[styles.card, styles.walletCard]}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      color: Colors[colorScheme].text,
                      borderColor: error ? '#ef4444' : 'transparent',
                      borderWidth: error ? 1 : 0,
                    },
                  ]}
                  value={editName}
                  onChangeText={(text) => {
                    setEditName(text);
                    if (error) setError(null);
                  }}
                  maxLength={50}
                  autoFocus
                />
                {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                  >
                    <ThemedText>Cancel</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.editButton,
                      { backgroundColor: Colors[colorScheme].tint, opacity: isSubmitting ? 0.6 : 1 },
                    ]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                  >
                    <ThemedText style={styles.saveButtonText}>
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.walletInfo}>
                  <ThemedText type="subtitle">{wallet.name}</ThemedText>
                  <ThemedText type="title" style={styles.balanceText}>
                    {formatCurrency(wallet.balance)}
                  </ThemedText>
                </View>
                <Pressable onPress={() => setIsEditing(true)} style={styles.editIcon}>
                  <IconSymbol name="pencil" size={20} color={Colors[colorScheme].tint} />
                </Pressable>
              </>
            )}
          </ThemedView>

          {/* Delete Button */}
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash" size={20} color="#ef4444" />
            <ThemedText style={styles.deleteButtonText}>Delete Wallet</ThemedText>
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
  notFound: {
    padding: 24,
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletInfo: {
    flex: 1,
  },
  balanceText: {
    marginTop: 8,
  },
  editIcon: {
    padding: 8,
  },
  editContainer: {
    flex: 1,
    gap: 12,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
