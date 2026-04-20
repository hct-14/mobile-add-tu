import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CouponState {
  appliedCoupon: {
    code: string;
    discount: number;
  } | null;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set) => ({
      appliedCoupon: null,
      setCoupon: (code, discount) => set({ appliedCoupon: { code, discount } }),
      clearCoupon: () => set({ appliedCoupon: null }),
    }),
    {
      name: 'coupon-storage',
    }
  )
);
