import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { TradeInRequest } from '../types';
import { toast } from 'react-hot-toast';

interface TradeInStore {
  requests: TradeInRequest[];
  updateStatus: (id: string, status: TradeInRequest['status']) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  subscribe: () => () => void;
}

export const useTradeInStore = create<TradeInStore>((set) => ({
  requests: [],
  updateStatus: async (id, status) => {
    try {
      const docRef = doc(db, 'trade_in_requests', id);
      await updateDoc(docRef, { status });
      toast.success('Cập nhật trạng thái thành công!');
    } catch (e) {
      console.error('Error updating trade_in_request status:', e);
      toast.error('Cập nhật thất bại!');
      throw e;
    }
  },
  deleteRequest: async (id) => {
    try {
      const docRef = doc(db, 'trade_in_requests', id);
      await deleteDoc(docRef);
      toast.success('Đã xóa yêu cầu thu cũ đổi mới!');
    } catch (e) {
      console.error('Error deleting trade_in_request:', e);
      toast.error('Xóa thất bại!');
      throw e;
    }
  },
  subscribe: () => {
    const q = query(collection(db, 'trade_in_requests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TradeInRequest));
      set({ requests });
    }, (error) => {
      console.error('Error subscribing to trade_in_requests:', error);
    });
  },
}));
