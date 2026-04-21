import React, { useState } from 'react';
import { Warranty, WarrantyHistory } from '../../types';

interface WarrantyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: Warranty | null;
  onUpdateHistory: (id: string, history: WarrantyHistory[]) => void;
}

export default function WarrantyHistoryModal({ isOpen, onClose, warranty, onUpdateHistory }: WarrantyHistoryModalProps) {
  const [newHistory, setNewHistory] = useState<Partial<WarrantyHistory>>({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    status: 'received'
  });

  if (!isOpen || !warranty) return null;

  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistory.description) return;

    const historyItem: WarrantyHistory = {
      id: Date.now().toString(),
      date: new Date(newHistory.date || new Date()).toISOString(),
      description: newHistory.description,
      status: newHistory.status as 'received' | 'processing' | 'completed'
    };

    onUpdateHistory(warranty.id, [...warranty.history, historyItem]);
    setNewHistory({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      status: 'received'
    });
  };

  const statusMap = {
    'received': 'Đã tiếp nhận',
    'processing': 'Đang xử lý',
    'completed': 'Đã hoàn thành'
  };

  const statusColorMap = {
    'received': 'bg-blue-100 text-blue-800',
    'processing': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lịch sử bảo hành</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">Sản phẩm:</span> <span className="font-medium">{warranty.productName}</span></div>
            <div><span className="text-gray-500">IMEI:</span> <span className="font-medium">{warranty.imei}</span></div>
            <div><span className="text-gray-500">Khách hàng:</span> <span className="font-medium">{warranty.customerPhone}</span></div>
            <div><span className="text-gray-500">Hạn BH:</span> <span className="font-medium">{new Date(warranty.endDate).toLocaleDateString('vi-VN')}</span></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3 border-b pb-2">Thêm tiến trình mới</h3>
          <form onSubmit={handleAddHistory} className="flex gap-2 items-end">
            <div className="w-32">
              <label className="block text-xs font-medium mb-1">Ngày</label>
              <input 
                type="date" 
                value={newHistory.date} 
                onChange={(e) => setNewHistory({...newHistory, date: e.target.value})}
                className="w-full border rounded p-2 text-sm"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Mô tả tình trạng / Hướng xử lý</label>
              <input 
                type="text" 
                value={newHistory.description} 
                onChange={(e) => setNewHistory({...newHistory, description: e.target.value})}
                className="w-full border rounded p-2 text-sm"
                required
                placeholder="VD: Nhận máy lỗi màn hình..."
              />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium mb-1">Trạng thái</label>
              <select 
                value={newHistory.status} 
                onChange={(e) => setNewHistory({...newHistory, status: e.target.value as any})}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="received">Đã tiếp nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
            <button type="submit" className="bg-[#00483d] text-white px-4 py-2 rounded text-sm hover:bg-[#00382f]">
              Thêm
            </button>
          </form>
        </div>

        <div>
          <h3 className="font-bold mb-3 border-b pb-2">Lịch sử tiến trình</h3>
          {warranty.history.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">Chưa có lịch sử bảo hành nào.</p>
          ) : (
            <div className="space-y-3">
              {[...warranty.history].reverse().map((item) => (
                <div key={item.id} className="border rounded-lg p-3 flex gap-4 items-start">
                  <div className="text-sm text-gray-500 w-24 flex-shrink-0">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.description}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${statusColorMap[item.status]}`}>
                    {statusMap[item.status]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
