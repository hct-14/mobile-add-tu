import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '../types';

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Category) => void;
  deleteCategory: (id: string) => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Điện thoại', slug: 'dien-thoai', icon: '📱' },
  { id: '2', name: 'Laptop', slug: 'laptop', icon: '💻' },
  { id: '3', name: 'Tablet', slug: 'tablet', icon: '📋' },
  { id: '4', name: 'Phụ kiện', slug: 'phu-kien', icon: '🎧' },
  { id: '5', name: 'Hàng cũ', slug: 'hang-cu', icon: '🔄' },
];

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? category : c)),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'category-storage',
    }
  )
);
