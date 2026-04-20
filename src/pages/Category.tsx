import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCompareStore } from '../store/useCompareStore';
import { Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSelectForCompare = searchParams.get('selectForCompare') === 'true';
  const [loading, setLoading] = useState(true);
  
  const allProducts = useProductStore(state => state.products);
  const addToCompare = useCompareStore(state => state.addToCompare);
  
  const [brandFilter, setBrandFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('default');
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, brandFilter, priceFilter, sortFilter]);

  // Simple mapping for demo
  const categoryMap: Record<string, string> = {
    'dien-thoai': 'Điện thoại',
    'laptop': 'Laptop',
    'apple': 'Apple',
    'tablet': 'Tablet',
    'phu-kien': 'Phụ kiện',
    'hang-cu': 'Hàng cũ'
  };

  const categoryName = slug ? categoryMap[slug] || 'Sản phẩm' : 'Sản phẩm';
  
  let products = allProducts.filter(p => {
    if (slug === 'hang-cu') return p.isUsed;
    if (slug === 'apple') return p.brand === 'Apple';
    return p.category.toLowerCase() === categoryName.toLowerCase();
  });

  // Apply Brand Filter
  if (brandFilter !== 'all') {
    products = products.filter(p => p.brand === brandFilter);
  }

  // Apply Price Filter
  if (priceFilter !== 'all') {
    products = products.filter(p => {
      if (priceFilter === 'under-10') return p.price < 10000000;
      if (priceFilter === '10-20') return p.price >= 10000000 && p.price <= 20000000;
      if (priceFilter === 'over-20') return p.price > 20000000;
      return true;
    });
  }

  // Apply Sorting
  if (sortFilter === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  }

  // Extract unique brands for filter dropdown
  const uniqueBrands = Array.from(new Set(allProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()).map(p => p.brand)));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleProductClick = (e: React.MouseEvent, product: any) => {
    if (isSelectForCompare) {
      e.preventDefault();
      const success = addToCompare(product);
      if (success) {
        toast.success(`Đã thêm ${product.name} để so sánh`);
        navigate('/compare');
      } else {
        toast.error('Các sản phẩm phải cùng danh mục hoặc đã đạt tối đa 3 sản phẩm!');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#00483d]">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{categoryName}</h1>
          {isSelectForCompare && (
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm font-medium">
              Đang chọn sản phẩm để so sánh. Click vào sản phẩm để thêm.
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b">
          <select 
            value={brandFilter} 
            onChange={(e) => setBrandFilter(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#00483d]"
          >
            <option value="all">Tất cả hãng</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <select 
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#00483d]"
          >
            <option value="all">Mọi mức giá</option>
            <option value="under-10">Dưới 10 triệu</option>
            <option value="10-20">10 - 20 triệu</option>
            <option value="over-20">Trên 20 triệu</option>
          </select>
          
          <select 
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#00483d]"
          >
            <option value="default">Sắp xếp</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
                <div className="aspect-square bg-gray-200 animate-pulse rounded-md" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4 mt-auto" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product.id} className={`bg-white rounded-lg p-3 hover:shadow-lg transition-shadow border ${isSelectForCompare ? 'border-blue-200 hover:border-blue-500 cursor-pointer' : 'border-gray-100'} relative group`}>
                {product.discountPercentage && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    Giảm {product.discountPercentage}%
                  </div>
                )}
                {!isSelectForCompare && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCompare(product);
                    }}
                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:text-[#00483d] hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Thêm vào so sánh"
                  >
                    <Scale size={16} />
                  </button>
                )}
                <Link 
                  to={`/product/${product.slug}`} 
                  className="block"
                  onClick={(e) => handleProductClick(e, product)}
                >
                  <div className="aspect-square mb-3 overflow-hidden rounded-md">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 h-10">{product.name}</h3>
                  <div className="flex flex-col">
                    <span className="text-red-600 font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
