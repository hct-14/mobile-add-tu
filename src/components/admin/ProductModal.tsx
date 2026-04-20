import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant } from '../../types';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useCategoryStore } from '../../store/useCategoryStore';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
  const { categories } = useCategoryStore();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    price: 0,
    image: '',
    category: 'Điện thoại',
    brand: '',
    description: '',
    inStock: true,
    images: [],
    specs: {},
    variants: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        slug: '',
        price: 0,
        image: '',
        category: 'Điện thoại',
        brand: '',
        description: '',
        inStock: true,
        images: [],
        specs: {},
        variants: [
          { id: Date.now().toString(), color: 'Mặc định', price: 0, inStock: true }
        ]
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVariantChange(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...(formData.variants || []),
        { id: Date.now().toString(), color: '', price: formData.price || 0, inStock: true }
      ]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfferChange = (index: number, value: string) => {
    const newOffers = [...(formData.offers || [])];
    newOffers[index] = value;
    setFormData({ ...formData, offers: newOffers });
  };

  const addOffer = () => {
    setFormData({
      ...formData,
      offers: [...(formData.offers || []), '']
    });
  };

  const removeOffer = (index: number) => {
    const newOffers = [...(formData.offers || [])];
    newOffers.splice(index, 1);
    setFormData({ ...formData, offers: newOffers });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto generate slug if empty
    const slug = formData.slug || (formData.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    // Filter empty offers
    const cleanOffers = (formData.offers || []).filter(o => o.trim() !== '');
    
    onSave({
      id: initialData?.id || Date.now().toString(),
      name: formData.name || '',
      slug: slug,
      price: formData.price || 0,
      image: formData.image || '',
      images: formData.images || [formData.image || ''],
      category: formData.category || 'Điện thoại',
      brand: formData.brand || '',
      description: formData.description || '',
      inStock: formData.inStock ?? true,
      specs: formData.specs || {},
      variants: formData.variants && formData.variants.length > 0 ? formData.variants : [{ id: Date.now().toString(), color: 'Mặc định', price: formData.price || 0, inStock: true }],
      offers: cleanOffers.length > 0 ? cleanOffers : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl my-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border rounded p-2" placeholder="De-trong-de-tu-tao" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá bán cơ bản (VNĐ)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded p-2" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded p-2">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thương hiệu</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả chi tiết sản phẩm</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full border rounded p-2" 
                rows={4}
                placeholder="Nhập mô tả chi tiết về sản phẩm, tính năng, ưu điểm..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hình ảnh chính</label>
              <div className="flex gap-2">
                <input type="text" name="image" value={formData.image} onChange={handleChange} className="flex-1 border rounded p-2" placeholder="URL hoặc tải ảnh lên" required />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 flex items-center"
                >
                  <Upload size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleMainImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              {formData.image && (
                <div className="mt-2 w-20 h-20 border rounded overflow-hidden">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <input type="checkbox" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} className="mr-2" />
            <label htmlFor="inStock" className="text-sm font-medium">Còn hàng (Trạng thái chung)</label>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Thêm Khuyến mãi & Ưu đãi</h3>
              <button 
                type="button" 
                onClick={addOffer}
                className="flex items-center text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded hover:bg-green-100"
              >
                <Plus size={16} className="mr-1" /> Thêm ưu đãi
              </button>
            </div>
            
            <div className="space-y-3">
              {(formData.offers || []).map((offer, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input 
                    type="text" 
                    value={offer} 
                    onChange={(e) => handleOfferChange(index, e.target.value)} 
                    className="flex-1 border rounded p-2 text-sm" 
                    placeholder="VD: Trợ giá thu cũ đổi mới lên đến 2.000.000đ"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeOffer(index)}
                    className="text-red-500 hover:text-red-700 p-2 border rounded border-red-200 bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {(!formData.offers || formData.offers.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm border border-dashed rounded">
                  Chưa có chương trình khuyến mãi riêng cho sản phẩm này.
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Phiên bản (Variants)</h3>
              <button 
                type="button" 
                onClick={addVariant}
                className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100"
              >
                <Plus size={16} className="mr-1" /> Thêm phiên bản
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.variants?.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4 bg-gray-50 relative">
                  <button 
                    type="button" 
                    onClick={() => removeVariant(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Màu sắc *</label>
                      <input 
                        type="text" 
                        value={variant.color} 
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)} 
                        className="w-full border rounded p-2 text-sm" 
                        required 
                        placeholder="VD: Đen, Trắng..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Bộ nhớ (Storage)</label>
                      <input 
                        type="text" 
                        value={variant.storage || ''} 
                        onChange={(e) => handleVariantChange(index, 'storage', e.target.value)} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="VD: 128GB, 256GB..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">RAM</label>
                      <input 
                        type="text" 
                        value={variant.ram || ''} 
                        onChange={(e) => handleVariantChange(index, 'ram', e.target.value)} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="VD: 8GB, 16GB..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Tình trạng (Condition)</label>
                      <input 
                        type="text" 
                        value={variant.condition || ''} 
                        onChange={(e) => handleVariantChange(index, 'condition', e.target.value)} 
                        className="w-full border rounded p-2 text-sm" 
                        placeholder="VD: Mới 100%, Cũ 99%..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Giá bán (VNĐ) *</label>
                      <input 
                        type="number" 
                        value={variant.price} 
                        onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))} 
                        className="w-full border rounded p-2 text-sm" 
                        required 
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Hình ảnh phiên bản</label>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer flex-1 flex items-center justify-center border border-dashed rounded p-2 text-sm hover:bg-gray-100">
                          <Upload size={16} className="mr-2" /> Tải ảnh lên
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleVariantImageUpload(index, e)}
                          />
                        </label>
                        {variant.image && (
                          <div className="w-10 h-10 border rounded overflow-hidden flex-shrink-0">
                            <img src={variant.image} alt="Variant" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center lg:col-span-3">
                      <input 
                        type="checkbox" 
                        id={`variant-stock-${index}`} 
                        checked={variant.inStock} 
                        onChange={(e) => handleVariantChange(index, 'inStock', e.target.checked)} 
                        className="mr-2" 
                      />
                      <label htmlFor={`variant-stock-${index}`} className="text-sm font-medium">Còn hàng</label>
                    </div>
                  </div>
                </div>
              ))}
              {(!formData.variants || formData.variants.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm border border-dashed rounded">
                  Chưa có phiên bản nào. Vui lòng thêm ít nhất 1 phiên bản.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6 border-t pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-[#00483d] text-white rounded hover:bg-[#00382f]">Lưu sản phẩm</button>
          </div>
        </form>
      </div>
    </div>
  );
}
