import React, { useState, useEffect } from 'react';
import { Campaign } from '../../types';
import { useProductStore } from '../../store/useProductStore';
import { Plus, Trash2 } from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
  initialData?: Campaign | null;
}

export default function CampaignModal({ isOpen, onClose, onSave, initialData }: CampaignModalProps) {
  const { products } = useProductStore();
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    endDate: '',
    isActive: true,
    products: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        endDate: new Date(initialData.endDate).toISOString().slice(0, 16) // Format for datetime-local
      });
    } else {
      setFormData({
        name: '',
        endDate: '',
        isActive: true,
        products: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAddProduct = () => {
    if (products.length > 0) {
      setFormData({
        ...formData,
        products: [
          ...(formData.products || []),
          { productId: products[0].id, flashSalePrice: 0 }
        ]
      });
    }
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = [...(formData.products || [])];
    newProducts.splice(index, 1);
    setFormData({ ...formData, products: newProducts });
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const newProducts = [...(formData.products || [])];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData({ ...formData, products: newProducts });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now().toString(),
      name: formData.name || '',
      endDate: new Date(formData.endDate || '').toISOString(),
      isActive: formData.isActive ?? true,
      products: formData.products || []
    });
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa Chiến dịch' : 'Thêm Chiến dịch'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên chiến dịch</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="mr-2" id="isActive" />
            <label htmlFor="isActive" className="text-sm font-medium">Đang hoạt động</label>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Sản phẩm trong chiến dịch</label>
              <button type="button" onClick={handleAddProduct} className="text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center">
                <Plus size={16} className="mr-1" /> Thêm SP
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.products && formData.products.length > 0 && (
                <div className="flex gap-2 px-2 text-xs font-medium text-gray-500">
                  <div className="flex-1">Sản phẩm</div>
                  <div className="w-28 text-right">Giá gốc</div>
                  <div className="w-28 text-right">Giảm giá</div>
                  <div className="w-32">Giá Flash Sale</div>
                  <div className="w-8"></div>
                </div>
              )}
              {formData.products?.map((prod, index) => {
                const selectedProduct = products.find(p => p.id === prod.productId);
                const currentPrice = selectedProduct?.price || 0;
                const discountAmount = currentPrice > 0 && prod.flashSalePrice > 0 ? currentPrice - prod.flashSalePrice : 0;
                const discountPercent = currentPrice > 0 && prod.flashSalePrice > 0 ? Math.round((discountAmount / currentPrice) * 100) : 0;

                return (
                  <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                    <select 
                      value={prod.productId} 
                      onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                      className="flex-1 border rounded p-2 text-sm"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    
                    <div className="w-28 text-right text-sm text-gray-600 font-medium">
                      {formatPrice(currentPrice)}
                    </div>
                    
                    <div className="w-28 text-right text-sm text-red-600 font-medium">
                      {discountAmount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span>{formatPrice(discountAmount)}</span>
                          <span className="text-xs bg-red-100 px-1 rounded">-{discountPercent}%</span>
                        </div>
                      ) : '-'}
                    </div>

                    <input 
                      type="number" 
                      value={prod.flashSalePrice} 
                      onChange={(e) => handleProductChange(index, 'flashSalePrice', Number(e.target.value))}
                      className="w-32 border rounded p-2 text-sm"
                      placeholder="Giá Flash Sale"
                      required
                      min="0"
                    />
                    <button type="button" onClick={() => handleRemoveProduct(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
              {(!formData.products || formData.products.length === 0) && (
                <div className="text-sm text-gray-500 text-center py-4 border rounded border-dashed">
                  Chưa có sản phẩm nào trong chiến dịch
                </div>
              )}
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
