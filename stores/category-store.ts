import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories, type Category, type NewCategory } from '@/db/schema';

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;

  // Actions
  loadCategories: () => Promise<void>;
  addCategory: (name: string, type: 'income' | 'expense', icon?: string) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Getters
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    const result = await db.select().from(categories);
    set({ categories: result, isLoading: false });
  },

  addCategory: async (name: string, type: 'income' | 'expense', icon?: string) => {
    const now = new Date();
    const newCategory: NewCategory = {
      id: uuidv4(),
      name,
      type,
      icon: icon ?? null,
      isDefault: false,
      createdAt: now,
    };

    await db.insert(categories).values(newCategory);
    const category = { ...newCategory, createdAt: now } as Category;
    set((state) => ({ categories: [...state.categories, category] }));
    return category;
  },

  updateCategory: async (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => {
    await db.update(categories).set(updates).where(eq(categories.id, id));
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  deleteCategory: async (id: string) => {
    // Only allow deleting non-default categories
    const category = get().categories.find((c) => c.id === id);
    if (category?.isDefault) {
      throw new Error('Cannot delete default category');
    }

    await db.delete(categories).where(eq(categories.id, id));
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  getCategoriesByType: (type: 'income' | 'expense') => {
    return get().categories.filter((c) => c.type === type);
  },
}));
