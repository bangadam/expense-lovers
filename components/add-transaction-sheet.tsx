import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import {
  Button,
  ButtonText,
  Input,
  InputField,
  Text,
  VStack,
  HStack,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  Icon,
  Heading,
  Box,
} from '@gluestack-ui/themed';
import { ChevronDown } from 'lucide-react-native';

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
    const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(
      wallets.length > 0 ? wallets[0].id : undefined
    );
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const snapPoints = useMemo(() => ['70%'], []);

    const filteredCategories = useMemo(
      () => categories.filter((c) => c.type === type),
      [categories, type]
    );

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
      if (!selectedWalletId) return;
      if (!selectedCategoryId) return;

      setIsLoading(true);
      try {
        await addTransaction({
          type,
          amount: amountValue,
          walletId: selectedWalletId,
          categoryId: selectedCategoryId,
          note: note.trim() || undefined,
          date: new Date(),
        });
        setAmount('');
        setSelectedCategoryId(undefined);
        setNote('');
        onClose();
      } catch (error) {
        console.error('Failed to add transaction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleTypeChange = (newType: 'expense' | 'income') => {
      setType(newType);
      setSelectedCategoryId(undefined);
    };

    const getWalletName = (id: string | undefined) => {
      if (!id) return '';
      return wallets.find((w) => w.id === id)?.name || '';
    };

    const getCategoryName = (id: string | undefined) => {
      if (!id) return '';
      return categories.find((c) => c.id === id)?.name || '';
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
          <Box flex={1} px="$4" pb="$4">
            <Heading size="md" textAlign="center" mb="$4">
              Add Transaction
            </Heading>

            <HStack space="md" mb="$5" justifyContent="center">
              <Button
                variant={type === 'expense' ? 'solid' : 'outline'}
                action={type === 'expense' ? 'negative' : 'secondary'}
                onPress={() => handleTypeChange('expense')}
                flex={1}
              >
                <ButtonText>Expense</ButtonText>
              </Button>
              <Button
                variant={type === 'income' ? 'solid' : 'outline'}
                action={type === 'income' ? 'positive' : 'secondary'}
                onPress={() => handleTypeChange('income')}
                flex={1}
              >
                <ButtonText>Income</ButtonText>
              </Button>
            </HStack>

            <Input size="xl" variant="underlined" mb="$5" alignItems="center">
              <InputField
                placeholder="0.00"
                value={amount}
                onChangeText={(text) => setAmount(formatAmount(text))}
                keyboardType="decimal-pad"
                textAlign="center"
                fontSize="$3xl"
                fontWeight="$bold"
              />
            </Input>

            <VStack space="md" mb="$4">
              <VStack space="xs">
                <Text size="sm" color="$textLight500">
                  Wallet
                </Text>
                <Select
                  selectedValue={selectedWalletId}
                  onValueChange={setSelectedWalletId}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select wallet" value={getWalletName(selectedWalletId)} />
                    <SelectIcon mr="$3" as={ChevronDown} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} label={wallet.name} value={wallet.id} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

              <VStack space="xs">
                <Text size="sm" color="$textLight500">
                  Category
                </Text>
                <Select
                  selectedValue={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput
                      placeholder="Select category"
                      value={getCategoryName(selectedCategoryId)}
                    />
                    <SelectIcon mr="$3" as={ChevronDown} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} label={category.name} value={category.id} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

              <VStack space="xs">
                <Text size="sm" color="$textLight500">
                  Note (optional)
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Add a note..."
                    value={note}
                    onChangeText={(text) => setNote(text.slice(0, 100))}
                    maxLength={100}
                  />
                </Input>
              </VStack>
            </VStack>

            <Button
              size="lg"
              action={type === 'expense' ? 'negative' : 'positive'}
              onPress={handleSubmit}
              isDisabled={isLoading || !amount || !selectedWalletId || !selectedCategoryId}
              mt="auto"
            >
              <ButtonText>
                {isLoading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
              </ButtonText>
            </Button>
          </Box>
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
  },
});
