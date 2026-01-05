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
    status?: 'paid' | 'pending';
    amount: number; // in dollars/currency units
    walletId: string;
    categoryId: string;
    note?: string;
    date?: Date;
  }) => Promise<Transaction>;
  updateTransactionStatus: (id: string, status: 'paid' | 'pending') => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Getters
  getRecentTransactions: (limit?: number) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getPendingTransactions: () => Transaction[];
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
      status: data.status ?? 'paid',
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

    if (data.status !== 'pending') {
      await useWalletStore.getState().updateWalletBalance(
        data.walletId,
        amountInCents,
        data.type
      );
    }

    return transaction;
  },

  updateTransactionStatus: async (id: string, status: 'paid' | 'pending') => {
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;

    const oldStatus = transaction.status;
    if (oldStatus === status) return;

    await db.update(transactions).set({ status }).where(eq(transactions.id, id));

    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    }));

    const pendingToPaid = oldStatus === 'pending' && status === 'paid';
    const paidToPending = oldStatus === 'paid' && status === 'pending';

    if (pendingToPaid) {
      await useWalletStore.getState().updateWalletBalance(
        transaction.walletId,
        transaction.amount,
        transaction.type
      );
    } else if (paidToPending) {
      const reverseType = transaction.type === 'income' ? 'expense' : 'income';
      await useWalletStore.getState().updateWalletBalance(
        transaction.walletId,
        transaction.amount,
        reverseType
      );
    }
  },

  deleteTransaction: async (id: string) => {
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;

    await db.delete(transactions).where(eq(transactions.id, id));

    if (transaction.status === 'paid') {
      const reverseType = transaction.type === 'income' ? 'expense' : 'income';
      await useWalletStore.getState().updateWalletBalance(
        transaction.walletId,
        transaction.amount,
        reverseType
      );
    }

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

  getPendingTransactions: () => {
    return get().transactions.filter((t) => t.status === 'pending');
  },
}));
