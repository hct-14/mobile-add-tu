import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ImportSlip, Product } from '../../types';

interface ImportSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (slip: Omit<ImportSlip, 'id'>) => void;
}

export default function ImportSlipModal({ isOpen, onClose, products, onSave }: ImportSlipModalProps) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [importPrice, setImportPrice] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    onSave({
      productId,
      productName: product.name,
      category: product.category,
      quantity,
      importPrice,
      totalPrice: quantity * importPrice,
      supplier,
      importDate: new Date().toISOString(),
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
          <h2 className="text-lg font-bold">Thêm phiếu nhập hàng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
            <select 
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Chọn sản phẩm</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input 
                type="number" 
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập</label>
              <input 
                type="number" 
                required
                min="0"
                value={importPrice}
                onChange={(e) => setImportPrice(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
            <input 
              type="text" 
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
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
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#00483d] hover:bg-[#00382f] rounded-lg">Lưu phiếu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
