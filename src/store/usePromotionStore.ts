import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Promotion } from '../types';

const defaultPromotions: Promotion[] = [
  {
    id: 'p1',
    code: 'HOANGHA500',
    discountType: 'fixed',
    discountAmount: 500000,
    minOrderValue: 0,
    description: 'Giảm 500.000đ cho đơn hàng',
    isActive: true,
  },
  {
    id: 'p2',
    code: 'APPLE1M',
    discountType: 'fixed',
    discountAmount: 1000000,
    minOrderValue: 0,
    description: 'Giảm 1.000.000đ cho sản phẩm Apple',
    isActive: true,
  }
];

interface PromotionStore {
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => void;
  updatePromotion: (id: string, promo: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  incrementUsedCount: (code: string) => void;
}

export const usePromotionStore = create<PromotionStore>()(
  persist(
    (set) => ({
      promotions: defaultPromotions,
      addPromotion: (promo) => set((state) => ({ promotions: [...state.promotions, promo] })),
      updatePromotion: (id, updatedPromo) =>
        set((state) => ({
          promotions: state.promotions.map((p) => (p.id === id ? { ...p, ...updatedPromo } : p)),
        })),
      deletePromotion: (id) =>
        set((state) => ({ promotions: state.promotions.filter((p) => p.id !== id) })),
      incrementUsedCount: (code) =>
        set((state) => ({
          promotions: state.promotions.map((p) => 
            p.code === code ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p
          ),
        })),
    }),
    {
      name: 'promotion-storage',
    }
  )
);
