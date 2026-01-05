import React, { useMemo, useRef, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { Layout, Text, Card, Button, List, ListItem, Divider } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useWalletStore } from '@/stores/wallet-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  const now = new Date();
  const transDate = new Date(date);

  if (transDate.toDateString() === now.toDateString()) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (transDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(transDate);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const PlusIcon = (props: any) => <Ionicons name="add-outline" size={props.style?.width || 24} color={props.fill || props.color || '#000'} />;
const WalletIcon = (props: any) => <Ionicons name="card-outline" size={props.style?.width || 24} color={props.fill || props.color || '#000'} />;

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const wallets = useWalletStore((state) => state.wallets);
  const allTransactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);

  const totalAssets = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const recentTransactions = useMemo(() => {
    return allTransactions.slice(0, 5);
  }, [allTransactions]);

  const getCategoryName = useCallback((categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
  }, [categories]);

  const getWalletName = useCallback((walletId: string) => {
    return wallets.find((w) => w.id === walletId)?.name ?? 'Unknown';
  }, [wallets]);

  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCloseSheet = () => {
    bottomSheetRef.current?.close();
  };

  const renderTransaction = ({ item }: any) => (
    <ListItem
      title={getCategoryName(item.categoryId)}
      description={`${getWalletName(item.walletId)} • ${formatDate(new Date(item.date))}`}
      accessoryRight={() => (
        <Text
          status={item.type === 'income' ? 'success' : 'danger'}
          category="s1"
        >
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      )}
    />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Layout style={styles.content}>
            <Text category="h5" style={styles.greeting}>{getGreeting()}</Text>

            <Card style={styles.balanceCard}>
              <Text appearance="hint" category="s1">Total Balance</Text>
              <Text category="h1" style={styles.balanceAmount}>
                {formatCurrency(totalAssets)}
              </Text>
              <Text appearance="hint" category="c1">
                {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
              </Text>
            </Card>

            <Layout style={styles.section}>
              <Layout style={styles.sectionHeader}>
                <Text category="h6">Wallets</Text>
                <Link href="/wallet/create" asChild>
                  <Button size="tiny" appearance="ghost" accessoryLeft={PlusIcon}>
                    Add
                  </Button>
                </Link>
              </Layout>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {wallets.map((wallet) => (
                  <Link key={wallet.id} href={`/wallet/${wallet.id}`} asChild>
                    <Pressable>
                      <Card style={styles.walletCard}>
                        <Layout style={styles.walletCardContent}>
                          <WalletIcon style={styles.walletIcon} fill="#8F9BB3" />
                          <Text category="s2" appearance="hint">{wallet.name}</Text>
                          <Text category="s1">{formatCurrency(wallet.balance)}</Text>
                        </Layout>
                      </Card>
                    </Pressable>
                  </Link>
                ))}
                {wallets.length === 0 && (
                  <Link href="/wallet/create" asChild>
                    <Card style={styles.walletCard}>
                      <Layout style={styles.walletCardContent}>
                        <PlusIcon style={styles.walletIcon} fill="#8F9BB3" />
                        <Text category="s2" appearance="hint">Add Wallet</Text>
                      </Layout>
                    </Card>
                  </Link>
                )}
              </ScrollView>
            </Layout>

            <Layout style={styles.section}>
              <Layout style={styles.sectionHeader}>
                <Text category="h6">Recent Transactions</Text>
                <Link href="/history" asChild>
                  <Button size="tiny" appearance="ghost">See All</Button>
                </Link>
              </Layout>

              {recentTransactions.length === 0 ? (
                <Card>
                  <Text appearance="hint" style={styles.emptyText}>
                    No transactions yet. Tap + to add one.
                  </Text>
                </Card>
              ) : (
                <Card style={styles.transactionCard}>
                  <List
                    data={recentTransactions}
                    renderItem={renderTransaction}
                    ItemSeparatorComponent={Divider}
                    scrollEnabled={false}
                  />
                </Card>
              )}
            </Layout>
          </Layout>
        </ScrollView>

        <Button
          style={styles.fab}
          size="giant"
          status="primary"
          accessoryLeft={PlusIcon}
          onPress={handleOpenSheet}
        />

        <AddTransactionSheet ref={bottomSheetRef} onClose={handleCloseSheet} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  greeting: {
    marginBottom: 16,
  },
  balanceCard: {
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceAmount: {
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletCard: {
    marginRight: 12,
    minWidth: 120,
  },
  walletCardContent: {
    alignItems: 'center',
    gap: 4,
  },
  walletIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  transactionCard: {
    padding: 0,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    width: 56,
    height: 56,
  },
});
