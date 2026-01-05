import { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, Alert, ScrollView, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWalletStore } from '@/stores/wallet-store';
import { useCategoryStore } from '@/stores/category-store';
import { useSubscriptionStore } from '@/stores/subscription-store';

type SubscriptionCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

const cycleOptions: { value: SubscriptionCycle; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function CreateSubscriptionScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const wallets = useWalletStore((state) => state.wallets);
  const categories = useCategoryStore((state) => state.categories);
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<SubscriptionCycle>('monthly');
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const formatDate = (d: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const displayAmount = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleAmountChange = (text: string) => {
    const cleanedText = text.replace(/,/g, '');
    setAmount(formatAmount(cleanedText));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a subscription name');
      return;
    }
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!selectedWalletId) {
      Alert.alert('Error', 'Please select a wallet');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsLoading(true);
    try {
      await addSubscription({
        name: name.trim(),
        amount: amountValue,
        cycle,
        walletId: selectedWalletId,
        categoryId: selectedCategoryId,
        startDate,
        note: note.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add subscription');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Subscription',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                  color: Colors[colorScheme].text,
                },
              ]}
              placeholder="Netflix, Spotify, etc."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Amount</ThemedText>
            <TextInput
              style={[
                styles.amountInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                  color: Colors[colorScheme].text,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={displayAmount(amount)}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Billing Cycle</ThemedText>
            <View style={styles.cycleSelector}>
              {cycleOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.cycleButton,
                    {
                      backgroundColor:
                        cycle === option.value
                          ? Colors[colorScheme].tint
                          : colorScheme === 'dark'
                          ? '#333'
                          : '#f5f5f5',
                    },
                  ]}
                  onPress={() => setCycle(option.value)}
                >
                  <ThemedText
                    style={[
                      styles.cycleText,
                      cycle === option.value && styles.cycleTextActive,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Wallet</ThemedText>
            {wallets.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                No wallets available. Create one first.
              </ThemedText>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {wallets.map((wallet) => (
                  <Pressable
                    key={wallet.id}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          selectedWalletId === wallet.id
                            ? Colors[colorScheme].tint
                            : colorScheme === 'dark'
                            ? '#333'
                            : '#f5f5f5',
                      },
                    ]}
                    onPress={() => setSelectedWalletId(wallet.id)}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        selectedWalletId === wallet.id && styles.optionTextActive,
                      ]}
                    >
                      {wallet.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <View style={styles.categoryGrid}>
              {expenseCategories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor:
                        selectedCategoryId === category.id
                          ? Colors[colorScheme].tint
                          : colorScheme === 'dark'
                          ? '#333'
                          : '#f5f5f5',
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      selectedCategoryId === category.id && styles.optionTextActive,
                    ]}
                  >
                    {category.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Start Date</ThemedText>
            <Pressable
              style={[
                styles.dateButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{formatDate(startDate)}</ThemedText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <Pressable
                style={[styles.dateCloseButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={() => setShowDatePicker(false)}
              >
                <ThemedText style={styles.dateCloseText}>Done</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Note (optional)</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                  color: Colors[colorScheme].text,
                },
              ]}
              placeholder="Add a note..."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={note}
              onChangeText={(text) => setNote(text.slice(0, 100))}
              maxLength={100}
            />
            <ThemedText style={styles.charCount}>{note.length}/100</ThemedText>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme].tint },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Add Subscription'}
            </ThemedText>
          </Pressable>
        </View>
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  amountInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  cycleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cycleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cycleText: {
    fontSize: 14,
  },
  cycleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  charCount: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
    marginTop: 4,
  },
  dateButton: {
    borderRadius: 12,
    padding: 16,
  },
  dateCloseButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateCloseText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
