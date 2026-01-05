import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, Input, Text, ButtonGroup, Select, SelectItem, IndexPath } from '@ui-kitten/components';

import { useWalletStore } from '@/stores/wallet-store';
import { useCategoryStore } from '@/stores/category-store';
import { useTransactionStore } from '@/stores/transaction-store';

interface AddTransactionSheetProps {
  onClose: () => void;
}

const AddTransactionSheet = forwardRef<BottomSheet, AddTransactionSheetProps>(
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
          date: new Date(),
        });
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

AddTransactionSheet.displayName = 'AddTransactionSheet';

export { AddTransactionSheet };

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
    alignSelf: 'center',
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
