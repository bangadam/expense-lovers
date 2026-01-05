import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const wallets = sqliteTable('wallets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  balance: integer('balance').notNull().default(0), // stored in cents
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  icon: text('icon'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  status: text('status', { enum: ['paid', 'pending'] }).notNull().default('paid'),
  amount: integer('amount').notNull(), // stored in cents, always positive
  walletId: text('wallet_id')
    .notNull()
    .references(() => wallets.id),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  note: text('note'),
  date: integer('date', { mode: 'timestamp_ms' }).notNull(),
  reminderDate: integer('reminder_date', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: integer('amount').notNull(), // stored in cents
  cycle: text('cycle', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  walletId: text('wallet_id')
    .notNull()
    .references(() => wallets.id),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  startDate: integer('start_date', { mode: 'timestamp_ms' }).notNull(),
  nextDueDate: integer('next_due_date', { mode: 'timestamp_ms' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  reminderDaysBefore: integer('reminder_days_before').notNull().default(1),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

// Type exports for use in stores
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
