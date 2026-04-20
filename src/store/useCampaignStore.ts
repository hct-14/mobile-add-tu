import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign } from '../types';

interface CampaignStore {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getActiveCampaign: () => Campaign | undefined;
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [
        {
          id: '1',
          name: 'Flash Sale Cuối Tuần',
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          products: [
            { productId: '1', flashSalePrice: 20000000 },
            { productId: '2', flashSalePrice: 25000000 },
            { productId: '3', flashSalePrice: 15000000 },
          ]
        }
      ],
      addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      updateCampaign: (id, campaign) => set((state) => ({
        campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...campaign } : c)),
      })),
      deleteCampaign: (id) => set((state) => ({
        campaigns: state.campaigns.filter((c) => c.id !== id),
      })),
      getActiveCampaign: () => {
        const { campaigns } = get();
        return campaigns.find(c => c.isActive && new Date(c.endDate) > new Date());
      }
    }),
    {
      name: 'campaign-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Force reset to show flash sale today
          persistedState.campaigns = [
            {
              id: '1',
              name: 'Giá Sốc Hôm Nay',
              endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              products: [
                { productId: '1', flashSalePrice: 19990000 },
                { productId: '2', flashSalePrice: 23990000 },
                { productId: '3', flashSalePrice: 13990000 },
              ]
            }
          ];
        }
        return persistedState as CampaignStore;
      }
    }
  )
);
