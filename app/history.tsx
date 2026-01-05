import { StyleSheet, View, SectionList } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';
import { useWalletStore } from '@/stores/wallet-store';
import type { Transaction } from '@/db/schema';

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

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

interface Section {
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

  // Group transactions by month
  const sections: Section[] = transactions.reduce((acc: Section[], transaction) => {
    const date = new Date(transaction.date);
    const monthYear = formatMonthYear(date);

    const existingSection = acc.find((s) => s.title === monthYear);
    if (existingSection) {
      existingSection.data.push(transaction);
    } else {
      acc.push({ title: monthYear, data: [transaction] });
    }
    return acc;
  }, []);

  const renderItem = ({ item: transaction }: { item: Transaction }) => (
    <ThemedView style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <ThemedText type="defaultSemiBold">{getCategoryName(transaction.categoryId)}</ThemedText>
        <ThemedText style={styles.transactionMeta}>
          {getWalletName(transaction.walletId)} • {formatDate(new Date(transaction.date))}
        </ThemedText>
        {transaction.note && (
          <ThemedText style={styles.transactionNote}>{transaction.note}</ThemedText>
        )}
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
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <ThemedView style={styles.sectionHeader}>
      <ThemedText type="defaultSemiBold">{section.title}</ThemedText>
    </ThemedView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Transaction History',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {transactions.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tap the + button to add your first transaction
            </ThemedText>
          </ThemedView>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingTop: 20,
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
    marginRight: 12,
  },
  transactionMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  transactionNote: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
