import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import { subscriptions, type Subscription, type NewSubscription } from '@/db/schema';

type SubscriptionCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface SubscriptionStore {
  subscriptions: Subscription[];
  isLoading: boolean;

  loadSubscriptions: () => Promise<void>;
  addSubscription: (data: {
    name: string;
    amount: number;
    cycle: SubscriptionCycle;
    walletId: string;
    categoryId: string;
    startDate?: Date;
    reminderDaysBefore?: number;
    note?: string;
  }) => Promise<Subscription>;
  updateSubscription: (
    id: string,
    data: Partial<{
      name: string;
      amount: number;
      cycle: SubscriptionCycle;
      walletId: string;
      categoryId: string;
      isActive: boolean;
      reminderDaysBefore: number;
      note: string | null;
    }>
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;

  getActiveSubscriptions: () => Subscription[];
  getUpcomingSubscriptions: (daysAhead: number) => Subscription[];
}

function calculateNextDueDate(currentDueDate: Date, cycle: SubscriptionCycle): Date {
  const next = new Date(currentDueDate);
  switch (cycle) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  isLoading: false,

  loadSubscriptions: async () => {
    set({ isLoading: true });
    const result = await db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.nextDueDate));
    set({ subscriptions: result, isLoading: false });
  },

  addSubscription: async (data) => {
    const now = new Date();
    const amountInCents = Math.round(data.amount * 100);
    const startDate = data.startDate ?? now;

    const newSubscription: NewSubscription = {
      id: uuidv4(),
      name: data.name,
      amount: amountInCents,
      cycle: data.cycle,
      walletId: data.walletId,
      categoryId: data.categoryId,
      startDate,
      nextDueDate: startDate,
      isActive: true,
      reminderDaysBefore: data.reminderDaysBefore ?? 1,
      note: data.note ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(subscriptions).values(newSubscription);

    const subscription = {
      ...newSubscription,
      startDate,
      nextDueDate: startDate,
      createdAt: now,
      updatedAt: now,
    } as Subscription;

    set((state) => ({
      subscriptions: [subscription, ...state.subscriptions],
    }));

    return subscription;
  },

  updateSubscription: async (id, data) => {
    const now = new Date();
    const updateData: Partial<NewSubscription> = { updatedAt: now };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = Math.round(data.amount * 100);
    if (data.cycle !== undefined) updateData.cycle = data.cycle;
    if (data.walletId !== undefined) updateData.walletId = data.walletId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.reminderDaysBefore !== undefined) updateData.reminderDaysBefore = data.reminderDaysBefore;
    if (data.note !== undefined) updateData.note = data.note;

    await db.update(subscriptions).set(updateData).where(eq(subscriptions.id, id));

    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, ...updateData } : s
      ),
    }));
  },

  deleteSubscription: async (id) => {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    }));
  },

  markAsPaid: async (id) => {
    const subscription = get().subscriptions.find((s) => s.id === id);
    if (!subscription) return;

    const now = new Date();
    const nextDueDate = calculateNextDueDate(new Date(subscription.nextDueDate), subscription.cycle);

    await db
      .update(subscriptions)
      .set({ nextDueDate, updatedAt: now })
      .where(eq(subscriptions.id, id));

    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, nextDueDate, updatedAt: now } : s
      ),
    }));
  },

  getActiveSubscriptions: () => {
    return get().subscriptions.filter((s) => s.isActive);
  },

  getUpcomingSubscriptions: (daysAhead: number) => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return get().subscriptions.filter((s) => {
      if (!s.isActive) return false;
      const dueDate = new Date(s.nextDueDate);
      return dueDate <= futureDate;
    });
  },
}));
