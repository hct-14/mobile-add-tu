import React, { useState, useEffect } from 'react';
import { Promotion } from '../../types';
import { useCategoryStore } from '../../store/useCategoryStore';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: Promotion) => void;
  initialData?: Promotion | null;
}

export default function PromotionModal({ isOpen, onClose, onSave, initialData }: PromotionModalProps) {
  const { categories } = useCategoryStore();
  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '',
    description: '',
    discountType: 'fixed',
    discountAmount: 0,
    discountPercent: 0,
    minOrderValue: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    applicableCategories: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        discountType: initialData.discountType || 'fixed',
        discountPercent: initialData.discountPercent || 0,
        minOrderValue: initialData.minOrderValue || 0,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : ''
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discountType: 'fixed',
        discountAmount: 0,
        discountPercent: 0,
        minOrderValue: 0,
        isActive: true,
        startDate: '',
        endDate: '',
        usageLimit: 0,
        applicableCategories: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) });
    } else if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions).map(opt => (opt as HTMLOptionElement).value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now().toString(),
      code: formData.code || '',
      description: formData.description || '',
      discountType: formData.discountType || 'fixed',
      discountAmount: formData.discountType === 'fixed' ? (formData.discountAmount || 0) : undefined,
      discountPercent: formData.discountType === 'percent' ? (formData.discountPercent || 0) : undefined,
      minOrderValue: formData.minOrderValue || 0,
      isActive: formData.isActive ?? true,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      usageLimit: formData.usageLimit || undefined,
      usedCount: initialData?.usedCount || 0,
      applicableCategories: formData.applicableCategories || []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa Khuyến mãi' : 'Thêm Khuyến mãi'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã khuyến mãi</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full border rounded p-2 uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" required rows={2} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border rounded p-2">
                <option value="fixed">Số tiền cố định</option>
                <option value="percent">Phần trăm (%)</option>
              </select>
            </div>
            
            {formData.discountType === 'percent' ? (
              <div>
                <label className="block text-sm font-medium mb-1">Phần trăm giảm (%)</label>
                <input type="number" name="discountPercent" value={formData.discountPercent || 0} onChange={handleChange} className="w-full border rounded p-2" required min="1" max="100" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Số tiền giảm (VNĐ)</label>
                <input type="number" name="discountAmount" value={formData.discountAmount || 0} onChange={handleChange} className="w-full border rounded p-2" required min="0" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Giá trị đơn hàng tối thiểu (VNĐ)</label>
            <input type="number" name="minOrderValue" value={formData.minOrderValue || 0} onChange={handleChange} className="w-full border rounded p-2" min="0" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian bắt đầu (Tùy chọn)</label>
              <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian kết thúc (Tùy chọn)</label>
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Giới hạn số lượng (0 = Không giới hạn)</label>
            <input type="number" name="usageLimit" value={formData.usageLimit || 0} onChange={handleChange} className="w-full border rounded p-2" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục áp dụng (Giữ Ctrl/Cmd để chọn nhiều, bỏ trống = Tất cả)</label>
            <select multiple name="applicableCategories" value={formData.applicableCategories} onChange={handleChange} className="w-full border rounded p-2 h-24">
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="mr-2" />
            <label htmlFor="isActive" className="text-sm font-medium">Đang hoạt động</label>
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
