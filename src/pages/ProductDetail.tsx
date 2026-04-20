import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Shield, Truck, RotateCcw, Star, PlusSquare, Facebook, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useCompareStore } from '../store/useCompareStore';
import { useUserStore } from '../store/useUserStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import CouponInput from '../components/CouponInput';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const products = useProductStore(state => state.products);
  const addReview = useProductStore(state => state.addReview);
  const deleteReview = useProductStore(state => state.deleteReview);
  const product = products.find((p) => p.slug === slug);
  const addItem = useCartStore((state) => state.addItem);
  const addToCompare = useCompareStore(state => state.addToCompare);
  const user = useUserStore(state => state.user);
  const incrementProductView = useAnalyticsStore(state => state.incrementProductView);
  const settings = useSettingsStore(state => state.settings);

  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]);
  const [activeImage, setActiveImage] = useState(product?.variants[0]?.image || product?.images[0]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    if (product) {
      incrementProductView(product.id);
    }
  }, [product, incrementProductView]);

  useEffect(() => {
    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    } else if (product?.images[0]) {
      setActiveImage(product.images[0]);
    }
  }, [selectedVariant, product]);

  if (!product || !selectedVariant) {
    return <div className="text-center py-20">Sản phẩm không tồn tại</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = () => {
    // Check stock before adding
    if (selectedVariant.stock === 0 || !selectedVariant.inStock) {
      toast.error('Sản phẩm này đã hết hàng!');
      return;
    }
    addItem(product, selectedVariant);
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    // Check stock before adding
    if (selectedVariant.stock === 0 || !selectedVariant.inStock) {
      toast.error('Sản phẩm này đã hết hàng!');
      return;
    }
    addItem(product, selectedVariant);
    navigate('/cart');
  };

  const handleCompare = () => {
    const success = addToCompare(product);
    if (success) {
      toast.success('Đã thêm vào danh sách so sánh');
      navigate('/compare');
    } else {
      toast.error('Các sản phẩm phải cùng danh mục hoặc đã đạt tối đa 3 sản phẩm!');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (!reviewText.trim()) return;
    
    addReview(product.id, {
      id: Date.now().toString(),
      userName: user.name,
      rating: reviewRating,
      comment: reviewText,
      createdAt: new Date().toISOString()
    });
    setReviewText('');
    setReviewRating(5);
    toast.success('Đã gửi đánh giá thành công!');
  };

  const averageRating = product.reviews && product.reviews.length > 0
    ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1))
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
        <div className="mb-4 pb-4 border-b flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <span className="mr-4">Thương hiệu: <span className="text-blue-600 font-medium">{product.brand}</span></span>
              <span className="mr-4">SKU: {product.id}-{selectedVariant.id}</span>
              {averageRating > 0 && (
                <div className="flex items-center text-yellow-500">
                  <Star fill="currentColor" size={16} className="mr-1" />
                  <span className="font-medium text-gray-700">{averageRating}</span>
                  <span className="text-gray-400 ml-1">({product.reviews?.length || 0} đánh giá)</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleCompare}
            className="flex items-center text-sm text-[#00483d] hover:underline font-medium border border-[#00483d] px-3 py-1.5 rounded-md"
          >
            <PlusSquare size={16} className="mr-1" /> So sánh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Images */}
          <div className="md:col-span-4">
            <div className="aspect-square rounded-xl overflow-hidden border mb-4">
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 ${activeImage === img ? 'border-[#00483d]' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Product Description Section */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-bold mb-4">Mô tả sản phẩm</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description || 'Đang cập nhật mô tả cho sản phẩm này...'}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-5 flex flex-col">
            <div className="flex items-end gap-4 mb-6">
              <span className="text-3xl font-bold text-red-600">{formatPrice(selectedVariant.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Variants */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Chọn phiên bản:</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`border rounded-lg p-3 text-left relative flex items-center gap-3 ${
                      selectedVariant.id === variant.id 
                        ? 'border-[#00483d] bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {variant.image && (
                      <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0 bg-white">
                        <img src={variant.image} alt={variant.color} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {variant.color} 
                        {variant.storage ? ` - ${variant.storage}` : ''}
                        {variant.ram ? ` - ${variant.ram}` : ''}
                      </div>
                      {variant.condition && (
                        <div className="text-xs text-gray-500 mt-0.5">Tình trạng: {variant.condition}</div>
                      )}
                      <div className="text-red-600 font-bold mt-1">{formatPrice(variant.price)}</div>
                      {variant.stock > 0 ? (
                        <div className="text-xs text-green-600 mt-1">Còn {variant.stock} sản phẩm</div>
                      ) : (
                        <div className="text-xs text-red-500 mt-1">Hết hàng</div>
                      )}
                    </div>
                    {selectedVariant.id === variant.id && (
                      <div className="absolute top-0 right-0 bg-[#00483d] text-white rounded-bl-lg rounded-tr-lg p-1">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Promotions */}
            {/* {product.offers && product.offers.length > 0 && (
              <div className="border border-green-200 rounded-lg overflow-hidden mb-6">
                <div className="bg-green-100 text-green-800 font-medium px-4 py-2 flex items-center">
                  🎁 Khuyến mãi & Ưu đãi
                </div>
                <div className="p-4 bg-white text-sm space-y-2">
                  {product.offers.map((offer, index) => (
                    <p key={index} className="flex items-start">
                      <Check size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" /> 
                      {offer}
                    </p>
                  ))}
                </div>
              </div>
            )} */}

            {/* Coupon Input */}
            <CouponInput productCategory={product.category} productPrice={selectedVariant?.price || product.price} />

            {/* Contact Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <a 
                href={settings.facebookUrl || "https://facebook.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors font-medium text-sm"
              >
                <Facebook size={18} />
                Tư vấn Facebook
              </a>
              <a 
                href={settings.zaloUrl || "https://zalo.me"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0068FF] text-white hover:bg-[#005ae6] transition-colors font-medium text-sm"
              >
                <MessageCircle size={18} />
                Tư vấn Zalo
              </a>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-auto">
              {selectedVariant.stock > 0 && selectedVariant.inStock ? (
                <>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex flex-col items-center justify-center transition-colors"
                  >
                    <span>MUA NGAY</span>
                    <span className="text-xs font-normal">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    className="w-16 flex items-center justify-center border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <ShoppingCart size={24} />
                  </button>
                </>
              ) : (
                <button 
                  disabled
                  className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex flex-col items-center justify-center cursor-not-allowed"
                >
                  <span>HẾT HÀNG</span>
                  <span className="text-xs font-normal">Vui lòng chọn sản phẩm khác</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar - Policies & Specs */}
          <div className="md:col-span-3 space-y-6">
            <div className="border rounded-lg p-4 space-y-4 text-sm">
              <div className="flex items-start">
                <Shield className="text-[#00483d] mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Bảo hành chính hãng</p>
                  <p className="text-gray-500">12 tháng tại trung tâm bảo hành ủy quyền</p>
                </div>
              </div>
              <div className="flex items-start">
                <RotateCcw className="text-[#00483d] mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Đổi trả dễ dàng</p>
                  <p className="text-gray-500">1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ NSX</p>
                </div>
              </div>
              <div className="flex items-start">
                <Truck className="text-[#00483d] mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Giao hàng miễn phí</p>
                  <p className="text-gray-500">Cho đơn hàng trên 500.000đ</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 font-medium border-b">
                Thông số kỹ thuật
              </div>
              <div className="p-4 text-sm">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-2 text-gray-600 w-1/3">{key}</td>
                        <td className="py-2 px-2 font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Đánh giá sản phẩm</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Viết đánh giá của bạn</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Đánh giá sao:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star fill={star <= reviewRating ? 'currentColor' : 'none'} size={24} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Nhận xét:</label>
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
                    rows={3}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#00382f] transition-colors"
                >
                  Gửi đánh giá
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Vui lòng đăng nhập để viết đánh giá cho sản phẩm này.</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#00382f] inline-block font-medium"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-4">Các đánh giá ({product.reviews?.length || 0})</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {!product.reviews || product.reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              ) : (
                product.reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0 relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{review.userName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                                deleteReview(product.id, review.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Xóa đánh giá"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} fill={star <= review.rating ? 'currentColor' : 'none'} size={14} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Gợi ý sản phẩm tương tự</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products
            .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
            .slice(0, 4)
            .map(p => (
              <div 
                key={p.id} 
                className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                onClick={() => navigate(`/product/${p.slug}`)}
              >
                <div className="aspect-square mb-3">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{p.name}</h3>
                <div className="text-red-600 font-bold mb-2">
                  {formatPrice(p.variants[0]?.price || 0)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
