import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface CompareStore {
  compareItems: Product[];
  compareCategory: string | null;
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareItems: [],
      compareCategory: null,
      addToCompare: (product) => {
        const state = get();
        if (state.compareItems.length >= 3) {
          alert('Chỉ có thể so sánh tối đa 3 sản phẩm');
          return false;
        }
        if (state.compareItems.find(p => p.id === product.id)) {
          return true; // Already added
        }
        if (state.compareItems.length > 0 && state.compareCategory !== product.category) {
          alert('Chỉ có thể so sánh các sản phẩm cùng loại (ví dụ: điện thoại với điện thoại).');
          return false;
        }
        
        set({ 
          compareItems: [...state.compareItems, product],
          compareCategory: product.category
        });
        return true;
      },
      removeFromCompare: (productId) => set((state) => {
        const newItems = state.compareItems.filter(p => p.id !== productId);
        return {
          compareItems: newItems,
          compareCategory: newItems.length === 0 ? null : state.compareCategory
        };
      }),
      clearCompare: () => set({ compareItems: [], compareCategory: null })
    }),
    {
      name: 'compare-storage',
    }
  )
);
