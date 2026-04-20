import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../types';
import { 
  subscribeToCollection, 
  saveDocument,
  updateDocumentFields
} from '../lib/firebaseSync';

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  isInitialized: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  initializeOrders: () => () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: true,
      isInitialized: false,

      addOrder: async (order) => {
        try {
          await saveDocument('orders', order, order.id);
          // Local state will update via subscription
        } catch (error) {
          console.error('Error adding order:', error);
          // Fallback to local state
          set((state) => ({ orders: [order, ...state.orders] }));
        }
      },

      updateOrderStatus: async (id, status) => {
        try {
          await updateDocumentFields('orders', id, { status });
        } catch (error) {
          console.error('Error updating order status:', error);
          set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, status } : o),
          }));
        }
      },

      updateOrder: async (id, updates) => {
        try {
          await updateDocumentFields('orders', id, updates);
        } catch (error) {
          console.error('Error updating order:', error);
          set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, ...updates } : o),
          }));
        }
      },

      initializeOrders: () => {
        const unsubscribe = subscribeToCollection<Order>(
          { 
            collectionName: 'orders',
            idField: 'id' as keyof Order,
            orderByField: 'createdAt',
            orderDirection: 'desc'
          },
          (orders) => {
            if (orders.length > 0 || !get().isInitialized) {
              set({ orders, isLoading: false, isInitialized: true });
            } else {
              set({ isLoading: false, isInitialized: true });
            }
          },
          (error) => {
            console.error('Order sync error:', error);
            set({ isLoading: false, isInitialized: true });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
