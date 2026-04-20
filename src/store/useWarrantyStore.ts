import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Warranty } from '../types';
import { 
  subscribeToCollection, 
  saveDocument, 
  deleteDocument,
  updateDocumentFields
} from '../lib/firebaseSync';

interface WarrantyStore {
  warranties: Warranty[];
  isLoading: boolean;
  isInitialized: boolean;
  addWarranty: (warranty: Warranty) => Promise<void>;
  updateWarranty: (id: string, warranty: Partial<Warranty>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;
  initializeWarranties: () => () => void;
}

export const useWarrantyStore = create<WarrantyStore>()(
  persist(
    (set, get) => ({
      warranties: [],
      isLoading: true,
      isInitialized: false,

      addWarranty: async (warranty) => {
        try {
          await saveDocument('warranties', warranty, warranty.id);
        } catch (error) {
          console.error('Error adding warranty:', error);
          set((state) => ({ warranties: [...state.warranties, warranty] }));
        }
      },

      updateWarranty: async (id, updatedWarranty) => {
        try {
          await updateDocumentFields('warranties', id, updatedWarranty);
        } catch (error) {
          console.error('Error updating warranty:', error);
          set((state) => ({
            warranties: state.warranties.map((w) => w.id === id ? { ...w, ...updatedWarranty } : w),
          }));
        }
      },

      deleteWarranty: async (id) => {
        try {
          await deleteDocument('warranties', id);
        } catch (error) {
          console.error('Error deleting warranty:', error);
          set((state) => ({
            warranties: state.warranties.filter((w) => w.id !== id),
          }));
        }
      },

      initializeWarranties: () => {
        const unsubscribe = subscribeToCollection<Warranty>(
          { 
            collectionName: 'warranties',
            idField: 'id' as keyof Warranty,
            orderByField: 'createdAt',
            orderDirection: 'desc'
          },
          (warranties) => {
            if (warranties.length > 0 || !get().isInitialized) {
              set({ warranties, isLoading: false, isInitialized: true });
            } else {
              set({ isLoading: false, isInitialized: true });
            }
          },
          (error) => {
            console.error('Warranty sync error:', error);
            set({ isLoading: false, isInitialized: true });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'warranty-storage',
      partialize: (state) => ({ warranties: state.warranties }),
    }
  )
);
