import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Plus, Trash2, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Product, ProductImage } from '../../types';
import { toast } from 'react-hot-toast';

const MAX_IMAGE_SIZE_KB = 800;

async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas error'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.85;
        const tryCompress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeKB = Math.round((dataUrl.split(',')[1]?.length || 0) * 0.75 / 1024);
          
          if (sizeKB <= MAX_IMAGE_SIZE_KB || quality <= 0.4) {
            resolve(dataUrl);
          } else {
            quality -= 0.1;
            tryCompress();
          }
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

interface BatchProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (products: Product[]) => void;
  categories: string[];
}

interface ProductFormData {
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  description: string;
  stock: number;
  image: string;
  imagePath: string;
  images: ProductImage[];
}

export default function BatchProductModal({ isOpen, onClose, onSave, categories }: BatchProductModalProps) {
  const [products, setProducts] = useState<ProductFormData[]>([
    createEmptyProduct()
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  function createEmptyProduct(): ProductFormData {
    return {
      name: '',
      price: 0,
      originalPrice: 0,
      category: categories[0] || 'Điện thoại',
      brand: '',
      description: '',
      stock: 0,
      image: '',
      imagePath: '',
      images: []
    };
  }

  const handleAddProduct = () => {
    setProducts([...products, createEmptyProduct()]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index: number, field: keyof ProductFormData, value: string | number) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleImageUpload = async (productIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingIndex(productIndex);
    try {
      const uploadedImages: ProductImage[] = [];
      for (const file of files) {
        const dataUrl = await processImageFile(file);
        uploadedImages.push({ url: dataUrl, path: 'base64' });
      }

      const updated = [...products];
      const newImages = [...updated[productIndex].images, ...uploadedImages];
      updated[productIndex] = { 
        ...updated[productIndex], 
        images: newImages,
        image: updated[productIndex].image || uploadedImages[0]?.url || '',
        imagePath: 'base64'
      };
      setProducts(updated);
      toast.success(`Đã tải lên ${files.length} ảnh!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải ảnh lên!');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (productIndex: number, imgIndex: number) => {
    const updated = [...products];
    const newImages = updated[productIndex].images.filter((_, i) => i !== imgIndex);
    updated[productIndex] = { 
      ...updated[productIndex], 
      images: newImages,
      image: newImages[0] || ''
    };
    setProducts(updated);
  };

  const setMainImage = (productIndex: number, imgUrl: string) => {
    const updated = [...products];
    updated[productIndex] = { ...updated[productIndex], image: imgUrl };
    setProducts(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Vui lòng tải lên file Excel hoặc CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('File không có dữ liệu hoặc thiếu header');
          return;
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Find column indices
        const nameIdx = header.findIndex(h => h.includes('tên') || h.includes('name'));
        const priceIdx = header.findIndex(h => h.includes('giá') || h.includes('price'));
        const origPriceIdx = header.findIndex(h => h.includes('giá gốc') || h.includes('original'));
        const categoryIdx = header.findIndex(h => h.includes('danh mục') || h.includes('category'));
        const brandIdx = header.findIndex(h => h.includes('thương') || h.includes('brand'));
        const descIdx = header.findIndex(h => h.includes('mô tả') || h.includes('description'));
        const stockIdx = header.findIndex(h => h.includes('số lượng') || h.includes('stock'));

        if (nameIdx === -1 || priceIdx === -1) {
          toast.error('File phải có cột Tên và Giá sản phẩm');
          return;
        }

        const newProducts: ProductFormData[] = [];
        const newErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          
          const name = cols[nameIdx] || '';
          const price = parseFloat(cols[priceIdx]) || 0;
          
          if (!name) continue;

          newProducts.push({
            name,
            price,
            originalPrice: origPriceIdx !== -1 ? parseFloat(cols[origPriceIdx]) || 0 : 0,
            category: categoryIdx !== -1 ? cols[categoryIdx] : categories[0] || 'Điện thoại',
            brand: brandIdx !== -1 ? cols[brandIdx] : '',
            description: descIdx !== -1 ? cols[descIdx] : '',
            stock: stockIdx !== -1 ? parseInt(cols[stockIdx]) || 0 : 0
          });
        }

        if (newProducts.length > 0) {
          setProducts(newProducts);
          toast.success(`Đã đọc ${newProducts.length} sản phẩm từ file`);
        } else {
          toast.error('Không tìm thấy sản phẩm nào trong file');
        }
      } catch (error) {
        console.error('Parse error:', error);
        toast.error('Lỗi khi đọc file. Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    // Validate
    const errorList: string[] = [];
    products.forEach((p, i) => {
      if (!p.name.trim()) {
        errorList.push(`Sản phẩm #${i + 1}: Tên không được để trống`);
      }
      if (p.price <= 0) {
        errorList.push(`Sản phẩm #${i + 1}: Giá phải lớn hơn 0`);
      }
    });

    if (errorList.length > 0) {
      setErrors(errorList);
      return;
    }

    // Convert to Product objects
    const productList: Product[] = products.map((p, index) => ({
      id: Date.now().toString() + index,
      name: p.name,
      slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      image: p.image || '',
      imagePath: p.imagePath || '',
      images: p.images,
      category: p.category,
      brand: p.brand,
      description: p.description,
      inStock: p.stock > 0,
      stock: p.stock,
      specs: {},
      variants: [
        {
          id: Date.now().toString() + index + '-v1',
          color: 'Mặc định',
          price: p.price,
          inStock: p.stock > 0,
          stock: p.stock
        }
      ]
    }));

    onSave(productList);
    toast.success(`Đã thêm ${productList.length} sản phẩm!`);
    onClose();
    setProducts([createEmptyProduct()]);
    setErrors([]);
  };

  const handleDownloadTemplate = () => {
    const template = `Tên sản phẩm,Giá bán,Giá gốc,Danh mục,Thương hiệu,Mô tả,Số lượng
iPhone 15 Pro Max,34990000,39990000,Điện thoại,Apple,Điện thoại iPhone 15 Pro Max 256GB,10
Samsung Galaxy S24 Ultra,28990000,32990000,Điện thoại,Samsung,Điện thoại Samsung Galaxy S24 Ultra,15`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_san_pham.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto py-10"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-6xl my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Thêm nhiều sản phẩm</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <p className="font-medium text-blue-800 mb-2">Tải lên từ file Excel/CSV</p>
              <p className="text-sm text-blue-600 mb-3">Hỗ trợ file .csv, .xlsx, .xls. File phải có cột Tên và Giá bán.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileSpreadsheet size={18} />
                Tải mẫu CSV
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload size={18} />
                Tải file lên
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle size={18} />
              Vui lòng sửa các lỗi sau:
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Product List */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700">
              Danh sách sản phẩm ({products.length})
            </p>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#00483d] text-white rounded-lg hover:bg-[#00382f] transition-colors text-sm"
            >
              <Plus size={16} />
              Thêm sản phẩm
            </button>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 rounded-lg p-3 text-sm font-medium text-gray-600">
            <div className="col-span-3">Tên sản phẩm</div>
            <div className="col-span-2">Giá bán</div>
            <div className="col-span-1">SL</div>
            <div className="col-span-2">Danh mục</div>
            <div className="col-span-2">Ảnh</div>
            <div className="col-span-2"></div>
          </div>

          {/* Product Rows */}
          {products.map((product, index) => (
            <div 
              key={index}
              className="bg-white border rounded-lg p-4 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="VD: iPhone 15 Pro Max"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Giá bán</label>
                  <input
                    type="number"
                    value={product.price || ''}
                    onChange={(e) => handleChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-gray-500 mb-1 block">SL</label>
                  <input
                    type="number"
                    value={product.stock || ''}
                    onChange={(e) => handleChange(index, 'stock', parseInt(e.target.value) || 0)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Danh mục</label>
                  <select
                    value={product.category}
                    onChange={(e) => handleChange(index, 'category', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs text-gray-500 mb-1 block">Ảnh ({product.images.length})</label>
                  <div className="flex flex-wrap gap-1">
                    {product.images.slice(0, 3).map((img, imgIdx) => (
                      <div key={imgIdx} className="relative w-10 h-10 border rounded overflow-hidden group">
                        <img src={typeof img === 'string' ? img : img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index, imgIdx)}
                          className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {product.images.length > 3 && (
                      <div className="w-10 h-10 border rounded bg-gray-100 flex items-center justify-center text-xs">
                        +{product.images.length - 3}
                      </div>
                    )}
                    <label className="w-10 h-10 border-2 border-dashed border-gray-300 rounded cursor-pointer flex items-center justify-center hover:border-[#00483d] transition-colors">
                      {uploadingIndex === index ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <Plus size={16} className="text-gray-400" />
                      )}
                      <input 
                        ref={(el) => { fileInputRefs.current[index] = el; }}
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                        disabled={uploadingIndex === index}
                      />
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    disabled={products.length === 1}
                    className={`w-full p-2 rounded transition-colors ${products.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
              
              {/* Expanded fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Giá gốc (tùy chọn)</label>
                  <input
                    type="number"
                    value={product.originalPrice || ''}
                    onChange={(e) => handleChange(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Thương hiệu</label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => handleChange(index, 'brand', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="VD: Apple, Samsung"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={product.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Mô tả ngắn về sản phẩm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-[#00483d] text-white rounded-lg hover:bg-[#00382f] transition-colors"
          >
            <Save size={18} />
            Lưu {products.length} sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
