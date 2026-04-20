import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.variant.id === variant.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.variant.id === variant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, { product, variant, quantity }] };
        });
      },
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variant.id === variantId)
          ),
        }));
      },
      updateQuantity: (productId, variantId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.variant.id === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.variant.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
