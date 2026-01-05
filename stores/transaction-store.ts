import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { transactions, type Transaction, type NewTransaction } from '@/db/schema';
import { useWalletStore } from './wallet-store';

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (data: {
    type: 'income' | 'expense';
    amount: number; // in dollars/currency units
    walletId: string;
    categoryId: string;
    note?: string;
    date?: Date;
  }) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;

  // Getters
  getRecentTransactions: (limit?: number) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true });
    const result = await db.select().from(transactions).orderBy(desc(transactions.date));
    set({ transactions: result, isLoading: false });
  },

  addTransaction: async (data) => {
    const now = new Date();
    const amountInCents = Math.round(data.amount * 100);

    const newTransaction: NewTransaction = {
      id: uuidv4(),
      type: data.type,
      amount: amountInCents,
      walletId: data.walletId,
      categoryId: data.categoryId,
      note: data.note ?? null,
      date: data.date ?? now,
      createdAt: now,
    };

    await db.insert(transactions).values(newTransaction);

    const transaction = {
      ...newTransaction,
      date: data.date ?? now,
      createdAt: now,
    } as Transaction;

    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));

    // Update wallet balance
    await useWalletStore.getState().updateWalletBalance(
      data.walletId,
      amountInCents,
      data.type
    );

    return transaction;
  },

  deleteTransaction: async (id: string) => {
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;

    await db.delete(transactions).where(eq(transactions.id, id));

    // Reverse the wallet balance update
    const reverseType = transaction.type === 'income' ? 'expense' : 'income';
    await useWalletStore.getState().updateWalletBalance(
      transaction.walletId,
      transaction.amount,
      reverseType
    );

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  getRecentTransactions: (limit = 10) => {
    return get().transactions.slice(0, limit);
  },

  getTransactionsByMonth: (year: number, month: number) => {
    return get().transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  },
}));
