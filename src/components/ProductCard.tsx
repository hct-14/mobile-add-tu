import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';
import { Scale } from 'lucide-react';
import { Product } from '../types';
import { useCompareStore } from '../store/useCompareStore';
import { getLowestPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
  activeCampaignProducts?: { productId: string; flashSalePrice: number }[];
  showCompareButton?: boolean;
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  index,
  activeCampaignProducts,
  showCompareButton = true,
  className = '',
}) => {
  const addToCompare = useCompareStore((state) => state.addToCompare);
  
  const campaignProduct = useMemo(() => {
    return activeCampaignProducts?.find(p => p.productId === product.id);
  }, [activeCampaignProducts, product.id]);

  const flashSalePrice = campaignProduct?.flashSalePrice;
  const lowestPrice = useMemo(() => getLowestPrice(product), [product]);
  const actualPrice = flashSalePrice || lowestPrice;
  const basePrice = product.originalPrice && product.originalPrice > 0 
                  ? product.originalPrice 
                  : product.price;
  const discountPercent = flashSalePrice && basePrice > actualPrice
    ? Math.round((basePrice - actualPrice) / basePrice * 100)
    : 0;
  
  const shouldOptimize = index < 3;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCompare(product);
  };

  return (
    <div
      className={`bg-white rounded-lg p-3 hover:shadow-lg transition-shadow border border-gray-100 relative group ${className}`}
    >
      {discountPercent > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discountPercent}%
        </div>
      )}
      
      {showCompareButton && (
        <button
          onClick={handleCompare}
          className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:text-[#00483d] hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Thêm vào so sánh"
        >
          <Scale size={16} />
        </button>
      )}

      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square mb-3 overflow-hidden rounded-md relative">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            loading={shouldOptimize ? "eager" : "lazy"}
            fetchPriority={shouldOptimize ? "high" : "auto"}
            decoding={shouldOptimize ? "sync" : "async"}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex flex-col">
          <span className="text-red-600 font-bold text-base">
            {formatPrice(actualPrice)}
          </span>
          {discountPercent > 0 && (
            <>
              <span className="text-gray-400 text-xs line-through">
                {formatPrice(basePrice)}
              </span>
              <span className="text-red-500 text-[10px] font-medium">
                Giá thị trường
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if product data changes
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.image === nextProps.product.image &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.index === nextProps.index &&
    prevProps.showCompareButton === nextProps.showCompareButton
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
