import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

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
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    } catch (e) {
      console.error('Error updating order status:', e);
      toast.error('Cập nhật trạng thái thất bại!');
      throw e;
    }
  },
  updateOrder: async (id, updates) => {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, updates);
      toast.success('Cập nhật đơn hàng thành công!');
    } catch (e) {
      console.error('Error updating order:', e);
      toast.error('Cập nhật đơn hàng thất bại!');
      throw e;
    }
  },
  subscribeOrders: () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    console.log('Subscribing to orders...');
    return onSnapshot(q, (snapshot) => {
      console.log('Received order snapshot, size:', snapshot.size);
      const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      set({ orders });
    }, (error) => {
      console.error('Error in subscribeOrders:', error);
    });
  },
}));
