# UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Expense Lovers UI using UI Kitten with bottom sheet transaction input for a minimal, modern finance app experience.

**Architecture:** Replace existing custom themed components with UI Kitten's Eva Design System. Add bottom sheet for quick transaction entry. Simplify navigation to 3 tabs (Home, History, Settings).

**Tech Stack:** UI Kitten, Eva Design System, @gorhom/bottom-sheet, react-native-svg

---

### Task 1: Install UI Kitten Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install core UI Kitten packages**

Run:
```bash
npm install @ui-kitten/components @eva-design/eva
```

**Step 2: Install icon packages**

Run:
```bash
npm install @ui-kitten/eva-icons react-native-svg
```

**Step 3: Install bottom sheet**

Run:
```bash
npm install @gorhom/bottom-sheet
```

**Step 4: Verify installation**

Run: `npm run lint`
Expected: No errors

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add UI Kitten and bottom sheet dependencies"
```

---

### Task 2: Configure ApplicationProvider

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Update root layout with UI Kitten provider**

Replace the entire file with:

```tsx
// Polyfill for crypto.getRandomValues() required by uuid
import 'react-native-get-random-values';

import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { initializeDatabase, seedDefaultCategories } from '@/db';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWalletStore } from '@/stores/wallet-store';
import { useCategoryStore } from '@/stores/category-store';
import { useTransactionStore } from '@/stores/transaction-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function initDb() {
      try {
        await initializeDatabase();
        await seedDefaultCategories();
        await Promise.all([
          useWalletStore.getState().loadWallets(),
          useCategoryStore.getState().loadCategories(),
          useTransactionStore.getState().loadTransactions(),
        ]);
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
    initDb();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={colorScheme === 'dark' ? eva.dark : eva.light}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="wallet/create" options={{ headerShown: false }} />
          <Stack.Screen name="wallet/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ApplicationProvider>
    </>
  );
}
```

**Step 2: Run lint to verify**

Run: `npm run lint`
Expected: No errors

**Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: configure UI Kitten ApplicationProvider"
```

---

### Task 3: Update Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Replace tab layout with UI Kitten BottomNavigation**

```tsx
import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import { Tabs } from 'expo-router';
import React from 'react';

const HomeIcon = (props: any) => <Icon {...props} name="home-outline" />;
const HistoryIcon = (props: any) => <Icon {...props} name="clock-outline" />;
const SettingsIcon = (props: any) => <Icon {...props} name="settings-outline" />;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state }) => (
        <BottomNavigation
          selectedIndex={state.index}
          onSelect={(index) => navigation.navigate(state.routeNames[index])}
        >
          <BottomNavigationTab title="Home" icon={HomeIcon} />
          <BottomNavigationTab title="History" icon={HistoryIcon} />
          <BottomNavigationTab title="Settings" icon={SettingsIcon} />
        </BottomNavigation>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
```

**Step 2: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: replace tab bar with UI Kitten BottomNavigation"
```

---

### Task 4: Create Settings Screen Placeholder

**Files:**
- Create: `app/(tabs)/settings.tsx`

**Step 1: Create basic settings screen**

```tsx
import { Layout, Text, Toggle, Divider } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Layout style={styles.content}>
        <Text category="h5" style={styles.header}>Settings</Text>

        <Layout style={styles.section}>
          <Layout style={styles.row}>
            <Text category="s1">Dark Mode</Text>
            <Toggle checked={colorScheme === 'dark'} disabled />
          </Layout>
          <Text appearance="hint" category="c1">
            Follows system setting
          </Text>
        </Layout>

        <Divider style={styles.divider} />

        <Layout style={styles.section}>
          <Text category="s1">Version</Text>
          <Text appearance="hint" category="c1">1.0.0</Text>
        </Layout>
      </Layout>
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
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
});
```

**Step 2: Commit**

```bash
git add app/(tabs)/settings.tsx
git commit -m "feat: add settings screen placeholder"
```

---

### Task 5: Create Bottom Sheet Transaction Component

**Files:**
- Create: `components/add-transaction-sheet.tsx`

**Step 1: Create the bottom sheet component**

```tsx
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, Input, Text, ButtonGroup, Select, SelectItem, IndexPath } from '@ui-kitten/components';

import { useWalletStore } from '@/stores/wallet-store';
import { useCategoryStore } from '@/stores/category-store';
import { useTransactionStore } from '@/stores/transaction-store';

interface AddTransactionSheetProps {
  onClose: () => void;
}

