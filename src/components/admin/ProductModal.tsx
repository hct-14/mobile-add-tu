import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, ProductVariant } from '../../types';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useCategoryStore } from '../../store/useCategoryStore';
import { uploadImage } from '../../lib/uploadImage';
import { toast } from 'react-hot-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
  existingProducts?: Product[];
}

export default function ProductModal({ isOpen, onClose, onSave, initialData, existingProducts = [] }: ProductModalProps) {
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
  const [slugWarning, setSlugWarning] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to generate unique slug
  const generateUniqueSlug = useCallback((baseSlug: string, excludeId?: string): string => {
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists (excluding current product if editing)
    while (existingProducts.some(p => p.slug === slug && p.id !== excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }, [existingProducts]);

  // Auto-generate slug from name
  const autoGenerateSlug = useCallback((name: string, currentSlug: string, excludeId?: string): string => {
    // Only auto-generate if user hasn't manually entered a custom slug
    const baseSlug = name.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/[đ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!baseSlug) return currentSlug || Date.now().toString();
    
    return generateUniqueSlug(baseSlug, excludeId);
  }, [generateUniqueSlug]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSlugWarning('');
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
          { id: Date.now().toString(), color: 'Mặc định', price: 0, inStock: true, stock: 10 }
        ]
      });
      setSlugWarning('');
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
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-generate slug when name changes (only if slug is empty or same as old auto-generated)
        if (name === 'name' && !initialData) {
          const oldAutoSlug = autoGenerateSlug(prev.name || '', prev.slug, prev.id);
          // Only auto-update if user hasn't manually changed the slug
          if (!prev.slug || prev.slug === oldAutoSlug || prev.slug === '') {
            newData.slug = autoGenerateSlug(value, prev.id);
          }
        }
        
        // Check slug uniqueness when slug field changes manually
        if (name === 'slug') {
          const isDuplicate = existingProducts.some(p => p.slug === value && p.id !== initialData?.id);
          if (isDuplicate) {
            setSlugWarning(`Slug "${value}" đã tồn tại! Sẽ tự động thêm hậu tố khi lưu.`);
            newData.slug = generateUniqueSlug(value, initialData?.id);
          } else {
            setSlugWarning('');
          }
        }
        
        return newData;
      });
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingVariantIndex(index);
      try {
        const result = await uploadImage(file, 'products/variants');
        handleVariantChange(index, 'image', result.url);
        toast.success('Tải ảnh lên thành công!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Lỗi khi tải ảnh lên!');
      } finally {
        setUploadingVariantIndex(null);
      }
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...(formData.variants || []),
        { id: Date.now().toString(), color: '', price: formData.price || 0, inStock: true, stock: 0 }
      ]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadImage(file, 'products');
        setFormData(prev => ({ ...prev, image: result.url }));
        // Also add to images array
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), result.url].filter(Boolean)
        }));
        toast.success('Tải ảnh lên thành công!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Lỗi khi tải ảnh lên!');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const result = await uploadImage(file, 'products');
        uploadedUrls.push(result.url);
      }
      
      // Set first image as main image if empty
      setFormData(prev => ({
        ...prev,
        image: prev.image || uploadedUrls[0],
        images: [...(prev.images || []), ...uploadedUrls].filter(Boolean)
      }));
      toast.success(`Đã tải lên ${files.length} ảnh!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải ảnh lên!');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        image: index === 0 ? (newImages[0] || '') : prev.image,
        images: newImages
      };
    });
  };

  const setMainImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      image: url
    }));
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
      description: formData.description || '',
      inStock: formData.inStock ?? true,
      specs: formData.specs || {},
      variants: formData.variants && formData.variants.length > 0 
        ? formData.variants.map(v => ({ ...v, stock: v.stock ?? 0 }))
        : [{ id: Date.now().toString(), color: 'Mặc định', price: formData.price || 0, inStock: true, stock: 10 }],
      ...(cleanOffers.length > 0 ? { offers: cleanOffers } : {})
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
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border rounded p-2" placeholder="Tu-dong-tao-neu-trong" />
              {slugWarning && (
                <p className="text-xs text-orange-600 mt-1">{slugWarning}</p>
              )}
              {!formData.slug && formData.name && (
                <p className="text-xs text-gray-500 mt-1">Slug se tu dong tao: {autoGenerateSlug(formData.name, '', undefined).substring(0, 40)}...</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá bán cơ bản (Giá KM)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded p-2" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá gốc (Bỏ trống nếu không giảm)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice || ''} onChange={handleChange} className="w-full border rounded p-2" min="0" />
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Hình ảnh sản phẩm</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {/* Image input for URL or single upload */}
                <input 
                  type="text" 
                  name="image" 
                  value={formData.image} 
                  onChange={handleChange} 
                  className="flex-1 min-w-[200px] border rounded p-2 text-sm" 
                  placeholder="URL ảnh chính (hoặc tải ảnh bên dưới)"
                />
              </div>
              
              {/* Upload buttons */}
              <div className="flex gap-2 mb-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#00483d] text-white rounded hover:bg-[#00382f] transition-colors">
                  <Upload size={18} />
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang tải...
                    </>
                  ) : (
                    'Tải 1 ảnh lên'
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleMainImageUpload} 
                    className="hidden" 
                    accept="image/*"
                    disabled={isUploading}
                  />
                </label>
                
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  <Upload size={18} />
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang tải...
                    </>
                  ) : (
                    'Tải nhiều ảnh'
                  )}
                  <input 
                    type="file" 
                    onChange={handleMultipleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              {/* Multiple images display */}
              {formData.images && formData.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Đã tải {formData.images.length} ảnh:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {formData.images.map((img, index) => (
                      <div 
                        key={index} 
                        className={`relative group border-2 rounded overflow-hidden ${
                          img === formData.image ? 'border-[#00483d] ring-2 ring-[#00483d] ring-offset-1' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Ảnh ${index + 1}`} 
                          className="w-full aspect-square object-cover"
                        />
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {/* Set as main */}
                          {img !== formData.image && (
                            <button
                              type="button"
                              onClick={() => setMainImage(img)}
                              className="p-1.5 bg-white rounded text-xs font-medium hover:bg-gray-100"
                              title="Đặt làm ảnh chính"
                            >
                              ⭐
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                            title="Xóa ảnh"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {/* Main image badge */}
                        {img === formData.image && (
                          <div className="absolute top-1 left-1 bg-[#00483d] text-white text-xs px-1.5 py-0.5 rounded">
                            ⭐ Chính
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Nhấn ⭐ để đặt làm ảnh chính. Nhấn ✕ để xóa.
                  </p>
                </div>
              )}
              
              {(!formData.images || formData.images.length === 0) && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
                  Chưa có ảnh nào. Nhấn "Tải 1 ảnh lên" hoặc "Tải nhiều ảnh" để thêm hình ảnh sản phẩm.
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
                      <label className="block text-xs font-medium mb-1">Số lượng tồn kho</label>
                      <input 
                        type="number" 
                        value={variant.stock || 0} 
                        onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} 
                        className="w-full border rounded p-2 text-sm" 
                        min="0"
                        placeholder="VD: 10"
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
                    <div className="flex items-center lg:col-span-3 gap-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`variant-stock-${index}`} 
                          checked={variant.inStock} 
                          onChange={(e) => handleVariantChange(index, 'inStock', e.target.checked)} 
                          className="mr-2" 
                        />
                        <label htmlFor={`variant-stock-${index}`} className="text-sm font-medium">Còn hàng</label>
                      </div>
                      <div className="flex items-center">
                        <label className="text-xs text-gray-500 mr-2">Tồn kho:</label>
                        <span className={`text-sm font-medium ${variant.stock > 0 ? 'text-green-600' : variant.inStock ? 'text-orange-500' : 'text-red-500'}`}>
                          {variant.stock || 0} sản phẩm
                        </span>
                      </div>
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
