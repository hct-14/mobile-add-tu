import { create } from 'zustand';
import { Category } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { firestoreCache } from '../lib/firestoreCache';

// Initialize categories from cache synchronously for instant load
const getInitialCategories = (): { categories: Category[]; isLoading: boolean } => {
  const cached = firestoreCache.getSync<Category[]>('categories');
  return {
    categories: cached || [],
    isLoading: !cached || cached.length === 0
  };
};

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  subscribeCategories: () => () => void;
}

const initialState = getInitialCategories();

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: initialState.categories,
  isLoading: initialState.isLoading,
  addCategory: async (category) => {
    try {
      if (!category.id) {
        category.id = Date.now().toString();
      }
      await setDoc(doc(db, 'categories', category.id), category);
      toast.success('Thêm danh mục thành công');
      // Invalidate cache
      firestoreCache.clearCollection('categories');
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      toast.error('Có lỗi xảy ra khi thêm danh mục');
    }
  },
  updateCategory: async (id, category) => {
    try {
      await updateDoc(doc(db, 'categories', id), category as any);
      toast.success('Cập nhật danh mục thành công');
      // Invalidate cache
      firestoreCache.clearCollection('categories');
    } catch (error) {
      console.error('Lỗi cập nhật danh mục:', error);
      toast.error('Có lỗi xảy ra khi cập nhật danh mục');
    }
  },
  deleteCategory: async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Xóa danh mục thành công');
      // Invalidate cache
      firestoreCache.clearCollection('categories');
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      toast.error('Có lỗi xảy ra khi xóa danh mục');
    }
  },
  subscribeCategories: () => {
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      set({ categories: categoriesData, isLoading: false });
      // Update cache
      firestoreCache.set('categories', categoriesData, 60 * 60 * 1000); // 1 hour TTL
    }, (error) => {
      console.error('Error fetching categories:', error);
      set({ isLoading: false });
    });
    return unsub;
  }
}));
