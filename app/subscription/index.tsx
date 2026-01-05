import { useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useCategoryStore } from '@/stores/category-store';
import { useWalletStore } from '@/stores/wallet-store';

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
    year: 'numeric',
  }).format(date);
}

function getCycleLabel(cycle: string): string {
  const labels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return labels[cycle] ?? cycle;
}

export default function SubscriptionListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { subscriptions, loadSubscriptions, markAsPaid } = useSubscriptionStore();
  const categories = useCategoryStore((state) => state.categories);
  const wallets = useWalletStore((state) => state.wallets);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => s.isActive);
  }, [subscriptions]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
  };

  const getWalletName = (walletId: string) => {
    return wallets.find((w) => w.id === walletId)?.name ?? 'Unknown';
  };

  const isDueSoon = (nextDueDate: Date) => {
    const now = new Date();
    const dueDate = new Date(nextDueDate);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const isOverdue = (nextDueDate: Date) => {
    const now = new Date();
    const dueDate = new Date(nextDueDate);
    return dueDate < now;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Subscriptions',
          headerRight: () => (
            <Link href="/subscription/create" asChild>
              <Pressable style={{ marginRight: 16 }}>
                <ThemedText style={{ color: Colors[colorScheme].tint }}>+ Add</ThemedText>
              </Pressable>
            </Link>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeSubscriptions.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No subscriptions yet</ThemedText>
              <Link href="/subscription/create" asChild>
                <Pressable
                  style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}
                >
                  <ThemedText style={styles.addButtonText}>Add your first subscription</ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
          ) : (
            <ThemedView>
              {activeSubscriptions.map((subscription) => {
                const dueDate = new Date(subscription.nextDueDate);
                const overdue = isOverdue(dueDate);
                const dueSoon = isDueSoon(dueDate);

                return (
                  <ThemedView key={subscription.id} style={styles.subscriptionCard}>
                    <View style={styles.cardHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.subscriptionName}>
                        {subscription.name}
                      </ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.amount}>
                        {formatCurrency(subscription.amount)}
                      </ThemedText>
                    </View>

                    <View style={styles.cardMeta}>
                      <ThemedText style={styles.metaText}>
                        {getCycleLabel(subscription.cycle)} • {getCategoryName(subscription.categoryId)}
                      </ThemedText>
                      <ThemedText style={styles.metaText}>
                        {getWalletName(subscription.walletId)}
                      </ThemedText>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.dueDateContainer}>
                        <ThemedText
                          style={[
                            styles.dueDateLabel,
                            overdue && styles.overdueText,
                            dueSoon && !overdue && styles.dueSoonText,
                          ]}
                        >
                          {overdue ? 'Overdue' : 'Next due'}:
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.dueDate,
                            overdue && styles.overdueText,
                            dueSoon && !overdue && styles.dueSoonText,
                          ]}
                        >
                          {formatDate(dueDate)}
                        </ThemedText>
                      </View>

                      <Pressable
                        style={[styles.paidButton, { backgroundColor: Colors[colorScheme].tint }]}
                        onPress={() => markAsPaid(subscription.id)}
                      >
                        <ThemedText style={styles.paidButtonText}>Mark Paid</ThemedText>
                      </Pressable>
                    </View>
                  </ThemedView>
                );
              })}
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    opacity: 0.6,
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 16,
    flex: 1,
  },
  amount: {
    fontSize: 18,
  },
  cardMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    opacity: 0.6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flex: 1,
  },
  dueDateLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  overdueText: {
    color: '#ef4444',
  },
  dueSoonText: {
    color: '#f59e0b',
  },
  paidButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paidButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
