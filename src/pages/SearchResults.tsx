import { useSearchParams, Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCompareStore } from '../store/useCompareStore';
import { Scale } from 'lucide-react';
import Fuse from 'fuse.js';
import { useMemo } from 'react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const allProducts = useProductStore(state => state.products);
  const addToCompare = useCompareStore(state => state.addToCompare);
  
  const products = useMemo(() => {
    if (!query) return allProducts;
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allProducts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#00483d]">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Kết quả tìm kiếm cho: "{query}"</span>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
        <h1 className="text-2xl font-bold mb-6">Kết quả tìm kiếm: {products.length} sản phẩm</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}".
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-3 hover:shadow-lg transition-shadow border border-gray-100 relative group">
                {product.discountPercentage && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    Giảm {product.discountPercentage}%
                  </div>
                )}
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
                <Link to={`/product/${product.slug}`} className="block">
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
