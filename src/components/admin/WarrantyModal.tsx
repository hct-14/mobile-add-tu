import React, { useState, useEffect } from 'react';
import { Warranty } from '../../types';

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warranty: Warranty) => void;
  initialData?: Warranty | null;
}

export default function WarrantyModal({ isOpen, onClose, onSave, initialData }: WarrantyModalProps) {
  const [formData, setFormData] = useState<Partial<Warranty>>({
    imei: '',
    productName: '',
    color: '',
    customerPhone: '',
    startDate: new Date().toISOString().slice(0, 10),
    durationMonths: 12,
    history: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: new Date(initialData.startDate).toISOString().slice(0, 10)
      });
    } else {
      setFormData({
        imei: '',
        productName: '',
        color: '',
        customerPhone: '',
        startDate: new Date().toISOString().slice(0, 10),
        durationMonths: 12,
        history: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate end date
    const startDate = new Date(formData.startDate || new Date());
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (formData.durationMonths || 12));

    onSave({
      id: initialData?.id || Date.now().toString(),
      imei: formData.imei || '',
      productName: formData.productName || '',
      color: formData.color || '',
      customerPhone: formData.customerPhone || '',
      startDate: startDate.toISOString(),
      durationMonths: formData.durationMonths || 12,
      endDate: endDate.toISOString(),
      history: formData.history || []
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa thông tin bảo hành' : 'Thêm máy bảo hành'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">IMEI / Serial *</label>
            <input type="text" name="imei" value={formData.imei} onChange={handleChange} className="w-full border rounded p-2 uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
            <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Màu sắc</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại KH *</label>
              <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời hạn (Tháng) *</label>
              <input type="number" name="durationMonths" value={formData.durationMonths} onChange={handleChange} className="w-full border rounded p-2" required min="1" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-[#00483d] text-white rounded hover:bg-[#00382f]">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
