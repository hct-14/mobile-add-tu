import { create } from 'zustand';
import { Product, Review } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { firestoreCache } from '../lib/firestoreCache';

// Initialize products from cache synchronously for instant load
const getInitialProducts = (): { products: Product[]; isLoading: boolean } => {
  const cachedProducts = firestoreCache.getSync<Product[]>('products');
  return {
    products: cachedProducts || [],
    isLoading: !cachedProducts || cachedProducts.length === 0
  };
};

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReview: (productId: string, review: Review) => Promise<void>;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;
  subscribeProducts: () => () => void;
}

const initialState = getInitialProducts();

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: initialState.products,
  isLoading: initialState.isLoading,
  setProducts: (products) => {
    set({ products });
    // Cache products for faster subsequent loads
    firestoreCache.set('products', products, 30 * 60 * 1000); // 30 min TTL
  },
  
  addProduct: async (product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      // Invalidate cache
      firestoreCache.clearCollection('products');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi thêm sản phẩm');
    }
  },
  
  updateProduct: async (id, updatedProduct) => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedProduct as any);
      // Invalidate cache
      firestoreCache.clearCollection('products');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm');
    }
  },
  
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      // Invalidate cache
      firestoreCache.clearCollection('products');
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
    // Check cache first for instant load
    const cachedProducts = firestoreCache.get<Product[]>('products');
    if (cachedProducts && cachedProducts.length > 0) {
      set({ products: cachedProducts, isLoading: false });
    }

    const q = collection(db, 'products');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      set({ products: prods, isLoading: false });
      // Update cache
      firestoreCache.set('products', prods, 30 * 60 * 1000);
    }, (error) => {
      console.error('Lỗi khi lắng nghe sản phẩm', error);
      // On error, use cached data if available
      const cached = firestoreCache.get<Product[]>('products');
      set({ products: cached || [], isLoading: false });
    });
    return unsubscribe;
  }
}));
