import React, { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useCampaignStore } from '../store/useCampaignStore';
import { useCompareStore } from '../store/useCompareStore';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { getLowestPrice } from '../lib/utils';

export default function Campaign() {
  const products = useProductStore(state => state.products);
  const getActiveCampaign = useCampaignStore(state => state.getActiveCampaign);
  const addToCompare = useCompareStore(state => state.addToCompare);
  
  const activeCampaign = getActiveCampaign();
  
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!activeCampaign) return;

    const calculateTimeLeft = () => {
      const difference = new Date(activeCampaign.endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        let timeString = '';
        if (days > 0) timeString += `${days} ngày `;
        timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeLeft(timeString);
      } else {
        setTimeLeft('Đã kết thúc');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activeCampaign]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!activeCampaign) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Chỉnh sửa lúc này chưa có chương trình khuyến mãi nào đang diễn ra</h2>
        <Link to="/" className="text-[#db1c32] hover:underline">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-red-600 rounded-xl p-6 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center">
          <span className="mr-3">⚡</span> {activeCampaign.name}
        </h1>
        <div className="inline-block bg-black/20 px-6 py-2 rounded-full md:text-lg font-medium">
          Thời gian còn lại: {timeLeft}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeCampaign.products.map((campaignProduct) => {
          const product = products.find(p => p.id === campaignProduct.productId);
          if (!product) return null;

          const basePrice = product.originalPrice && product.originalPrice > 0 
            ? product.originalPrice 
            : product.price;
          const discountPercent = basePrice > campaignProduct.flashSalePrice
            ? Math.round((basePrice - campaignProduct.flashSalePrice) / basePrice * 100)
            : 0;
          const savings = basePrice - campaignProduct.flashSalePrice;

          return (
            <div key={product.id} className="bg-white rounded-lg p-3 hover:shadow-lg transition-shadow border border-gray-100 relative group">
              {discountPercent > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  -{discountPercent}%
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCompare(product);
                }}
                className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:text-[#db1c32] hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Thêm vào so sánh"
              >
                <Scale size={16} />
              </button>
              <Link to={`/product/${product.slug}`} className="block">
                <div className="aspect-square mb-3 overflow-hidden rounded-md">
                  <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 h-10">{product.name}</h3>
                <div className="flex flex-col">
                  <span className="text-red-600 font-bold text-lg">{formatPrice(campaignProduct.flashSalePrice)}</span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-gray-400 text-sm line-through">{formatPrice(basePrice)}</span>
                      <span className="text-red-500 text-xs font-medium">Giá thị trường</span>
                    </>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-green-600 text-xs font-medium">Tiết kiệm {formatPrice(savings)}</span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
