import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Layout, Text, Card, Input, Button, Icon, TopNavigation, TopNavigationAction, Modal } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useWalletStore } from '@/stores/wallet-store';

const BackIcon = (props: any) => (
  <Ionicons name="arrow-back" size={24} color={props.style?.tintColor || '#000'} />
);

const EditIcon = (props: any) => (
  <Ionicons name="create-outline" size={24} color={props.style?.tintColor || '#000'} />
);

const TrashIcon = (props: any) => (
  <Icon {...props} name="trash-2-outline" />
);

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopNavigation
          title="Wallet Not Found"
          accessoryLeft={() => (
            <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
          )}
        />
        <Layout style={styles.empty}>
          <Text appearance="hint">This wallet doesn&apos;t exist.</Text>
        </Layout>
      </SafeAreaView>
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

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  const EditAction = () => (
    <TopNavigationAction icon={EditIcon} onPress={() => setIsEditing(true)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title="Wallet Details"
        alignment="center"
        accessoryLeft={BackAction}
        accessoryRight={EditAction}
      />

      <Layout style={styles.content}>
        <Card style={styles.balanceCard}>
          <Text appearance="hint" category="s1">{wallet.name}</Text>
          <Text category="h1" style={styles.balance}>{formatCurrency(wallet.balance)}</Text>
        </Card>

        <Button
          style={styles.deleteButton}
          status="danger"
          appearance="outline"
          accessoryLeft={TrashIcon}
          onPress={handleDelete}
        >
          Delete Wallet
        </Button>
      </Layout>

      <Modal
        visible={isEditing}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setIsEditing(false)}
      >
        <Card disabled style={styles.modal}>
          <Text category="h6" style={styles.modalTitle}>Edit Wallet</Text>
          <Input
            label="Wallet Name"
            value={editName}
            onChangeText={setEditName}
            autoFocus
          />
          <Layout style={styles.modalButtons}>
            <Button
              appearance="ghost"
              onPress={() => {
                setEditName(wallet.name);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onPress={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Layout>
        </Card>
      </Modal>
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
  balanceCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balance: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 'auto',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    minWidth: 300,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
});
