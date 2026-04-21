import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant } from '../../types';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useCategoryStore } from '../../store/useCategoryStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

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
    originalPrice: 0,
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
        originalPrice: 0,
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
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      const numValue = Number(value);
      setFormData(prev => {
        const newData = { ...prev, [name]: numValue };
        
        // Auto compute discount
        if ((name === 'price' || name === 'originalPrice') && newData.originalPrice && newData.price && newData.originalPrice > newData.price) {
          newData.discountPercentage = Math.round(((newData.originalPrice - newData.price) / newData.originalPrice) * 100);
        } else if ((name === 'price' || name === 'originalPrice')) {
           newData.discountPercentage = undefined;
        }

        // Sync variants
        if (name === 'price') {
          newData.variants = prev.variants?.map(v => {
            if (prev.variants?.length === 1 || v.price === prev.price || v.price === 0) {
              return { ...v, price: numValue };
            }
            return v;
          });
        }
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
      if (file.size > 800000) {
          toast.error('Kích thước ảnh quá lớn (tối đa 800KB). Vui lòng chọn ảnh khác.');
          return;
      }
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
      if (file.size > 800000) {
          toast.error('Kích thước ảnh quá lớn (tối đa 800KB). Vui lòng chọn ảnh khác.');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Filter large files
    const validFiles = files.filter(f => f.size <= 800000);
    if (validFiles.length < files.length) {
      toast.error('Vài ảnh bị bỏ qua do kích thước quá lớn (tối đa 800KB/ảnh).');
    }

    Promise.all(
      validFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then((base64Images) => {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...base64Images]
      }));
    });
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
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
    
    let finalDiscount = undefined;
    if (formData.originalPrice && formData.price && formData.originalPrice > formData.price) {
      finalDiscount = Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100);
    }

    onSave({
      id: initialData?.id || Date.now().toString(),
      name: formData.name || '',
      slug: slug,
      price: formData.price || 0,
      originalPrice: formData.originalPrice || undefined,
      discountPercentage: finalDiscount,
      image: formData.image || '',
      images: formData.images || [formData.image || ''],
      category: formData.category || 'Điện thoại',
      brand: formData.brand || '',
      isUsed: formData.isUsed ?? false,
      inventoryQuantity: formData.inventoryQuantity,
      description: formData.description || '',
      inStock: formData.inStock ?? true,
      specs: formData.specs || {},
      variants: formData.variants && formData.variants.length > 0 ? formData.variants : [{ id: Date.now().toString(), color: 'Mặc định', price: formData.price || 0, inStock: true }],
      ...(cleanOffers.length > 0 ? { offers: cleanOffers } : {})
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-4xl my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
              <label className="block text-sm font-medium mb-1">Giá bán cơ bản (Giá KM)</label>
              <input 
                type="text" 
                name="price" 
                value={formData.price ? formData.price.toLocaleString('vi-VN') : ''} 
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  const numValue = rawValue ? Number(rawValue) : 0;
                  setFormData(prev => {
                    const newData = { ...prev, price: numValue };
                    if (newData.originalPrice && newData.price && newData.originalPrice > newData.price) {
                      newData.discountPercentage = Math.round(((newData.originalPrice - newData.price) / newData.originalPrice) * 100);
                    } else {
                       newData.discountPercentage = undefined;
                    }
                    newData.variants = prev.variants?.map(v => {
                      if (prev.variants?.length === 1 || v.price === prev.price || v.price === 0) {
                        return { ...v, price: numValue };
                      }
                      return v;
                    });
                    return newData;
                  });
                }}
                className="w-full border rounded p-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá gốc (Bỏ trống nếu không giảm)</label>
              <input 
                type="text" 
                name="originalPrice" 
                value={formData.originalPrice ? formData.originalPrice.toLocaleString('vi-VN') : ''} 
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  const numValue = rawValue ? Number(rawValue) : 0;
                  setFormData(prev => {
                    const newData = { ...prev, originalPrice: numValue === 0 ? undefined : numValue };
                    if (newData.originalPrice && newData.price && newData.originalPrice > newData.price) {
                      newData.discountPercentage = Math.round(((newData.originalPrice - newData.price) / newData.originalPrice) * 100);
                    } else {
                       newData.discountPercentage = undefined;
                    }
                    return newData;
                  });
                }}
                className="w-full border rounded p-2" 
              />
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
            <div>
              <label className="block text-sm font-medium mb-1">Tình trạng máy</label>
              <select 
                name="isUsed" 
                value={formData.isUsed ? 'true' : 'false'} 
                onChange={(e) => setFormData({...formData, isUsed: e.target.value === 'true'})} 
                className="w-full border rounded p-2"
              >
                <option value="false">Máy mới nguyên seal</option>
                <option value="true">Máy cũ (Like New)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng tồn kho (Tổng)</label>
              <input 
                type="number" 
                name="inventoryQuantity" 
                value={formData.inventoryQuantity || ''} 
                onChange={handleChange} 
                className="w-full border rounded p-2" 
                placeholder="VD: 100" 
                min="0"
              />
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Các hình ảnh phụ (Tối đa 5 ảnh)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.images || []).map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {(!formData.images || formData.images.length < 5) && (
                  <label className="w-20 h-20 border border-dashed rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
                    <Plus size={20} />
                    <span className="text-[10px] mt-1">Thêm ảnh</span>
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleGalleryImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
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
                        type="text" 
                        value={variant.price ? variant.price.toLocaleString('vi-VN') : ''} 
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, '');
                          const numValue = rawValue ? Number(rawValue) : 0;
                          handleVariantChange(index, 'price', numValue);
                        }} 
                        className="w-full border rounded p-2 text-sm" 
                        required 
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
