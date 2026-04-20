import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
}

export default function ExpenseModal({ isOpen, onClose, onSave }: ExpenseModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Expense['type']>('Khác');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      type,
      amount,
      expenseDate: new Date().toISOString(),
      note
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Thêm chi phí khác</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên chi phí</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Ví dụ: Tiền điện, Marketing..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại chi phí</label>
            <select 
              required
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="Marketing">Marketing</option>
              <option value="Nhân sự">Nhân sự</option>
              <option value="Vận hành">Vận hành</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
            <input 
              type="number" 
              required
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Hủy</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#00483d] hover:bg-[#00382f] rounded-lg">Lưu chi phí</button>
          </div>
        </form>
      </div>
    </div>
  );
}
