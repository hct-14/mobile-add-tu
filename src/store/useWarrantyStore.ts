import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Warranty } from '../types';
import { toast } from 'react-hot-toast';

interface WarrantyStore {
  warranties: Warranty[];
  addWarranty: (warranty: Warranty) => Promise<void>;
  updateWarranty: (id: string, warranty: Partial<Warranty>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;
  subscribeWarranties: () => () => void;
}

export const useWarrantyStore = create<WarrantyStore>()((set) => ({
  warranties: [],
  addWarranty: async (warranty) => {
    try {
      if (!warranty.id) {
        warranty.id = Date.now().toString();
      }
      await setDoc(doc(db, 'warranties', warranty.id), warranty);
      toast.success('Thêm thông tin bảo hành thành công');
    } catch (error) {
      console.error('Lỗi khi thêm bảo hành:', error);
      toast.error('Có lỗi xảy ra khi thêm bảo hành');
    }
  },
  updateWarranty: async (id, updatedWarranty) => {
    try {
      await updateDoc(doc(db, 'warranties', id), updatedWarranty as any);
      toast.success('Cập nhật bảo hành thành công');
    } catch (error) {
      console.error('Lỗi cập nhật bảo hành:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bảo hành');
    }
  },
  deleteWarranty: async (id) => {
    try {
      await deleteDoc(doc(db, 'warranties', id));
      toast.success('Xóa bảo hành thành công');
    } catch (error) {
      console.error('Lỗi khi xóa bảo hành:', error);
      toast.error('Có lỗi xảy ra khi xóa bảo hành');
    }
  },
  subscribeWarranties: () => {
    const unsub = onSnapshot(collection(db, 'warranties'), (snapshot) => {
      const warrantiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warranty));
      set({ warranties: warrantiesData });
    }, (error) => {
      console.error('Error fetching warranties:', error);
    });
    return unsub;
  }
}));
