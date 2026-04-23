import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { usePromotionStore } from '../store/usePromotionStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const addOrder = useOrderStore(state => state.addOrder);
  const promotions = usePromotionStore(state => state.promotions);
  const incrementProductOrder = useAnalyticsStore(state => state.incrementProductOrder);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
    deliveryMethod: 'store' as 'store' | 'home',
  });
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'phone') {
      // Allow only numbers
      const value = e.target.value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [e.target.name]: value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleDeliveryMethodChange = (method: 'store' | 'home') => {
    setFormData({ ...formData, deliveryMethod: method });
  };

  const handleApplyCoupon = () => {
    const promo = promotions.find(p => p.code === couponCode && p.isActive);
    if (!promo) {
      alert('Mã giảm giá không hợp lệ hoặc đã tắt.');
      setAppliedDiscount(0);
      return;
    }

    const now = new Date().getTime();

    if (promo.startDate && new Date(promo.startDate).getTime() > now) {
      alert(`Mã giảm giá chỉ có hiệu lực từ ${new Date(promo.startDate).toLocaleString('vi-VN')}.`);
      setAppliedDiscount(0);
      return;
    }

    if (promo.endDate && new Date(promo.endDate).getTime() < now) {
      alert('Mã giảm giá đã hết hạn.');
      setAppliedDiscount(0);
      return;
    }

    if (promo.usageLimit && promo.usedCount && promo.usedCount >= promo.usageLimit) {
      alert('Mã giảm giá đã hết lượt sử dụng.');
      setAppliedDiscount(0);
      return;
    }

    if (promo.applicableCategories && promo.applicableCategories.length > 0) {
      const hasApplicableItem = items.some(item => promo.applicableCategories?.includes(item.product.category));
      if (!hasApplicableItem) {
        alert('Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng.');
        setAppliedDiscount(0);
        return;
      }
    }

    const cartTotal = getTotal();
    if (promo.minOrderValue && cartTotal < promo.minOrderValue) {
      alert(`Đơn hàng chưa đạt giá trị tối thiểu ${formatPrice(promo.minOrderValue)} để áp dụng mã này.`);
      setAppliedDiscount(0);
      return;
    }

    let discount = 0;
    if (promo.discountType === 'percent') {
      discount = cartTotal * ((promo.discountPercent || 0) / 100);
    } else {
      discount = promo.discountAmount || 0;
    }

    setAppliedDiscount(discount);
    alert('Áp dụng mã giảm giá thành công!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTotal = Math.max(0, getTotal() - appliedDiscount);
    
    try {
      await addOrder({
        id: Date.now().toString(),
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.deliveryMethod === 'home' ? formData.address : 'Nhận tại cửa hàng',
        deliveryMethod: formData.deliveryMethod,
        note: formData.note,
        items: items.map(item => {
          // Track order analytics
          incrementProductOrder(item.product.id, item.quantity);
          
          return {
            productId: item.product.id,
            productName: item.product.name,
            variantId: item.variant.id,
            variantColor: item.variant.color,
            variantStorage: item.variant.storage,
            variantRam: item.variant.ram,
            variantCondition: item.variant.condition,
            priceAtOrder: item.variant.price,
            quantity: item.quantity,
            productImage: item.product.image,
            variantImage: item.variant.image
          };
        }),
        total: finalTotal,
        promotionCode: appliedDiscount > 0 ? couponCode : undefined,
        discountAmount: appliedDiscount > 0 ? appliedDiscount : undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      if (appliedDiscount > 0 && couponCode) {
        const promo = promotions.find(p => p.code === couponCode);
        if (promo) {
          usePromotionStore.getState().incrementUsedCount(promo.id);
        }
      }

      toast.success('Đặt hàng thành công!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Đặt hàng</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Thông tin nhận hàng</h2>
              
              <div className="flex gap-4 mb-6">
                <label className={`flex-1 border rounded-lg p-4 cursor-pointer flex items-center gap-3 ${formData.deliveryMethod === 'store' ? 'border-[#00483d] bg-[#00483d]/5' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="deliveryMethod" 
                    checked={formData.deliveryMethod === 'store'}
                    onChange={() => handleDeliveryMethodChange('store')}
                    className="w-4 h-4 text-[#00483d]"
                  />
                  <span className="font-medium">Nhận tại cửa hàng</span>
                </label>
                <label className={`flex-1 border rounded-lg p-4 cursor-pointer flex items-center gap-3 ${formData.deliveryMethod === 'home' ? 'border-[#00483d] bg-[#00483d]/5' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="deliveryMethod" 
                    checked={formData.deliveryMethod === 'home'}
                    onChange={() => handleDeliveryMethodChange('home')}
                    className="w-4 h-4 text-[#00483d]"
                  />
                  <span className="font-medium">Giao hàng tận nơi</span>
                </label>
              </div>

              <div className="space-y-4">
                {formData.deliveryMethod === 'home' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng *</label>
                    <input 
                      type="text" 
                      name="address"
                      required={formData.deliveryMethod === 'home'}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
                      placeholder="Nhập địa chỉ nhận hàng"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea 
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
                    placeholder="Ghi chú thêm về đơn hàng"
                  ></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="md:col-span-5">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Thông tin đơn hàng</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="flex gap-3">
                  <div className="w-16 h-16 border rounded bg-white flex-shrink-0">
                    <img src={item.variant.image || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium line-clamp-2">{item.product.name}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      {item.variant.color} 
                      {item.variant.storage ? ` - ${item.variant.storage}` : ''}
                      {item.variant.ram ? ` - ${item.variant.ram}` : ''}
                    </div>
                    {item.variant.condition && (
                      <div className="text-gray-500 text-xs mt-0.5">Tình trạng: {item.variant.condition}</div>
                    )}
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600">SL: {item.quantity}</span>
                      <span className="font-bold text-red-600">{formatPrice(item.variant.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
                  placeholder="Nhập mã giảm giá"
                />
                <button 
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bold text-base">Tổng cộng:</span>
                <span className="font-bold text-2xl text-red-600">
                  {formatPrice(Math.max(0, getTotal() - appliedDiscount))}
                </span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg mt-6 hover:bg-red-700 transition-colors"
            >
              ĐẶT HÀNG
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Bằng cách đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
