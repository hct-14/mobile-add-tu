import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '../types';
import { 
  subscribeToCollection, 
  saveDocument, 
  deleteDocument,
  seedCollectionIfEmpty 
} from '../lib/firebaseSync';

const defaultCategories: Category[] = [
  { id: '1', name: 'Điện thoại', slug: 'dien-thoai', icon: '📱' },
  { id: '2', name: 'Laptop', slug: 'laptop', icon: '💻' },
  { id: '3', name: 'Tablet', slug: 'tablet', icon: '📋' },
  { id: '4', name: 'Phụ kiện', slug: 'phu-kien', icon: '🎧' },
  { id: '5', name: 'Hàng cũ', slug: 'hang-cu', icon: '🔄' },
];

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  isInitialized: boolean;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  initializeCategories: () => () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      isLoading: true,
      isInitialized: false,

      addCategory: async (category) => {
        try {
          await saveDocument('categories', category, category.id);
        } catch (error) {
          console.error('Error adding category:', error);
          set((state) => ({ categories: [...state.categories, category] }));
        }
      },

      updateCategory: async (id, category) => {
        try {
          await saveDocument('categories', category, id);
        } catch (error) {
          console.error('Error updating category:', error);
          set((state) => ({
            categories: state.categories.map((c) => c.id === id ? category : c),
          }));
        }
      },

      deleteCategory: async (id) => {
        try {
          await deleteDocument('categories', id);
        } catch (error) {
          console.error('Error deleting category:', error);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        }
      },

      initializeCategories: () => {
        seedCollectionIfEmpty('categories', defaultCategories, 'id').catch(console.error);

        const unsubscribe = subscribeToCollection<Category>(
          { collectionName: 'categories', idField: 'id' as keyof Category },
          (cats) => {
            if (cats.length > 0) {
              set({ categories: cats, isLoading: false, isInitialized: true });
            } else if (!get().isInitialized) {
              set({ isLoading: false, isInitialized: true });
            }
          },
          (error) => {
            console.error('Category sync error:', error);
            set({ isLoading: false, isInitialized: true });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'category-storage',
      partialize: (state) => ({ categories: state.categories }),
    }
  )
);
