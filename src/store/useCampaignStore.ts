import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Campaign } from '../types';
import { toast } from 'react-hot-toast';

interface CampaignStore {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  getActiveCampaign: () => Campaign | undefined;
  subscribeCampaigns: () => () => void;
}

export const useCampaignStore = create<CampaignStore>()((set, get) => ({
  campaigns: [],
  addCampaign: async (campaign) => {
    try {
      if (!campaign.id) {
        campaign.id = Date.now().toString();
      }
      await setDoc(doc(db, 'campaigns', campaign.id), campaign);
      toast.success('Thêm chiến dịch thành công');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thêm chiến dịch');
    }
  },
  updateCampaign: async (id, campaign) => {
    try {
      await updateDoc(doc(db, 'campaigns', id), campaign as any);
      toast.success('Cập nhật chiến dịch thành công');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi cập nhật chiến dịch');
    }
  },
  deleteCampaign: async (id) => {
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      toast.success('Xóa chiến dịch thành công');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa chiến dịch');
    }
  },
  getActiveCampaign: () => {
    const { campaigns } = get();
    return campaigns.find(c => c.isActive && new Date(c.endDate) > new Date());
  },
  subscribeCampaigns: () => {
    const unsub = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
      const campaignsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      set({ campaigns: campaignsData });
    }, (error) => {
      console.error('Error fetching campaigns:', error);
    });
    return unsub;
  }
}));
