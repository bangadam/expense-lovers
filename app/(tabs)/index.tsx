import React, { useMemo, useRef, useCallback } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Fab,
  FabIcon,
  Button,
  ButtonText,
  Icon,
  Pressable,
} from '@gluestack-ui/themed';
import { Plus, Wallet, ChevronRight } from 'lucide-react-native';
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
            <Box p="$4">
              <Heading size="md" mb="$4">
                {getGreeting()}
              </Heading>

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
                  Total Balance
                </Text>
                <Heading size="3xl" mb="$2">
                  {formatCurrency(totalAssets)}
                </Heading>
                <Text size="xs" color="$textLight400">
                  {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
                </Text>
              </Box>

              <Box mb="$6">
                <HStack justifyContent="space-between" alignItems="center" mb="$3">
                  <Heading size="sm">Wallets</Heading>
                  <Link href="/wallet/create" asChild>
                    <Pressable>
                      <HStack alignItems="center" space="xs">
                        <Icon as={Plus} size="sm" color="$primary500" />
                        <Text color="$primary500" size="sm" fontWeight="$medium">Add</Text>
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
                            bg="$white"
                            p="$4"
                            rounded="$lg"
                            minWidth={120}
                            alignItems="center"
                            shadowColor="$black"
                            shadowOffset={{ width: 0, height: 1 }}
                            shadowOpacity={0.05}
                            shadowRadius={4}
                            elevation={1}
                          >
                            <Box mb="$2" p="$2" bg="$backgroundLight100" rounded="$full">
                              <Icon as={Wallet} size="md" color="$textLight500" />
                            </Box>
                            <Text size="sm" color="$textLight500" mb="$1">
                              {wallet.name}
                            </Text>
                            <Text fontWeight="$bold" color="$textLight900">
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
                            bg="$white"
                            p="$4"
                            rounded="$lg"
                            minWidth={120}
                            alignItems="center"
                            borderWidth={1}
                            borderColor="$borderLight200"
                            borderStyle="dashed"
                          >
                            <Box mb="$2" p="$2" bg="$backgroundLight50" rounded="$full">
                              <Icon as={Plus} size="md" color="$textLight400" />
                            </Box>
                            <Text size="sm" color="$textLight400">
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
                  <Heading size="sm">Recent Transactions</Heading>
                  <Link href="/history" asChild>
                    <Pressable>
                      <Text color="$primary500" size="sm" fontWeight="$medium">See All</Text>
                    </Pressable>
                  </Link>
                </HStack>

                {recentTransactions.length === 0 ? (
                  <Box
                    bg="$white"
                    p="$6"
                    rounded="$lg"
                    alignItems="center"
                  >
                    <Text color="$textLight400" textAlign="center">
                      No transactions yet. Tap + to add one.
                    </Text>
                  </Box>
                ) : (
                  <Box bg="$white" rounded="$lg" overflow="hidden">
                    {recentTransactions.map((item, index) => (
                      <Box key={item.id}>
                        <HStack
                          p="$4"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <VStack>
                            <Text fontWeight="$medium" color="$textLight900">
                              {getCategoryName(item.categoryId)}
                            </Text>
                            <Text size="xs" color="$textLight500">
                              {getWalletName(item.walletId)} • {formatDate(new Date(item.date))}
                            </Text>
                          </VStack>
                          <Text
                            fontWeight="$bold"
                            color={item.type === 'income' ? '$success600' : '$error600'}
                          >
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </Text>
                        </HStack>
                        {index < recentTransactions.length - 1 && (
                          <Box h={1} bg="$borderLight100" />
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
          >
            <FabIcon as={Plus} />
          </Fab>

          <AddTransactionSheet ref={bottomSheetRef} onClose={handleCloseSheet} />
        </SafeAreaView>
      </Box>
    </GestureHandlerRootView>
  );
}

