import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { wallets, type Wallet, type NewWallet } from '@/db/schema';

interface WalletStore {
  wallets: Wallet[];
  isLoading: boolean;

  // Actions
  loadWallets: () => Promise<void>;
  addWallet: (name: string, initialBalance: number) => Promise<Wallet>;
  updateWallet: (id: string, updates: Partial<Pick<Wallet, 'name' | 'balance'>>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  updateWalletBalance: (id: string, amount: number, type: 'income' | 'expense') => Promise<void>;

  // Computed
  getTotalAssets: () => number;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  isLoading: false,

  loadWallets: async () => {
    set({ isLoading: true });
    const result = await db.select().from(wallets);
    set({ wallets: result, isLoading: false });
  },

  addWallet: async (name: string, initialBalance: number) => {
    const now = new Date();
    const newWallet: NewWallet = {
      id: uuidv4(),
      name,
      balance: Math.round(initialBalance * 100), // Convert to cents
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(wallets).values(newWallet);
    const wallet = { ...newWallet, createdAt: now, updatedAt: now } as Wallet;
    set((state) => ({ wallets: [...state.wallets, wallet] }));
    return wallet;
  },

  updateWallet: async (id: string, updates: Partial<Pick<Wallet, 'name' | 'balance'>>) => {
    const now = new Date();
    await db
      .update(wallets)
      .set({ ...updates, updatedAt: now })
      .where(eq(wallets.id, id));

    set((state) => ({
      wallets: state.wallets.map((w) =>
        w.id === id ? { ...w, ...updates, updatedAt: now } : w
      ),
    }));
  },

  deleteWallet: async (id: string) => {
    await db.delete(wallets).where(eq(wallets.id, id));
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
    }));
  },

  updateWalletBalance: async (id: string, amount: number, type: 'income' | 'expense') => {
    const wallet = get().wallets.find((w) => w.id === id);
    if (!wallet) return;

    const delta = type === 'income' ? amount : -amount;
    const newBalance = wallet.balance + delta;

    await get().updateWallet(id, { balance: newBalance });
  },

  getTotalAssets: () => {
    return get().wallets.reduce((sum, w) => sum + w.balance, 0);
  },
}));
