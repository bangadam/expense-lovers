import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, List, ListItem, Divider, Card } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';
import { useWalletStore } from '@/stores/wallet-store';
import type { Transaction } from '@/db/schema';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getDateGroup(date: Date): string {
  const now = new Date();
  const transDate = new Date(date);

  if (transDate.toDateString() === now.toDateString()) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (transDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (transDate >= weekAgo) return 'This Week';

  return 'Earlier';
}

interface GroupedTransactions {
  title: string;
  data: Transaction[];
}

export default function HistoryScreen() {
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);
  const wallets = useWalletStore((state) => state.wallets);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
  };

  const getWalletName = (walletId: string) => {
    return wallets.find((w) => w.id === walletId)?.name ?? 'Unknown';
  };

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    transactions.forEach((t) => {
      const group = getDateGroup(new Date(t.date));
      if (!groups[group]) groups[group] = [];
      groups[group].push(t);
    });

    return order
      .filter((key) => groups[key]?.length > 0)
      .map((key) => ({ title: key, data: groups[key] }));
  }, [transactions]);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <ListItem
      title={getCategoryName(item.categoryId)}
      description={`${getWalletName(item.walletId)} • ${formatDate(new Date(item.date))}${item.note ? ` • ${item.note}` : ''}`}
      accessoryRight={() => (
        <Text status={item.type === 'income' ? 'success' : 'danger'} category="s1">
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      )}
    />
  );

  const renderGroup = ({ item }: { item: GroupedTransactions }) => (
    <Layout style={styles.group}>
      <Text category="h6" style={styles.groupTitle}>{item.title}</Text>
      <Card style={styles.groupCard}>
        <List
          data={item.data}
          renderItem={renderTransaction}
          ItemSeparatorComponent={Divider}
          scrollEnabled={false}
        />
      </Card>
    </Layout>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Layout style={styles.header}>
        <Text category="h5">Transaction History</Text>
      </Layout>

      {transactions.length === 0 ? (
        <Layout style={styles.empty}>
          <Text appearance="hint">No transactions yet</Text>
        </Layout>
      ) : (
        <List
          style={styles.list}
          data={groupedTransactions}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  group: {
    marginBottom: 20,
  },
  groupTitle: {
    marginBottom: 8,
  },
  groupCard: {
    padding: 0,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
