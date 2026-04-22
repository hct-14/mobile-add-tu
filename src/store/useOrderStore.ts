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
    try {
      // Remove undefined values since Firestore does not support them
      const cleanOrder = JSON.parse(JSON.stringify(order));
      const docRef = await addDoc(collection(db, 'orders'), cleanOrder);
      console.log('Order added with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding order: ', e);
      throw e;
    }
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
    console.log('Subscribing to orders...');
    return onSnapshot(q, (snapshot) => {
      console.log('Received order snapshot, size:', snapshot.size);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      set({ orders });
    }, (error) => {
      console.error('Error in subscribeOrders:', error);
    });
  },
}));
