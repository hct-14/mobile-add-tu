import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnalyticsStore {
  pageViews: number;
  productViews: Record<string, number>;
  productOrders: Record<string, number>;
  dailyViews: Record<string, number>;
  incrementPageView: () => void;
  incrementProductView: (productId: string) => void;
  incrementProductOrder: (productId: string, quantity: number) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      pageViews: 0,
      productViews: {},
      productOrders: {},
      dailyViews: {},
      incrementPageView: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        return { 
          pageViews: state.pageViews + 1,
          dailyViews: {
            ...state.dailyViews,
            [today]: (state.dailyViews[today] || 0) + 1
          }
        };
      }),
      incrementProductView: (productId) => set((state) => ({
        productViews: {
          ...state.productViews,
          [productId]: (state.productViews[productId] || 0) + 1
        }
      })),
      incrementProductOrder: (productId, quantity) => set((state) => ({
        productOrders: {
          ...state.productOrders,
          [productId]: (state.productOrders[productId] || 0) + quantity
        }
      })),
    }),
    {
      name: 'analytics-storage',
    }
  )
);
