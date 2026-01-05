import { useMemo } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWalletStore } from '@/stores/wallet-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const wallets = useWalletStore((state) => state.wallets);
  const allTransactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);

  // Memoize derived values to avoid infinite loops
  const totalAssets = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const recentTransactions = useMemo(() => {
    return allTransactions.slice(0, 10);
  }, [allTransactions]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
  };

  const getWalletName = (walletId: string) => {
    return wallets.find((w) => w.id === walletId)?.name ?? 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Expense Lovers</ThemedText>
        </ThemedView>

        {/* Total Assets Card */}
        <ThemedView style={[styles.card, styles.totalCard]}>
          <ThemedText style={styles.cardLabel}>Total Assets</ThemedText>
          <ThemedText type="title" style={styles.totalAmount}>
            {formatCurrency(totalAssets)}
          </ThemedText>
          <ThemedText style={styles.walletCount}>
            {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
          </ThemedText>
        </ThemedView>

        {/* Wallets Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Wallets</ThemedText>
            <Link href="/wallet/create" asChild>
              <Pressable>
                <ThemedText style={{ color: Colors[colorScheme].tint }}>+ Add</ThemedText>
              </Pressable>
            </Link>
          </View>
          {wallets.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No wallets yet</ThemedText>
              <Link href="/wallet/create" asChild>
                <Pressable style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}>
                  <ThemedText style={styles.addButtonText}>Create your first wallet</ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletList}>
              {wallets.map((wallet) => (
                <Link key={wallet.id} href={`/wallet/${wallet.id}`} asChild>
                  <Pressable style={styles.walletCard}>
                    <ThemedText style={styles.walletName}>{wallet.name}</ThemedText>
                    <ThemedText type="defaultSemiBold">{formatCurrency(wallet.balance)}</ThemedText>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Recent Transactions */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Recent Transactions</ThemedText>
            <Link href="/history" asChild>
              <Pressable>
                <ThemedText style={{ color: Colors[colorScheme].tint }}>See all</ThemedText>
              </Pressable>
            </Link>
          </View>
          {recentTransactions.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
            </ThemedView>
          ) : (
            <ThemedView>
              {recentTransactions.map((transaction) => (
                <ThemedView key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <ThemedText type="defaultSemiBold">
                      {getCategoryName(transaction.categoryId)}
                    </ThemedText>
                    <ThemedText style={styles.transactionMeta}>
                      {getWalletName(transaction.walletId)} • {formatDate(new Date(transaction.date))}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{
                      color: transaction.type === 'income' ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>

      {/* FAB Button */}
      <Link href="/transaction/create" asChild>
        <Pressable style={[styles.fab, { backgroundColor: Colors[colorScheme].tint }]}>
          <IconSymbol name="plus" size={28} color="#fff" />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  totalCard: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    marginBottom: 4,
  },
  walletCount: {
    fontSize: 14,
    opacity: 0.7,
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
  emptyState: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
  },
  emptyText: {
    opacity: 0.6,
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  walletList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  walletCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  walletName: {
    marginBottom: 8,
    opacity: 0.7,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
