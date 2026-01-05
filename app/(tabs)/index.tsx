import React, { useMemo, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Fab,
  FabIcon,
  Icon,
  Pressable,
} from '@gluestack-ui/themed';
import { Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useWalletStore } from '@/stores/wallet-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { DesignTokens } from '@/constants/theme';

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Box flex={1} bg="$backgroundLight0">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Box p="$6">
              <Text
                size="xl"
                mb="$4"
                style={{ fontFamily: DesignTokens.fonts.bold, color: DesignTokens.colors.ink }}
              >
                Hey there! 👋
              </Text>

              <Box
                p="$6"
                alignItems="center"
                mb="$6"
                style={{
                  backgroundColor: DesignTokens.colors.white,
                  borderRadius: DesignTokens.radii.lg,
                  ...DesignTokens.elevation.card,
                }}
              >
                <Text size="sm" mb="$2" style={{ color: DesignTokens.colors.textSecondary }}>
                  Total Balance
                </Text>
                <Text
                  mb="$2"
                  style={{
                    ...DesignTokens.typography.display,
                    color: DesignTokens.colors.ink,
                  }}
                >
                  {formatCurrency(totalAssets)}
                </Text>
                <Text size="xs" style={{ color: DesignTokens.colors.textTertiary }}>
                  {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
                </Text>
              </Box>

              <Box mb="$6">
                <HStack justifyContent="space-between" alignItems="center" mb="$3">
                  <Text style={{ ...DesignTokens.typography.sectionTitle, color: DesignTokens.colors.ink }}>Wallets</Text>
                  <Link href="/wallet/create" asChild>
                    <Pressable>
                      <HStack alignItems="center" space="xs">
                        <Icon as={Plus} size="sm" color={DesignTokens.colors.primary} />
                        <Text style={{ color: DesignTokens.colors.primary, fontFamily: DesignTokens.fonts.semibold }} size="sm">Add</Text>
                      </HStack>
                    </Pressable>
                  </Link>
                </HStack>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space="md">
                    {wallets.map((wallet) => (
                      <Link key={wallet.id} href={`/wallet/${wallet.id}`} asChild>
                        <Pressable>
                          <Box
                            p="$4"
                            minWidth={140}
                            style={{
                              backgroundColor: DesignTokens.colors.ink,
                              borderRadius: DesignTokens.radii.lg,
                              ...DesignTokens.elevation.card,
                            }}
                          >
                            <Text
                              size="xs"
                              mb="$1"
                              style={{ color: DesignTokens.colors.textSecondary, fontFamily: DesignTokens.fonts.regular }}
                            >
                              {wallet.name}
                            </Text>
                            <Text
                              size="xl"
                              style={{ color: DesignTokens.colors.white, fontFamily: DesignTokens.fonts.bold }}
                            >
                              {formatCurrency(wallet.balance)}
                            </Text>
                          </Box>
                        </Pressable>
                      </Link>
                    ))}
                    {wallets.length === 0 && (
                      <Link href="/wallet/create" asChild>
                        <Pressable>
                          <Box
                            p="$4"
                            minWidth={140}
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              backgroundColor: DesignTokens.colors.surfaceSubtle,
                              borderRadius: DesignTokens.radii.lg,
                              borderWidth: 1,
                              borderColor: DesignTokens.colors.border,
                              borderStyle: 'dashed',
                            }}
                          >
                            <Icon as={Plus} size="lg" color={DesignTokens.colors.textTertiary} />
                            <Text size="sm" mt="$2" style={{ color: DesignTokens.colors.textTertiary }}>
                              Add Wallet
                            </Text>
                          </Box>
                        </Pressable>
                      </Link>
                    )}
                  </HStack>
                </ScrollView>
              </Box>

              <Box>
                <HStack justifyContent="space-between" alignItems="center" mb="$3">
                  <Text style={{ ...DesignTokens.typography.sectionTitle, color: DesignTokens.colors.ink }}>
                    Recent Transactions
                  </Text>
                  <Link href="/history" asChild>
                    <Pressable>
                      <Text size="sm" style={{ color: DesignTokens.colors.primary, fontFamily: DesignTokens.fonts.semibold }}>
                        See All
                      </Text>
                    </Pressable>
                  </Link>
                </HStack>

                {recentTransactions.length === 0 ? (
                  <Box
                    p="$6"
                    alignItems="center"
                    style={{
                      backgroundColor: DesignTokens.colors.white,
                      borderRadius: DesignTokens.radii.md,
                    }}
                  >
                    <Text textAlign="center" style={{ color: DesignTokens.colors.textTertiary }}>
                      No transactions yet. Tap + to add one.
                    </Text>
                  </Box>
                ) : (
                  <Box
                    overflow="hidden"
                    style={{
                      backgroundColor: DesignTokens.colors.white,
                      borderRadius: DesignTokens.radii.md,
                    }}
                  >
                    {recentTransactions.map((item, index) => (
                      <Box key={item.id}>
                        <HStack
                          p="$4"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <VStack>
                            <Text style={{ fontFamily: DesignTokens.fonts.semibold, color: DesignTokens.colors.ink }}>
                              {getCategoryName(item.categoryId)}
                            </Text>
                            <Text size="xs" style={{ color: DesignTokens.colors.textSecondary }}>
                              {getWalletName(item.walletId)} • {formatDate(new Date(item.date))}
                            </Text>
                          </VStack>
                          <Text
                            style={{
                              fontFamily: DesignTokens.fonts.bold,
                              color: item.type === 'income' ? DesignTokens.colors.success : DesignTokens.colors.ink,
                            }}
                          >
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </Text>
                        </HStack>
                        {index < recentTransactions.length - 1 && (
                          <Box h={1} style={{ backgroundColor: DesignTokens.colors.border }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </ScrollView>

          <Fab
            size="lg"
            placement="bottom right"
            isHovered={false}
            isDisabled={false}
            isPressed={false}
            onPress={handleOpenSheet}
            mb="$4"
            mr="$4"
            style={{ backgroundColor: DesignTokens.colors.primary }}
          >
            <FabIcon as={Plus} color={DesignTokens.colors.white} />
          </Fab>

          <AddTransactionSheet ref={bottomSheetRef} onClose={handleCloseSheet} />
        </SafeAreaView>
      </Box>
    </GestureHandlerRootView>
  );
}

