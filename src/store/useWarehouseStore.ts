import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ImportSlip, Expense } from '../types';

interface WarehouseStore {
  importSlips: ImportSlip[];
  expenses: Expense[];
  fetchWarehouseData: () => Promise<void>;
  addImportSlip: (slip: Omit<ImportSlip, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

export const useWarehouseStore = create<WarehouseStore>((set) => ({
  importSlips: [],
  expenses: [],
  fetchWarehouseData: async () => {
    const slipsSnapshot = await getDocs(collection(db, 'import_slips'));
    const expensesSnapshot = await getDocs(collection(db, 'expenses'));
    set({
      importSlips: slipsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImportSlip)),
      expenses: expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)),
    });
  },
  addImportSlip: async (slip) => {
    await addDoc(collection(db, 'import_slips'), slip);
    // Refresh data
    const snapshot = await getDocs(collection(db, 'import_slips'));
    set({ importSlips: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImportSlip)) });
  },
  addExpense: async (expense) => {
    await addDoc(collection(db, 'expenses'), expense);
    // Refresh data
    const snapshot = await getDocs(collection(db, 'expenses'));
    set({ expenses: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)) });
  },
}));
