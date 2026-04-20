import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ChevronLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-hot-toast';
import CouponInput from '../components/CouponInput';
import { useCouponStore } from '../store/useCouponStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const navigate = useNavigate();
  const { appliedCoupon } = useCouponStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const subtotal = getTotal();
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const handleRemove = (productId: string, variantId: string) => {
    removeItem(productId, variantId);
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleUpdateQuantity = (productId: string, variantId: string, quantity: number) => {
    updateQuantity(productId, variantId, quantity);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-8">Hãy chọn thêm sản phẩm để mua sắm nhé!</p>
        <Link to="/" className="bg-[#00483d] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00382f] transition-colors inline-block">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/" className="text-[#00483d] hover:underline flex items-center text-sm font-medium">
          <ChevronLeft size={16} className="mr-1" /> Mua thêm sản phẩm khác
        </Link>
        <h1 className="text-2xl font-bold ml-auto">Giỏ hàng của bạn</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 md:p-6">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.variant.id}`} className="flex flex-col md:flex-row py-4 border-b last:border-0 gap-4">
              <div className="w-24 h-24 flex-shrink-0 border rounded-md overflow-hidden bg-white">
                <img src={item.variant.image || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/product/${item.product.slug}`} className="font-bold text-gray-900 hover:text-[#00483d]">
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      Phiên bản: {item.variant.color} 
                      {item.variant.storage ? ` - ${item.variant.storage}` : ''}
                      {item.variant.ram ? ` - ${item.variant.ram}` : ''}
                    </div>
                    {item.variant.condition && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Tình trạng: {item.variant.condition}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(item.product.id, item.variant.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => handleUpdateQuantity(item.product.id, item.variant.id, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-gray-100 text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-bold text-lg">{formatPrice(item.variant.price)}</div>
                    {item.product.originalPrice && (
                      <div className="text-gray-400 text-sm line-through">{formatPrice(item.product.originalPrice)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Coupon Input Section */}
        <CouponInput showAllPromotions={true} />
        
        <div className="bg-gray-50 p-4 md:p-6 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Tạm tính ({items.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm):</span>
            <span className="font-bold text-xl">{formatPrice(subtotal)}</span>
          </div>
          
          {appliedCoupon && (
            <div className="flex justify-between items-center mb-4 text-green-600">
              <span className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">{appliedCoupon.code}</span>
                Giảm giá:
              </span>
              <span className="font-bold">-{formatPrice(discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-medium text-green-600">Miễn phí</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
            <span className="font-bold text-lg">Tổng tiền:</span>
            <span className="font-bold text-2xl text-red-600">{formatPrice(total)}</span>
          </div>
          
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors text-lg"
          >
            TIẾN HÀNH ĐẶT HÀNG
          </button>
        </div>
      </div>
    </div>
  );
}
