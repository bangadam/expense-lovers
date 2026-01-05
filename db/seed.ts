import { v4 as uuidv4 } from 'uuid';
import { db } from './client';
import { categories } from './schema';

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food', icon: 'fork.knife' },
  { name: 'Transport', icon: 'car.fill' },
  { name: 'Shopping', icon: 'bag.fill' },
  { name: 'Bills', icon: 'doc.text.fill' },
  { name: 'Entertainment', icon: 'gamecontroller.fill' },
  { name: 'Health', icon: 'heart.fill' },
  { name: 'Other', icon: 'ellipsis.circle.fill' },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'briefcase.fill' },
  { name: 'Freelance', icon: 'laptopcomputer' },
  { name: 'Investment', icon: 'chart.line.uptrend.xyaxis' },
  { name: 'Gift', icon: 'gift.fill' },
  { name: 'Other', icon: 'ellipsis.circle.fill' },
];

export async function seedDefaultCategories(): Promise<void> {
  // Check if categories already exist
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length > 0) {
    return; // Already seeded
  }

  const now = new Date();

  const expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
    id: uuidv4(),
    name: cat.name,
    type: 'expense' as const,
    icon: cat.icon,
    isDefault: true,
    createdAt: now,
  }));

  const incomeCategories = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
    id: uuidv4(),
    name: cat.name,
    type: 'income' as const,
    icon: cat.icon,
    isDefault: true,
    createdAt: now,
  }));

  await db.insert(categories).values([...expenseCategories, ...incomeCategories]);
}
