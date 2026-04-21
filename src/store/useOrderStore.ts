import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  subscribeOrders: () => () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  addOrder: async (order) => {
    const docRef = await addDoc(collection(db, 'orders'), order);
    // Zustand state will update via subscription
  },
  updateOrderStatus: async (id, status) => {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, { status });
  },
  updateOrder: async (id, updates) => {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, updates);
  },
  subscribeOrders: () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      set({ orders });
    });
  },
}));
