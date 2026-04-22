import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useBannerStore } from '../store/useBannerStore';
import { useCampaignStore } from '../store/useCampaignStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useCompareStore } from '../store/useCompareStore';
import { Scale } from 'lucide-react';

export default function Home() {
  const products = useProductStore(state => state.products);
  const banners = useBannerStore(state => state.banners);
  const getActiveCampaign = useCampaignStore(state => state.getActiveCampaign);
  const categories = useCategoryStore(state => state.categories);
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

  const heroBanner = banners.find(b => b.type === 'hero');
  const subBanners = banners.filter(b => b.type === 'sub').slice(0, 2);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {heroBanner && (
          <Link to={heroBanner.link} className="md:col-span-2 bg-gray-200 rounded-xl overflow-hidden aspect-[2/1] relative block">
            <img 
              src={heroBanner.imageUrl} 
              alt={heroBanner.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{heroBanner.title}</h2>
              <p className="text-lg">{heroBanner.subtitle}</p>
            </div>
          </Link>
        )}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {subBanners.map(banner => (
            <Link key={banner.id} to={banner.link} className="bg-gray-200 rounded-xl overflow-hidden aspect-[2/1] relative block">
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold">{banner.title}</h3>
                <p className="text-sm">{banner.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Sale */}
      {activeCampaign && activeCampaign.products.length > 0 && (
        <section className="bg-red-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">⚡</span> {activeCampaign.name}
            </h2>
            <div className="text-white font-medium bg-black/20 px-3 py-1 rounded-full text-xs md:text-sm">
              Kết thúc trong: {timeLeft}
            </div>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
            {activeCampaign.products.map((campaignProduct) => {
              const product = products.find(p => p.id === campaignProduct.productId);
              if (!product) return null;
              
              const discountPercent = Math.round((1 - campaignProduct.flashSalePrice / product.price) * 100);

              return (
                <div key={product.id} className="bg-white rounded-lg p-2 md:p-3 hover:shadow-lg transition-shadow border border-gray-100 relative min-w-[30%] max-w-[30%] md:min-w-[200px] md:w-[200px] snap-start shrink-0 group">
                  {discountPercent > 0 && (
                    <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded z-10">
                      Giảm {discountPercent}%
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCompare(product);
                    }}
                    className="absolute top-1 right-1 md:top-2 md:right-2 bg-white/80 p-1 md:p-1.5 rounded-full text-gray-600 hover:text-[#00483d] hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Thêm vào so sánh"
                  >
                    <Scale size={12} className="md:size-4" />
                  </button>
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="aspect-square mb-2 md:mb-3 overflow-hidden rounded-md">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h3 className="font-medium text-xs md:text-sm text-gray-800 line-clamp-2 mb-1 md:mb-2 h-8 md:h-10">{product.name}</h3>
                    <div className="flex flex-col">
                      <span className="text-red-600 font-bold text-sm md:text-lg">{formatPrice(campaignProduct.flashSalePrice)}</span>
                      <span className="text-gray-400 text-[10px] md:text-sm line-through">{formatPrice(product.price)}</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold mb-4 uppercase text-gray-800">Danh mục nổi bật</h2>
        <div className="flex flex-wrap justify-center gap-2 md:grid md:grid-cols-5 lg:grid-cols-8 md:gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="w-[15%] md:w-auto bg-white rounded-xl p-1 md:p-8 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-8 h-8 md:w-20 md:h-20 bg-gray-100 rounded-full mb-1 md:mb-6 flex items-center justify-center text-xs md:text-4xl">
                {cat.icon || '📁'}
              </div>
              <span className="text-[9px] md:text-lg font-medium md:font-semibold text-gray-700 md:text-gray-800 h-6 md:h-14 flex items-center justify-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Products */}
      <section className="mb-10">
        <h2 className="text-xl font-bold uppercase text-gray-800 mb-4">Tất cả sản phẩm</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg p-3 hover:shadow-lg transition-shadow border border-gray-100 relative group">
              {product.discountPercentage && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  Giảm {product.discountPercentage}%
                </div>
              )}
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
      </section>

      {/* Categories Grouped (Optional: If user still wants to see grouped by category) */}
      {categories.map((category) => {
        const categoryProducts = products.filter(p => p.category?.trim().toLowerCase() === category.name?.trim().toLowerCase());
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-700">{category.name}</h2>
              <Link to={`/category/${category.slug}`} className="text-[#00483d] hover:underline text-sm font-medium">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categoryProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="bg-white rounded-lg p-3 border border-gray-100">
                  <Link to={`/product/${product.slug}`} className="block">
                     <div className="aspect-square mb-2 overflow-hidden rounded-md">
                       <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                     </div>
                     <h3 className="font-medium text-sm text-gray-800 line-clamp-1">{product.name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
