import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Review } from '../types';
import { mockProducts } from '../data/mockProducts';

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: Review) => void;
  deleteReview: (productId: string, reviewId: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: mockProducts,
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updatedProduct) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)),
        })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      addReview: (productId, review) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, reviews: [...(p.reviews || []), review] }
              : p
          ),
        })),
      deleteReview: (productId, reviewId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, reviews: (p.reviews || []).filter(r => r.id !== reviewId) }
              : p
          ),
        })),
    }),
    {
      name: 'product-storage',
    }
  )
);
