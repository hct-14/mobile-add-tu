import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign } from '../types';
import { 
  subscribeToCollection, 
  saveDocument, 
  deleteDocument,
  seedCollectionIfEmpty 
} from '../lib/firebaseSync';

const defaultCampaigns: Campaign[] = [
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
];

interface CampaignStore {
  campaigns: Campaign[];
  isLoading: boolean;
  isInitialized: boolean;
  addCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  getActiveCampaign: () => Campaign | undefined;
  initializeCampaigns: () => () => void;
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: defaultCampaigns,
      isLoading: true,
      isInitialized: false,

      addCampaign: async (campaign) => {
        try {
          await saveDocument('campaigns', campaign, campaign.id);
        } catch (error) {
          console.error('Error adding campaign:', error);
          set((state) => ({ campaigns: [...state.campaigns, campaign] }));
        }
      },

      updateCampaign: async (id, updatedCampaign) => {
        const campaign = get().campaigns.find(c => c.id === id);
        if (!campaign) return;
        try {
          await saveDocument('campaigns', { ...campaign, ...updatedCampaign }, id);
        } catch (error) {
          console.error('Error updating campaign:', error);
          set((state) => ({
            campaigns: state.campaigns.map((c) => 
              c.id === id ? { ...c, ...updatedCampaign } : c
            ),
          }));
        }
      },

      deleteCampaign: async (id) => {
        try {
          await deleteDocument('campaigns', id);
        } catch (error) {
          console.error('Error deleting campaign:', error);
          set((state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== id),
          }));
        }
      },

      getActiveCampaign: () => {
        const { campaigns } = get();
        return campaigns.find(c => c.isActive && new Date(c.endDate) > new Date());
      },

      initializeCampaigns: () => {
        seedCollectionIfEmpty('campaigns', defaultCampaigns, 'id').catch(console.error);

        const unsubscribe = subscribeToCollection<Campaign>(
          { 
            collectionName: 'campaigns',
            idField: 'id' as keyof Campaign,
            orderByField: 'createdAt',
            orderDirection: 'desc'
          },
          (campaigns) => {
            if (campaigns.length > 0) {
              set({ campaigns, isLoading: false, isInitialized: true });
            } else if (!get().isInitialized) {
              set({ isLoading: false, isInitialized: true });
            }
          },
          (error) => {
            console.error('Campaign sync error:', error);
            set({ isLoading: false, isInitialized: true });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'campaign-storage',
      partialize: (state) => ({ campaigns: state.campaigns }),
      version: 1,
      migrate: (persistedState: any) => {
        // Keep existing migration logic
        return persistedState;
      }
    }
  )
);
