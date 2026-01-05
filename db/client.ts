import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const DATABASE_NAME = 'expense-lovers.db';

const expoDb = openDatabaseSync(DATABASE_NAME);

export const db = drizzle(expoDb, { schema });

// SQL to create tables (for initial setup)
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
    amount INTEGER NOT NULL,
    wallet_id TEXT NOT NULL REFERENCES wallets(id),
    category_id TEXT NOT NULL REFERENCES categories(id),
    note TEXT,
    date INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    cycle TEXT NOT NULL CHECK (cycle IN ('daily', 'weekly', 'monthly', 'yearly')),
    wallet_id TEXT NOT NULL REFERENCES wallets(id),
    category_id TEXT NOT NULL REFERENCES categories(id),
    start_date INTEGER NOT NULL,
    next_due_date INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    reminder_days_before INTEGER NOT NULL DEFAULT 1,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_subscriptions_wallet ON subscriptions(wallet_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_next_due ON subscriptions(next_due_date);
`;

export async function initializeDatabase(): Promise<void> {
  const statements = createTablesSQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    expoDb.execSync(statement);
  }

  try {
    expoDb.execSync("ALTER TABLE transactions ADD COLUMN status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending'))");
  } catch {
  }

  try {
    expoDb.execSync("ALTER TABLE transactions ADD COLUMN reminder_date INTEGER");
  } catch {
  }
}

export { schema };
