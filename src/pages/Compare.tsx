import { Link } from 'react-router-dom';
import { useCompareStore } from '../store/useCompareStore';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Compare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const addItem = useCartStore(state => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (compareItems.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm mt-10">
        <h2 className="text-2xl font-bold mb-4">Chưa có sản phẩm nào để so sánh</h2>
        <p className="text-gray-500 mb-8">Vui lòng chọn sản phẩm để so sánh.</p>
        <Link to="/" className="bg-[#00483d] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00382f] transition-colors inline-block">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Get all unique spec keys from all compared products
  const allSpecKeys = Array.from(
    new Set(compareItems.flatMap(item => Object.keys(item.specs)))
  );

  const reverseCategoryMap: Record<string, string> = {
    'Điện thoại': 'dien-thoai',
    'Laptop': 'laptop',
    'Apple': 'apple',
    'Tablet': 'tablet',
    'Phụ kiện': 'phu-kien',
    'Hàng cũ': 'hang-cu'
  };

  const firstItemCategory = compareItems.length > 0 ? compareItems[0].category : '';
  const categorySlug = reverseCategoryMap[firstItemCategory] || 'dien-thoai';

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-6 min-w-[600px]">
        <h1 className="text-2xl font-bold">So sánh sản phẩm</h1>
        <button 
          onClick={clearCompare}
          className="text-red-600 hover:underline text-sm font-medium"
        >
          Xóa tất cả
        </button>
      </div>

      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="p-4 border w-1/4 bg-gray-50">Thông tin</th>
            {compareItems.map(item => (
              <th key={item.id} className="p-4 border w-1/4 relative align-top">
                <button 
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 mb-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <Link to={`/product/${item.slug}`} className="font-bold text-gray-900 hover:text-[#00483d] mb-2">
                    {item.name}
                  </Link>
                  <div className="text-red-600 font-bold text-lg mb-4">{formatPrice(item.variants[0]?.price || item.price)}</div>
                  <button 
                    onClick={() => addItem(item, item.variants[0])}
                    className="flex items-center justify-center w-full bg-[#00483d] text-white py-2 rounded hover:bg-[#00382f] transition-colors"
                  >
                    <ShoppingCart size={16} className="mr-2" /> Thêm vào giỏ
                  </button>
                </div>
              </th>
            ))}
            {/* Fill empty columns if less than 3 */}
            {Array.from({ length: 3 - compareItems.length }).map((_, idx) => (
              <th key={`empty-${idx}`} className="p-4 border w-1/4 bg-gray-50 text-center text-gray-400 font-normal">
                <Link to={`/category/${categorySlug}?selectForCompare=true`} className="flex flex-col items-center justify-center h-full w-full hover:text-[#00483d] transition-colors">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                    <span className="text-2xl text-gray-400">+</span>
                  </div>
                  Thêm sản phẩm
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allSpecKeys.map(key => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="p-4 border font-medium text-gray-700 bg-gray-50">{key}</td>
              {compareItems.map(item => (
                <td key={`${item.id}-${key}`} className="p-4 border text-sm text-gray-600">
                  {item.specs[key] || '-'}
                </td>
              ))}
              {Array.from({ length: 3 - compareItems.length }).map((_, idx) => (
                <td key={`empty-cell-${idx}`} className="p-4 border"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
