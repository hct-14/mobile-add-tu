import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { Search, Filter } from 'lucide-react';

export default function Products() {
  const products = useProductStore(state => state.products);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Không có sản phẩm nào</h2>
        <p className="text-gray-500">Vui lòng thêm sản phẩm từ trang Admin hoặc import dữ liệu mẫu.</p>
        <Link to="/admin" className="text-[#00483d] hover:underline mt-4 inline-block">
          Đi tới trang Admin
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h1>
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00483d]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00483d] appearance-none bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Tất cả danh mục' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <Link
            key={product.id}
            to={`/product/${product.slug}`}
            className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-md">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <h3 className="font-medium text-sm line-clamp-2 mb-2 h-10">{product.name}</h3>
            <div className="text-red-600 font-bold">{formatPrice(product.variants[0]?.price || product.price)}</div>
            <div className="text-xs text-gray-500 mt-1">{product.category}</div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
}
