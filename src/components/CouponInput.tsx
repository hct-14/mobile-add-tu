import { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePromotionStore } from '../store/usePromotionStore';
import { useCouponStore } from '../store/useCouponStore';

interface CouponInputProps {
  productCategory?: string;
  productPrice?: number;
  showAllPromotions?: boolean;
}

export default function CouponInput({ productCategory, productPrice, showAllPromotions = true }: CouponInputProps) {
  const [inputCode, setInputCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const promotions = usePromotionStore(state => state.promotions);
  const { appliedCoupon, setCoupon, clearCoupon } = useCouponStore();

  // Filter active promotions that apply to all places
  const validPromotions = promotions.filter(promo => {
    if (!promo.isActive) return false;
    if (promo.applicableToAll === false) return false; // Only show if applicableToAll is true or undefined
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleApplyCoupon = () => {
    if (!inputCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    const promo = validPromotions.find(p => p.code.toLowerCase() === inputCode.trim().toLowerCase());
    
    if (!promo) {
      toast.error('Mã giảm giá không hợp lệ');
      return;
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount && promo.usedCount >= promo.usageLimit) {
      toast.error('Mã giảm giá đã hết lượt sử dụng');
      return;
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'fixed') {
      discount = promo.discountAmount || 0;
    } else if (promo.discountType === 'percent' && productPrice) {
      discount = Math.floor((productPrice * (promo.discountPercent || 0)) / 100);
    }

    setCoupon(promo.code, discount);
    toast.success(`Áp dụng mã ${promo.code} thành công! Giảm ${formatPrice(discount)}đ`);
    setInputCode('');
  };

  const handleSelectPromotion = (promo: typeof validPromotions[0]) => {
    if (!productPrice && promo.discountType === 'percent') {
      toast.error('Không thể áp dụng mã giảm % khi không có giá sản phẩm');
      return;
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'fixed') {
      discount = promo.discountAmount || 0;
    } else if (promo.discountType === 'percent' && productPrice) {
      discount = Math.floor((productPrice * (promo.discountPercent || 0)) / 100);
    }

    setCoupon(promo.code, discount);
    toast.success(`Áp dụng mã ${promo.code}! Giảm ${formatPrice(discount)}đ`);
    setIsExpanded(false);
  };

  return (
    <div className="border border-orange-200 rounded-lg overflow-hidden mb-6 bg-gradient-to-r from-orange-50 to-yellow-50">
      <div className="bg-orange-100 text-orange-800 font-medium px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={18} />
          Mã giảm giá
        </div>
        {showAllPromotions && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-orange-200 hover:bg-orange-300 px-2 py-1 rounded transition-colors"
          >
            {isExpanded ? 'Thu gọn' : 'Xem tất cả'}
          </button>
        )}
      </div>
      
      <div className="p-4 bg-white">
        {/* Applied coupon display */}
        {appliedCoupon && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-600" />
              <span className="font-medium text-green-700">{appliedCoupon.code}</span>
              <span className="text-green-600">- {formatPrice(appliedCoupon.discount)}đ</span>
            </div>
            <button 
              onClick={clearCoupon}
              className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input section */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-[#00483d] hover:bg-[#00382f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Áp dụng
          </button>
        </div>

        {/* All promotions list */}
        {isExpanded && validPromotions.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs text-gray-500 font-medium">Mã giảm giá có sẵn:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {validPromotions.map(promo => (
                <div 
                  key={promo.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    appliedCoupon?.code === promo.code 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-200 hover:border-[#00483d] cursor-pointer'
                  }`}
                  onClick={() => appliedCoupon?.code !== promo.code && handleSelectPromotion(promo)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-[#00483d]">{promo.code}</span>
                      <p className="text-xs text-gray-600 mt-1">{promo.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600">
                        {promo.discountType === 'percent' 
                          ? `-${promo.discountPercent}%` 
                          : `-${formatPrice(promo.discountAmount || 0)}đ`
                        }
                      </span>
                      {appliedCoupon?.code === promo.code && (
                        <Check size={16} className="text-green-600 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
