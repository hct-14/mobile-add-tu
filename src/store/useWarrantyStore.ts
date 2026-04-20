import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Warranty } from '../types';

interface WarrantyStore {
  warranties: Warranty[];
  addWarranty: (warranty: Warranty) => void;
  updateWarranty: (id: string, warranty: Partial<Warranty>) => void;
  deleteWarranty: (id: string) => void;
}

export const useWarrantyStore = create<WarrantyStore>()(
  persist(
    (set) => ({
      warranties: [],
      addWarranty: (warranty) => set((state) => ({ warranties: [...state.warranties, warranty] })),
      updateWarranty: (id, updatedWarranty) =>
        set((state) => ({
          warranties: state.warranties.map((w) => (w.id === id ? { ...w, ...updatedWarranty } : w)),
        })),
      deleteWarranty: (id) =>
        set((state) => ({ warranties: state.warranties.filter((w) => w.id !== id) })),
    }),
    {
      name: 'warranty-storage',
    }
  )
);
