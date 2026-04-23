import { create } from 'zustand';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, increment, getDoc, onSnapshot } from 'firebase/firestore';

interface AnalyticsStore {
  pageViews: number;
  productViews: Record<string, number>;
  productOrders: Record<string, number>;
  dailyViews: Record<string, number>;
  incrementPageView: () => Promise<void>;
  incrementProductView: (productId: string) => Promise<void>;
  incrementProductOrder: (productId: string, quantity: number) => Promise<void>;
  subscribeAnalytics: () => () => void;
}

const ANALYTICS_DOC_ID = 'main-analytics';

export const useAnalyticsStore = create<AnalyticsStore>()((set) => ({
  pageViews: 0,
  productViews: {},
  productOrders: {},
  dailyViews: {},
  
  incrementPageView: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'analytics', ANALYTICS_DOC_ID);
      const snap = await getDoc(docRef);
      if(!snap.exists()) {
        await setDoc(docRef, { pageViews: 1, dailyViews: { [today]: 1 } });
      } else {
        await updateDoc(docRef, {
          pageViews: increment(1),
          [`dailyViews.${today}`]: increment(1)
        });
      }
    } catch (error) {
      console.error('Error incrementing page views:', error);
    }
  },
  
  incrementProductView: async (productId) => {
    try {
      const docRef = doc(db, 'analytics', ANALYTICS_DOC_ID);
      const snap = await getDoc(docRef);
      if(!snap.exists()) {
        await setDoc(docRef, { productViews: { [productId]: 1 } });
      } else {
        await updateDoc(docRef, {
          [`productViews.${productId}`]: increment(1)
        });
      }
    } catch (error) {
      console.error('Error incrementing product view:', error);
    }
  },
  
  incrementProductOrder: async (productId, quantity) => {
    try {
      const docRef = doc(db, 'analytics', ANALYTICS_DOC_ID);
      const snap = await getDoc(docRef);
      if(!snap.exists()) {
        await setDoc(docRef, { productOrders: { [productId]: quantity } });
      } else {
        await updateDoc(docRef, {
          [`productOrders.${productId}`]: increment(quantity)
        });
      }
    } catch (error) {
      console.error('Error incrementing product order:', error);
    }
  },

  subscribeAnalytics: () => {
    const unsub = onSnapshot(doc(db, 'analytics', ANALYTICS_DOC_ID), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        set({
          pageViews: data.pageViews || 0,
          productViews: data.productViews || {},
          productOrders: data.productOrders || {},
          dailyViews: data.dailyViews || {},
        });
      }
    });
    return unsub;
  }
}));
