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
import { useTransactionStore } from '@/stores/transaction-store';

export default function CreateTransactionScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const wallets = useWalletStore((state) => state.wallets);
  const categories = useCategoryStore((state) => state.categories);
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

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
      setDate(selectedDate);
    }
  };

  const formatAmount = (text: string) => {
    // Remove non-numeric characters except decimal point
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

  // Format display with thousand separators
  const displayAmount = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleAmountChange = (text: string) => {
    // Remove commas for storage, they're only for display
    const cleanedText = text.replace(/,/g, '');
    setAmount(formatAmount(cleanedText));
  };

  const handleSubmit = async () => {
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
      await addTransaction({
        type,
        amount: amountValue,
        walletId: selectedWalletId,
        categoryId: selectedCategoryId,
        note: note.trim() || undefined,
        date,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Transaction',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <Pressable
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: '#ef4444' },
              ]}
              onPress={() => {
                setType('expense');
                setSelectedCategoryId('');
              }}
            >
              <ThemedText style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                Expense
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.typeButton,
                type === 'income' && { backgroundColor: '#22c55e' },
              ]}
              onPress={() => {
                setType('income');
                setSelectedCategoryId('');
              }}
            >
              <ThemedText style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                Income
              </ThemedText>
            </Pressable>
          </View>

          {/* Amount Input */}
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

          {/* Wallet Selector */}
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

          {/* Category Selector */}
          <View style={styles.field}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <View style={styles.categoryGrid}>
              {filteredCategories.map((category) => (
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

          {/* Date Picker */}
          <View style={styles.field}>
            <ThemedText style={styles.label}>Date</ThemedText>
            <Pressable
              style={[
                styles.dateButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{formatDate(date)}</ThemedText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
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

          {/* Note Input */}
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
              { backgroundColor: type === 'expense' ? '#ef4444' : '#22c55e' },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Saving...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
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