export const AddTransactionSheet = forwardRef<BottomSheet, AddTransactionSheetProps>(
  ({ onClose }, ref) => {
    const wallets = useWalletStore((state) => state.wallets);
    const categories = useCategoryStore((state) => state.categories);
    const addTransaction = useTransactionStore((state) => state.addTransaction);

    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [walletIndex, setWalletIndex] = useState<IndexPath>(new IndexPath(0));
    const [categoryIndex, setCategoryIndex] = useState<IndexPath | undefined>();
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const snapPoints = useMemo(() => ['70%'], []);

    const filteredCategories = categories.filter((c) => c.type === type);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      []
    );

    const formatAmount = (text: string) => {
      const cleaned = text.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
      if (parts.length === 2 && parts[1].length > 2) return parts[0] + '.' + parts[1].slice(0, 2);
      return cleaned;
    };

    const handleSubmit = async () => {
      const amountValue = parseFloat(amount);
      if (!amountValue || amountValue <= 0) return;
      if (!wallets[walletIndex.row]) return;
      if (!categoryIndex || !filteredCategories[categoryIndex.row]) return;

      setIsLoading(true);
      try {
        await addTransaction({
          type,
          amount: amountValue,
          walletId: wallets[walletIndex.row].id,
          categoryId: filteredCategories[categoryIndex.row].id,
          note: note.trim() || undefined,
        });
        // Reset form
        setAmount('');
        setCategoryIndex(undefined);
        setNote('');
        onClose();
      } catch (error) {
        console.error('Failed to add transaction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleTypeChange = (index: number) => {
      setType(index === 0 ? 'expense' : 'income');
      setCategoryIndex(undefined);
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={onClose}
      >
        <BottomSheetView style={styles.content}>
          <Text category="h6" style={styles.title}>Add Transaction</Text>

          <ButtonGroup style={styles.typeToggle} size="medium">
            <Button
              onPress={() => handleTypeChange(0)}
              appearance={type === 'expense' ? 'filled' : 'outline'}
              status="danger"
            >
              Expense
            </Button>
            <Button
              onPress={() => handleTypeChange(1)}
              appearance={type === 'income' ? 'filled' : 'outline'}
              status="success"
            >
              Income
            </Button>
          </ButtonGroup>

          <Input
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={(text) => setAmount(formatAmount(text))}
            keyboardType="decimal-pad"
            size="large"
            textStyle={styles.amountText}
            textAlign="center"
            autoFocus
          />

          <Select
            style={styles.select}
            label="Wallet"
            placeholder="Select wallet"
            value={wallets[walletIndex.row]?.name}
            selectedIndex={walletIndex}
            onSelect={(index) => setWalletIndex(index as IndexPath)}
          >
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} title={wallet.name} />
            ))}
          </Select>

          <Select
            style={styles.select}
            label="Category"
            placeholder="Select category"
            value={categoryIndex ? filteredCategories[categoryIndex.row]?.name : undefined}
            selectedIndex={categoryIndex}
            onSelect={(index) => setCategoryIndex(index as IndexPath)}
          >
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} title={category.name} />
            ))}
          </Select>

          <Input
            style={styles.noteInput}
            label="Note (optional)"
            placeholder="Add a note..."
            value={note}
            onChangeText={(text) => setNote(text.slice(0, 100))}
            maxLength={100}
          />

          <Button
            style={styles.submitButton}
            size="large"
            status={type === 'expense' ? 'danger' : 'success'}
            onPress={handleSubmit}
            disabled={isLoading || !amount}
          >
            {isLoading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
          </Button>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  typeToggle: {
    marginBottom: 20,
  },
  amountInput: {
    marginBottom: 20,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '600',
  },
  select: {
    marginBottom: 16,
  },
  noteInput: {
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 'auto',
  },
});
```

**Step 2: Commit**

```bash
git add components/add-transaction-sheet.tsx
git commit -m "feat: create bottom sheet transaction component"
```

---

### Task 6: Redesign Dashboard Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Replace dashboard with UI Kitten components**

```tsx
import React, { useMemo, useRef, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { Layout, Text, Card, Button, Icon, List, ListItem, Divider } from '@ui-kitten/components';
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

const PlusIcon = (props: any) => <Icon {...props} name="plus-outline" />;
const WalletIcon = (props: any) => <Icon {...props} name="credit-card-outline" />;

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
            {/* Greeting */}
            <Text category="h5" style={styles.greeting}>{getGreeting()}</Text>

            {/* Balance Card */}
            <Card style={styles.balanceCard}>
              <Text appearance="hint" category="s1">Total Balance</Text>
              <Text category="h1" style={styles.balanceAmount}>
                {formatCurrency(totalAssets)}
              </Text>
              <Text appearance="hint" category="c1">
                {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
              </Text>
            </Card>

            {/* Wallets Section */}
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

            {/* Recent Transactions */}
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

        {/* FAB */}
        <Button
          style={styles.fab}
          size="giant"
          status="primary"
          accessoryLeft={PlusIcon}
          onPress={handleOpenSheet}
        />

        {/* Bottom Sheet */}
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
```

**Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: redesign dashboard with UI Kitten components"
```

---

### Task 7: Move History to Tab and Redesign

**Files:**
- Create: `app/(tabs)/history.tsx`
- Delete: `app/history.tsx`

**Step 1: Create history tab screen**

```tsx
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
```

**Step 2: Remove old history file**

Run: `rm app/history.tsx`

**Step 3: Commit**

```bash
git add app/(tabs)/history.tsx
git rm app/history.tsx
git commit -m "feat: move and redesign history screen as tab"
```

---

### Task 8: Redesign Wallet Create Screen

**Files:**
- Modify: `app/wallet/create.tsx`

**Step 1: Replace with UI Kitten components**

```tsx
import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Layout, Text, Input, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useWalletStore } from '@/stores/wallet-store';

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;

export default function CreateWalletScreen() {
  const addWallet = useWalletStore((state) => state.addWallet);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatBalance = (value: string): string => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]?.length > 2) return parts[0] + '.' + parts[1].slice(0, 2);
    return cleaned;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Wallet name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const numBalance = parseFloat(balance || '0');
      await addWallet(name.trim(), numBalance);
      router.back();
    } catch (e) {
      console.error('Failed to create wallet:', e);
      setError('Failed to create wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title="Create Wallet"
        alignment="center"
        accessoryLeft={BackAction}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Layout style={styles.content}>
          <Input
            style={styles.input}
            label="Wallet Name"
            placeholder="e.g., Cash, Bank Account, Savings"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            status={error ? 'danger' : 'basic'}
            caption={error || undefined}
            autoFocus
          />

          <Input
            style={styles.input}
            label="Initial Balance"
            placeholder="0.00"
            value={balance}
            onChangeText={(text) => setBalance(formatBalance(text))}
            keyboardType="decimal-pad"
            accessoryLeft={(props) => <Text {...props}>$</Text>}
          />

          <Button
            style={styles.button}
            size="large"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Wallet'}
          </Button>
        </Layout>
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
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
```

**Step 2: Commit**

```bash
git add app/wallet/create.tsx
git commit -m "feat: redesign wallet create with UI Kitten"
```

---

### Task 9: Redesign Wallet Detail Screen

**Files:**
- Modify: `app/wallet/[id].tsx`

**Step 1: Replace with UI Kitten components**

```tsx
import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Layout, Text, Card, Input, Button, Icon, TopNavigation, TopNavigationAction, Modal } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useWalletStore } from '@/stores/wallet-store';

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;
const EditIcon = (props: any) => <Icon {...props} name="edit-outline" />;
const TrashIcon = (props: any) => <Icon {...props} name="trash-2-outline" />;

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
          <Text appearance="hint">This wallet doesn't exist.</Text>
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

      {/* Edit Modal */}
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
```

**Step 2: Commit**

```bash
git add app/wallet/[id].tsx
git commit -m "feat: redesign wallet detail with UI Kitten"
```

---

### Task 10: Remove Old Transaction Create Screen

**Files:**
- Delete: `app/transaction/create.tsx`
- Delete: `app/transaction/` directory

**Step 1: Remove transaction create (now handled by bottom sheet)**

Run:
```bash
rm -rf app/transaction
```

**Step 2: Commit**

```bash
git rm -rf app/transaction
git commit -m "refactor: remove transaction screen (replaced by bottom sheet)"
```

---

### Task 11: Remove Old Explore Tab

**Files:**
- Delete: `app/(tabs)/explore.tsx`

**Step 1: Remove explore tab**

Run: `rm app/(tabs)/explore.tsx`

**Step 2: Commit**

```bash
git rm app/(tabs)/explore.tsx
git commit -m "refactor: remove explore tab"
```

---

### Task 12: Cleanup Unused Components

**Files:**
- Delete: `components/hello-wave.tsx`
- Delete: `components/parallax-scroll-view.tsx`
- Delete: `components/external-link.tsx`
- Delete: `components/haptic-tab.tsx`

**Step 1: Remove unused components**

Run:
```bash
rm components/hello-wave.tsx components/parallax-scroll-view.tsx components/external-link.tsx components/haptic-tab.tsx
```

**Step 2: Commit**

```bash
git rm components/hello-wave.tsx components/parallax-scroll-view.tsx components/external-link.tsx components/haptic-tab.tsx
git commit -m "refactor: remove unused starter components"
```

---

### Task 13: Final Lint and Test

**Step 1: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 2: Start app and test**

Run: `npx expo start`

Test:
- Dashboard loads with greeting
- Can create wallet via bottom sheet style
- FAB opens transaction bottom sheet
- Can add expense/income
- History tab shows grouped transactions
- Settings tab loads

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup after UI redesign"
```
