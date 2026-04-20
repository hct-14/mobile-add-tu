import { create } from 'zustand';
import { Product, Review } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { mockProducts } from '../data/mockProducts';

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReview: (productId: string, review: Review) => Promise<void>;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;
  subscribeProducts: () => () => void;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  setProducts: (products) => set({ products }),
  
  addProduct: async (product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      // set is handled by onSnapshot
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi thêm sản phẩm');
    }
  },
  
  updateProduct: async (id, updatedProduct) => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedProduct as any);
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm');
    }
  },
  
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xoá sản phẩm');
    }
  },
  
  addReview: async (productId, review) => {
    try {
      const product = get().products.find(p => p.id === productId);
      if (!product) return;
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, {
        reviews: [...(product.reviews || []), review]
      });
    } catch (error) {
      console.error(error);
    }
  },
  
  deleteReview: async (productId, reviewId) => {
    try {
      const product = get().products.find(p => p.id === productId);
      if (!product) return;
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, {
        reviews: (product.reviews || []).filter(r => r.id !== reviewId)
      });
    } catch (error) {
      console.error(error);
    }
  },
  
  subscribeProducts: () => {
    const q = collection(db, 'products');
    let isInitialLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      if (isInitialLoad && prods.length === 0) {
        mockProducts.forEach(async (p) => {
          try {
            await setDoc(doc(db, 'products', p.id), p);
          } catch(e) {
            console.error('Failed to seed:', e);
          }
        });
      }
      isInitialLoad = false;
      
      if (prods.length > 0 || !isInitialLoad) {
        set({ products: prods });
      } else {
        set({ products: mockProducts });
      }
    }, (error) => {
      console.error('Lỗi khi lắng nghe sản phẩm', error);
    });
    return unsubscribe;
  }
}));
