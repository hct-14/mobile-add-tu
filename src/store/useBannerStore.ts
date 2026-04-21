import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Banner } from '../types';

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
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  addBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
}

export const useBannerStore = create<BannerStore>()(
  persist(
    (set) => ({
      banners: defaultBanners,
      updateBanner: (id, updatedBanner) =>
        set((state) => ({
          banners: state.banners.map((b) => (b.id === id ? { ...b, ...updatedBanner } : b)),
        })),
      addBanner: (banner) =>
        set((state) => ({
          banners: [...state.banners, banner],
        })),
      deleteBanner: (id) =>
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'banner-storage',
    }
  )
);
