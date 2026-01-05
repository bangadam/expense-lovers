import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
} from '@gluestack-ui/themed';
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

  const renderTransaction = ({ item, index, total }: { item: Transaction; index: number; total: number }) => (
    <Box>
      <HStack p="$4" justifyContent="space-between" alignItems="center">
        <VStack flex={1}>
          <Text fontWeight="$medium" color="$textLight900">
            {getCategoryName(item.categoryId)}
          </Text>
          <Text size="xs" color="$textLight500" numberOfLines={1}>
            {getWalletName(item.walletId)} • {formatDate(new Date(item.date))}
            {item.note ? ` • ${item.note}` : ''}
          </Text>
        </VStack>
        <Text
          fontWeight="$bold"
          color={item.type === 'income' ? '$success600' : '$error600'}
        >
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </HStack>
      {index < total - 1 && <Box h={1} bg="$borderLight100" />}
    </Box>
  );

  const renderGroup = ({ item }: { item: GroupedTransactions }) => (
    <Box mb="$5">
      <Heading size="sm" mb="$2">
        {item.title}
      </Heading>
      <Box bg="$white" rounded="$lg" overflow="hidden">
        {item.data.map((transaction, index) => (
          <Box key={transaction.id}>
            {renderTransaction({ item: transaction, index, total: item.data.length })}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box flex={1} bg="$backgroundLight0">
      <SafeAreaView style={styles.container} edges={['top']}>
        <Box p="$4" pb="$2">
          <Heading size="lg">Transaction History</Heading>
        </Box>

        {transactions.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text color="$textLight500">No transactions yet</Text>
          </Box>
        ) : (
          <FlatList
            style={styles.list}
            data={groupedTransactions}
            renderItem={renderGroup}
            keyExtractor={(item) => item.title}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
});
