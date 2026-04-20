import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { mockProducts } from '../data/mockProducts';
import { Database } from 'lucide-react';

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedData = async () => {
    setLoading(true);
    setMessage('Đang nạp dữ liệu...');
    try {
      for (const product of mockProducts) {
        const path = `products/${product.id}`;
        try {
          await setDoc(doc(db, 'products', product.id), {
            ...product,
            inventoryQuantity: product.inventoryQuantity || 10,
            reviews: product.reviews || []
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }
      setMessage('Nạp dữ liệu thành công!');
    } catch (error) {
      console.error(error);
      setMessage('Lỗi khi nạp dữ liệu. Kiểm tra console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={seedData}
        disabled={loading}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        <Database size={18} />
        {loading ? 'Đang nạp...' : 'Nạp dữ liệu mẫu vào Firestore'}
      </button>
      {message && <p className="text-sm font-medium text-indigo-600">{message}</p>}
    </div>
  );
}
