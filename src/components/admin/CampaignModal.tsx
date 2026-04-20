import React, { useState, useEffect } from 'react';
import { Campaign } from '../../types';
import { useProductStore } from '../../store/useProductStore';
import { Plus, Trash2, Search } from 'lucide-react';

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
  
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        endDate: new Date(initialData.endDate).toISOString().slice(0, 16)
      });
      setSelectedProductIds(initialData.products.map(p => p.productId));
    } else {
      setFormData({
        name: '',
        endDate: '',
        isActive: true,
        products: []
      });
      setSelectedProductIds([]);
    }
    setProductSearch('');
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

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Add selected products to campaign
  const handleAddSelectedProducts = () => {
    const newProducts = selectedProductIds
      .filter(id => !formData.products?.some(p => p.productId === id))
      .map(id => ({ productId: id, flashSalePrice: 0 }));
    
    if (newProducts.length > 0) {
      setFormData({
        ...formData,
        products: [...(formData.products || []), ...newProducts]
      });
    }
    setSelectedProductIds([]);
    setProductSearch('');
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Add single product directly
  const handleQuickAddProduct = (productId: string) => {
    if (!formData.products?.some(p => p.productId === productId)) {
      setFormData({
        ...formData,
        products: [...(formData.products || []), { productId, flashSalePrice: 0 }]
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

            {/* Product Search Section */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Search size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Tìm kiếm sản phẩm</span>
              </div>
              
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc danh mục..."
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleAddSelectedProducts}
                  disabled={selectedProductIds.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Thêm ({selectedProductIds.length})
                </button>
              </div>

              {/* Search Results */}
              {productSearch && filteredProducts.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-blue-200 rounded-lg bg-white">
                  {filteredProducts.slice(0, 10).map(p => {
                    const isInCampaign = formData.products?.some(prod => prod.productId === p.id);
                    const isSelected = selectedProductIds.includes(p.id);
                    
                    return (
                      <div 
                        key={p.id}
                        onClick={() => !isInCampaign && toggleProductSelection(p.id)}
                        className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          isInCampaign ? 'opacity-50 cursor-not-allowed' : ''
                        } ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          disabled={isInCampaign}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4"
                        />
                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{formatPrice(p.price)}</p>
                        </div>
                        {isInCampaign && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Đã thêm</span>
                        )}
                        {!isInCampaign && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleQuickAddProduct(p.id); }}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            + Thêm
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {productSearch && filteredProducts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">Không tìm thấy sản phẩm nào</p>
              )}
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
