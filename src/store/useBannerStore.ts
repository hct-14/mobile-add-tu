import { create } from 'zustand';
import { Banner } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface BannerStore {
  banners: Banner[];
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  addBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  subscribeBanners: () => () => void;
}

export const useBannerStore = create<BannerStore>()((set) => ({
  banners: [],
  updateBanner: async (id, updatedBanner) => {
    try {
      await updateDoc(doc(db, 'banners', id), updatedBanner as any);
      toast.success('Cập nhật banner thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật banner:', error);
      toast.error('Có lỗi xảy ra khi cập nhật banner');
    }
  },
  addBanner: async (banner) => {
    try {
      if (!banner.id) {
        banner.id = Date.now().toString();
      }
      await setDoc(doc(db, 'banners', banner.id), banner);
      toast.success('Thêm banner thành công');
    } catch (error) {
      console.error('Lỗi khi thêm banner:', error);
      toast.error('Có lỗi xảy ra khi thêm banner');
    }
  },
  deleteBanner: async (id) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success('Xóa banner thành công');
    } catch (error) {
      console.error('Lỗi khi xóa banner:', error);
      toast.error('Có lỗi xảy ra khi xóa banner');
    }
  },
  subscribeBanners: () => {
    const unsub = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const bannersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      set({ banners: bannersData });
    }, (error) => {
      console.error('Error fetching banners:', error);
    });
    return unsub;
  }
}));
