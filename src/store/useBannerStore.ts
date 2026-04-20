import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Banner } from '../types';
import { 
  subscribeToCollection, 
  saveDocument, 
  deleteDocument,
  seedCollectionIfEmpty 
} from '../lib/firebaseSync';

const defaultBanners: Banner[] = [
  {
    id: 'b1',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200',
    link: '/category/apple',
    title: 'Đại Tiệc Công Nghệ',
    subtitle: 'Giảm giá lên đến 50% cho các sản phẩm Apple',
    type: 'hero'
  },
  {
    id: 'b2',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    link: '/category/dien-thoai',
    title: 'Smartphone Mới',
    subtitle: 'Ưu đãi ngập tràn',
    type: 'sub'
  },
  {
    id: 'b3',
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600',
    link: '/category/laptop',
    title: 'Laptop Tựu Trường',
    subtitle: 'Giảm thêm 5%',
    type: 'sub'
  }
];

interface BannerStore {
  banners: Banner[];
  isLoading: boolean;
  isInitialized: boolean;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  addBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  initializeBanners: () => () => void;
}

export const useBannerStore = create<BannerStore>()(
  persist(
    (set, get) => ({
      banners: defaultBanners,
      isLoading: true,
      isInitialized: false,

      updateBanner: async (id, updatedBanner) => {
        const banner = get().banners.find(b => b.id === id);
        if (!banner) return;
        try {
          await saveDocument('banners', { ...banner, ...updatedBanner }, id);
        } catch (error) {
          console.error('Error updating banner:', error);
          set((state) => ({
            banners: state.banners.map((b) => b.id === id ? { ...b, ...updatedBanner } : b),
          }));
        }
      },

      addBanner: async (banner) => {
        try {
          await saveDocument('banners', banner, banner.id);
        } catch (error) {
          console.error('Error adding banner:', error);
          set((state) => ({
            banners: [...state.banners, banner],
          }));
        }
      },

      deleteBanner: async (id) => {
        try {
          await deleteDocument('banners', id);
        } catch (error) {
          console.error('Error deleting banner:', error);
          set((state) => ({
            banners: state.banners.filter((b) => b.id !== id),
          }));
        }
      },

      initializeBanners: () => {
        seedCollectionIfEmpty('banners', defaultBanners, 'id').catch(console.error);

        const unsubscribe = subscribeToCollection<Banner>(
          { collectionName: 'banners', idField: 'id' as keyof Banner },
          (banners) => {
            if (banners.length > 0) {
              set({ banners, isLoading: false, isInitialized: true });
            } else if (!get().isInitialized) {
              set({ isLoading: false, isInitialized: true });
            }
          },
          (error) => {
            console.error('Banner sync error:', error);
            set({ isLoading: false, isInitialized: true });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'banner-storage',
      partialize: (state) => ({ banners: state.banners }),
    }
  )
);
