import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc, gte } from 'drizzle-orm';
import { db } from '@/db/client';
import { subscriptions, type Subscription, type NewSubscription } from '@/db/schema';
import * as Notifications from 'expo-notifications';
import { useWalletStore } from './wallet-store';

interface SubscriptionStore {
  subscriptions: Subscription[];
  isLoading: boolean;

  // Actions
  loadSubscriptions: () => Promise<void>;
  addSubscription: (data: {
    name: string;
    amount: number;
    cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
    walletId: string;
    categoryId: string;
    startDate?: Date;
    reminderDaysBefore?: number;
    note?: string;
  }) => Promise<Subscription>;
  updateSubscription: (id: string, data: Partial<NewSubscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  // Notification scheduling
  scheduleSubscriptionReminders: (subscription: Subscription) => Promise<void>;
  cancelSubscriptionReminders: (id: string) => Promise<void>;
  checkAndSendReminders: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  isLoading: false,

  loadSubscriptions: async () => {
    set({ isLoading: true });
    const result = await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
    set({ subscriptions: result, isLoading: false });
  },

  addSubscription: async (data) => {
    const now = new Date();
    const startDate = data.startDate || now;

    const newSubscription: NewSubscription = {
      id: uuidv4(),
      name: data.name,
      amount: Math.round(data.amount * 100), // Store in cents
      cycle: data.cycle,
      walletId: data.walletId,
      categoryId: data.categoryId,
      startDate,
      nextDueDate: calculateNextDueDate(startDate, data.cycle),
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
      nextDueDate: calculateNextDueDate(startDate, data.cycle),
      createdAt: now,
      updatedAt: now,
    } as Subscription;

    set((state) => ({
      subscriptions: [subscription, ...state.subscriptions],
    }));

    // Schedule reminders
    await get().scheduleSubscriptionReminders(subscription);

    return subscription;
  },

  updateSubscription: async (id: string, data) => {
    await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));

    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));

    // Re-schedule reminders if needed
    const updatedSubscription = get().subscriptions.find((s) => s.id === id);
    if (updatedSubscription) {
      await get().cancelSubscriptionReminders(id);
      if (updatedSubscription.isActive) {
        await get().scheduleSubscriptionReminders(updatedSubscription);
      }
    }
  },

  deleteSubscription: async (id: string) => {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));

    // Cancel reminders
    await get().cancelSubscriptionReminders(id);

    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    }));
  },

  scheduleSubscriptionReminders: async (subscription: Subscription) => {
    if (!subscription.isActive) return;

    const reminderDate = new Date(subscription.nextDueDate);
    reminderDate.setDate(reminderDate.getDate() - subscription.reminderDaysBefore);

    // Only schedule if reminder is in the future
    if (reminderDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Subscription Reminder: ${subscription.name}`,
          body: `${subscription.name} is due in ${subscription.reminderDaysBefore} day(s). Amount: $${(subscription.amount / 100).toFixed(2)}`,
          sound: 'default',
        },
        trigger: reminderDate,
        identifier: `subscription-${subscription.id}`,
      });
    }
  },

  cancelSubscriptionReminders: async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(`subscription-${id}`);
  },

  checkAndSendReminders: async () => {
    const subscriptions = get().subscriptions;
    const now = new Date();

    for (const subscription of subscriptions) {
      if (!subscription.isActive) continue;

      const reminderDate = new Date(subscription.nextDueDate);
      reminderDate.setDate(reminderDate.getDate() - subscription.reminderDaysBefore);

      if (reminderDate <= now && reminderDate > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        // Send immediate notification
        await Notifications.presentNotificationAsync({
          title: `Subscription Due Soon: ${subscription.name}`,
          body: `${subscription.name} is due today or tomorrow. Amount: $${(subscription.amount / 100).toFixed(2)}`,
          sound: 'default',
        });

        // Update next due date
        const nextDueDate = calculateNextDueDate(subscription.nextDueDate, subscription.cycle);
        await get().updateSubscription(subscription.id, { nextDueDate });
      }
    }
  },
}));

// Helper function to calculate next due date
function calculateNextDueDate(currentDueDate: Date, cycle: string): Date {
  const nextDue = new Date(currentDueDate);

  switch (cycle) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
  }

  return nextDue;
}

// Initialize notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});