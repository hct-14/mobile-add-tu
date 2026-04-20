import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Promotion } from '../types';
import { 
  subscribeToCollection, 
  saveDocument, 
  deleteDocument,
  updateDocumentFields,
  seedCollectionIfEmpty 
} from '../lib/firebaseSync';

const defaultPromotions: Promotion[] = [
  {
    id: 'p1',
    code: 'HOANGHA500',
    discountType: 'fixed',
    discountAmount: 500000,
    minOrderValue: 0,
    description: 'Giảm 500.000đ cho đơn hàng',
    isActive: true,
    applicableToAll: true,
  },
  {
    id: 'p2',
    code: 'APPLE1M',
    discountType: 'fixed',
    discountAmount: 1000000,
    minOrderValue: 0,
    description: 'Giảm 1.000.000đ cho sản phẩm Apple',
    isActive: true,
    applicableToAll: true,
  }
];

interface PromotionStore {
  promotions: Promotion[];
  isLoading: boolean;
  isInitialized: boolean;
  addPromotion: (promo: Promotion) => Promise<void>;
  updatePromotion: (id: string, promo: Partial<Promotion>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  incrementUsedCount: (code: string) => void;
  initializePromotions: () => () => void;
}

export const usePromotionStore = create<PromotionStore>()(
  persist(
    (set, get) => ({
      promotions: defaultPromotions,
      isLoading: true,
      isInitialized: false,

      addPromotion: async (promo) => {
        try {
          await saveDocument('promotions', promo, promo.id);
          // UI will update automatically via subscription
        } catch (error) {
          console.error('Error adding promotion:', error);
          // Fallback to local state
          set((state) => ({ promotions: [...state.promotions, promo] }));
        }
      },

      updatePromotion: async (id, updatedPromo) => {
        try {
          await updateDocumentFields('promotions', id, updatedPromo);
          // UI will update automatically via subscription
        } catch (error) {
          console.error('Error updating promotion:', error);
          // Fallback to local state
          set((state) => ({
            promotions: state.promotions.map((p) => 
              p.id === id ? { ...p, ...updatedPromo } : p
            ),
          }));
        }
      },

      deletePromotion: async (id) => {
        try {
          await deleteDocument('promotions', id);
          // UI will update automatically via subscription
        } catch (error) {
          console.error('Error deleting promotion:', error);
          // Fallback to local state
          set((state) => ({
            promotions: state.promotions.filter((p) => p.id !== id),
          }));
        }
      },

      incrementUsedCount: (code) => {
        const promo = get().promotions.find(p => p.code === code);
        if (promo) {
          // Update locally first
          set((state) => ({
            promotions: state.promotions.map((p) => 
              p.code === code ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p
            ),
          }));
          // Then sync to Firestore
          updateDocumentFields('promotions', promo.id, { 
            usedCount: (promo.usedCount || 0) + 1 
          }).catch(console.error);
        }
      },

      initializePromotions: () => {
        // Seed default data if empty
        seedCollectionIfEmpty('promotions', defaultPromotions, 'id').catch(console.error);

        // Subscribe to real-time updates
        const unsubscribe = subscribeToCollection<Promotion>(
          {
            collectionName: 'promotions',
            idField: 'id' as keyof Promotion,
          },
          (promos) => {
            if (promos.length > 0) {
              set({ promotions: promos, isLoading: false, isInitialized: true });
            } else if (!get().isInitialized) {
              // Use defaults if no data in Firestore
              set({ isLoading: false, isInitialized: true });
            }
          },
          (error) => {
            console.error('Promotion sync error:', error);
            set({ isLoading: false, isInitialized: true });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'promotion-storage',
      partialize: (state) => ({ promotions: state.promotions }),
    }
  )
);
