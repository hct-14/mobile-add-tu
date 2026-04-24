import { create } from 'zustand';
import { Promotion } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, increment } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { firestoreCache } from '../lib/firestoreCache';

interface PromotionStore {
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => Promise<void>;
  updatePromotion: (id: string, promo: Partial<Promotion>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  incrementUsedCount: (id: string) => Promise<void>;
  subscribePromotions: () => () => void;
}

// Initialize promotions from cache synchronously for instant load
const getInitialPromotions = (): Promotion[] => {
  return firestoreCache.getSync<Promotion[]>('promotions') || [];
};

export const usePromotionStore = create<PromotionStore>()((set) => ({
  promotions: getInitialPromotions(),
  addPromotion: async (promo) => {
    try {
      if (!promo.id) {
        promo.id = Date.now().toString();
      }
      await setDoc(doc(db, 'promotions', promo.id), promo);
      toast.success('Thêm mã khuyến mãi thành công');
    } catch (error) {
      console.error('Lỗi khi thêm mã khuyến mãi:', error);
      toast.error('Có lỗi xảy ra khi thêm mã khuyến mãi');
    }
  },
  updatePromotion: async (id, updatedPromo) => {
    try {
      await updateDoc(doc(db, 'promotions', id), updatedPromo as any);
      toast.success('Cập nhật mã khuyến mãi thành công');
    } catch (error) {
      console.error('Lỗi cập nhật mã khuyến mãi:', error);
      toast.error('Có lỗi xảy ra khi cập nhật mã khuyến mãi');
    }
  },
  deletePromotion: async (id) => {
    try {
      await deleteDoc(doc(db, 'promotions', id));
      toast.success('Xóa mã khuyến mãi thành công');
    } catch (error) {
      console.error('Lỗi xóa mã khuyến mãi:', error);
      toast.error('Có lỗi xảy ra khi xóa mã khuyến mãi');
    }
  },
  incrementUsedCount: async (id) => {
    try {
      await updateDoc(doc(db, 'promotions', id), {
        usedCount: increment(1)
      });
    } catch (error) {
      console.error('Lỗi cập nhật số lần sử dụng mã:', error);
    }
  },
  subscribePromotions: () => {
    const unsub = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      const promotionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
      set({ promotions: promotionsData });
      firestoreCache.set('promotions', promotionsData, 30 * 60 * 1000); // 30 min TTL
    }, (error) => {
      console.error('Error fetching promotions:', error);
    });
    return unsub;
  }
}));
