import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useBannerStore } from "../store/useBannerStore";
import { useCampaignStore } from "../store/useCampaignStore";
import { useCategoryStore } from "../store/useCategoryStore";
import { useCompareStore } from "../store/useCompareStore";
import { Scale } from "lucide-react";
import { getLowestPrice } from "../lib/utils";
import { ImageWithFallback, LazyImage } from "../components/ImageWithFallback";
import { LazySection } from "../components/LazySection";
import {
  Skeleton,
  SkeletonProductCard,
  SkeletonBanner,
  SkeletonCategories,
  SkeletonProductGrid,
} from "../components/SkeletonLoader";

export default function Home() {
  const { products, isLoading: isProductsLoading } = useProductStore();
  const banners = useBannerStore((state) => state.banners);
  const getActiveCampaign = useCampaignStore(
    (state) => state.getActiveCampaign,
  );
  const { categories, isLoading: isCategoriesLoading } = useCategoryStore();
  const addToCompare = useCompareStore((state) => state.addToCompare);

  const activeCampaign = getActiveCampaign();

  const [timeLeft, setTimeLeft] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isLoading = isProductsLoading || isCategoriesLoading;

  useEffect(() => {
    if (!activeCampaign) return;

    const calculateTimeLeft = () => {
      const difference =
        new Date(activeCampaign.endDate).getTime() - new Date().getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        let timeString = "";
        if (days > 0) timeString += `${days} ngày `;
        timeString += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        setTimeLeft(timeString);
      } else {
        setTimeLeft("Đã kết thúc");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activeCampaign]);

  const heroBanner = banners.find((b) => b.type === "hero");
  const subBanners = banners.filter((b) => b.type === "sub").slice(0, 2);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const sortProductsByApple = (prods: typeof products) => {
    return [...prods].sort((a, b) => {
      const aBrand = a.brand?.toLowerCase() || "";
      const bBrand = b.brand?.toLowerCase() || "";
      const appleKeywords = ["apple", "iphone", "ipad", "mac", "macbook", "airpods", "apple watch"];
      const isAApple = appleKeywords.some(keyword => aBrand.includes(keyword) || a.name?.toLowerCase().includes(keyword));
      const isBApple = appleKeywords.some(keyword => bBrand.includes(keyword) || b.name?.toLowerCase().includes(keyword));
      if (isAApple && !isBApple) return -1;
      if (!isAApple && isBApple) return 1;
      return 0;
    });
  };

  const sortedProducts = useMemo(() => {
    return sortProductsByApple(products);
  }, [products]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";
      if (aName.includes('điện thoại') && !bName.includes('điện thoại')) return -1;
      if (!aName.includes('điện thoại') && bName.includes('điện thoại')) return 1;
      return 0;
    });
  }, [categories]);

  // Optimized initial items - only load what user sees first
  const INITIAL_PRODUCTS_COUNT = 10;

  if (isLoading) {
    return (
      <div className="space-y-8 px-4">
        {/* Hero Banner Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonBanner className="md:col-span-2 aspect-[2/1]" />
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <SkeletonBanner className="aspect-[2/1]" />
            <SkeletonBanner className="aspect-[2/1] hidden md:block" />
          </div>
        </div>

        {/* Categories Skeleton */}
        <section>
          <Skeleton className="h-6 w-40 mb-4" />
          <SkeletonCategories count={6} />
        </section>

        {/* Products Skeleton */}
        <section>
          <Skeleton className="h-6 w-32 mb-4" />
          <SkeletonProductGrid count={INITIAL_PRODUCTS_COUNT} />
        </section>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-8">
      {/* Preload High Priority Images */}
      {heroBanner && (
        <link
          rel="preload"
          href={heroBanner.imageUrl}
          as="image"
          fetchPriority="high"
          key="preload-hero"
        />
      )}
      {subBanners.slice(0, 1).map((banner) => (
        <link
          key={`preload-sub-${banner.id}`}
          rel="preload"
          href={banner.imageUrl}
          as="image"
          fetchPriority="high"
        />
      ))}

      {/* Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {heroBanner && (
          <Link
            to={heroBanner.link}
            className="md:col-span-2 rounded-xl overflow-hidden aspect-[2/1] relative block"
            style={{ backgroundColor: 'rgb(188 179 180)' }}
          >
            <ImageWithFallback
              src={heroBanner.imageUrl}
              alt={heroBanner.title}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="w-full h-full object-cover"
              useBlur={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{heroBanner.title}</h2>
              <p className="text-lg">{heroBanner.subtitle}</p>
            </div>
          </Link>
        )}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {subBanners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="rounded-xl overflow-hidden aspect-[2/1] relative block"
              style={{ backgroundColor: 'rgb(188 179 180)' }}
            >
              <ImageWithFallback
                src={banner.imageUrl}
                alt={banner.title}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
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

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold mb-4 uppercase text-gray-800">
          Danh mục nổi bật
        </h2>
        <div className="flex flex-wrap justify-center gap-2 md:grid md:grid-cols-5 lg:grid-cols-8 md:gap-6">
          {sortedCategories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="w-[15%] md:w-auto bg-white rounded-xl p-1 md:p-8 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="w-8 h-8 md:w-20 md:h-20 bg-gray-100 rounded-full mb-1 md:mb-6 flex items-center justify-center text-xs md:text-4xl">
                {cat.icon || "📁"}
              </div>
              <span className="text-[9px] md:text-lg font-medium md:font-semibold text-gray-700 md:text-gray-800 h-6 md:h-14 flex items-center justify-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {activeCampaign && activeCampaign.products.length > 0 && (
        <section className="bg-red-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">⚡</span> {activeCampaign.name}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-white font-medium bg-black/20 px-3 py-1 rounded-full text-xs md:text-sm">
                Kết thúc trong: {timeLeft}
              </div>
              {activeCampaign.products.length > 5 && (
                <Link
                  to="/campaign"
                  className="hidden md:inline-flex text-white hover:text-gray-200 text-sm font-medium border border-white/40 px-3 py-1 rounded-full whitespace-nowrap"
                >
                  Xem tất cả
                </Link>
              )}
            </div>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
            {activeCampaign.products.slice(0, 5).map((campaignProduct) => {
              const product = products.find(
                (p) => p.id === campaignProduct.productId,
              );
              if (!product) return null;

              const basePrice = product.originalPrice || product.price;
              const discountPercent = Math.round(
                (1 - campaignProduct.flashSalePrice / basePrice) * 100,
              );

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg p-2 md:p-3 hover:shadow-lg transition-shadow border border-gray-100 relative min-w-[30%] max-w-[30%] md:min-w-[200px] md:w-[200px] snap-start shrink-0 group"
                >
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
                    <div className="aspect-square mb-2 md:mb-3 overflow-hidden rounded-md relative">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                        useBlur={false}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-medium text-xs md:text-sm text-gray-800 line-clamp-2 mb-1 md:mb-2 h-8 md:h-10">
                      {product.name}
                    </h3>
                    <div className="flex flex-col">
                      <span className="text-red-600 font-bold text-sm md:text-lg">
                        {formatPrice(campaignProduct.flashSalePrice)}
                      </span>
                      <span className="text-gray-400 text-[10px] md:text-sm line-through">
                        {formatPrice(product.originalPrice || product.price)}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
            {activeCampaign.products.length > 5 && (
              <div className="bg-white/10 rounded-lg p-2 md:p-3 relative min-w-[30%] max-w-[30%] md:min-w-[200px] md:w-[200px] snap-start shrink-0 flex items-center justify-center border border-dashed border-white/40 hover:bg-white/20 transition-colors">
                <Link
                  to="/campaign"
                  className="flex flex-col items-center justify-center text-white h-full w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm md:text-base">
                    Xem tất cả
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Grouped (Optional: If user still wants to see grouped by category) */}
      {sortedCategories.map((category) => {
        const categoryProductsRaw = products.filter(
          (p) =>
            p.category?.trim().toLowerCase() ===
            category.name?.trim().toLowerCase(),
        );
        if (categoryProductsRaw.length === 0) return null;
        const categoryProducts = sortProductsByApple(categoryProductsRaw);

        return (
          <LazySection key={category.id} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-700">
                {category.name}
              </h2>
              <Link
                to={`/category/${category.slug}`}
                className="text-[#00483d] hover:underline text-sm font-medium"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categoryProducts.slice(0, 5).map((product, index) => {
                const campaignProduct = activeCampaign?.products.find(
                  (p) => p.productId === product.id,
                );
                const flashSalePrice = campaignProduct?.flashSalePrice;
                const lowestPrice = getLowestPrice(product);
                const actualPrice = flashSalePrice || lowestPrice;
                const originalPrice = product.originalPrice || product.price;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <Link to={`/product/${product.slug}`} className="block">
                      <div className="aspect-square mb-2 overflow-hidden rounded-md relative">
                        {(product.discountPercentage || flashSalePrice) && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded z-10">
                            {flashSalePrice
                              ? "Flash Sale"
                              : `Giảm ${product.discountPercentage}%`}
                          </div>
                        )}
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          loading={index < 3 ? "eager" : "lazy"}
                          fetchPriority={index < 3 ? "high" : "auto"}
                          decoding="sync"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-sm text-gray-800 line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex flex-col">
                        <span className="text-red-600 font-bold text-sm">
                          {formatPrice(actualPrice)}
                        </span>
                        {originalPrice && originalPrice > actualPrice && (
                          <span className="text-gray-400 text-[10px] line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </LazySection>
        );
      })}

      {/* Categories Products */}
      <LazySection className="mb-10">
        <h2 className="text-xl font-bold uppercase text-gray-800 mb-4">
          Tất cả sản phẩm
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {paginatedProducts.map((product, index) => {
            const campaignProduct = activeCampaign?.products.find(
              (p) => p.productId === product.id,
            );
            const flashSalePrice = campaignProduct?.flashSalePrice;
            const lowestPrice = getLowestPrice(product);
            const actualPrice = flashSalePrice || lowestPrice;
            const originalPrice = product.originalPrice || product.price;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg p-3 hover:shadow-lg transition-shadow border border-gray-100 relative group"
              >
                {(product.discountPercentage || flashSalePrice) && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {flashSalePrice
                      ? "Flash Sale"
                      : `Giảm ${product.discountPercentage}%`}
                  </div>
                )}
                <Link to={`/product/${product.slug}`} className="block">
                  <div className="aspect-square mb-3 overflow-hidden rounded-md relative">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      loading={index < 10 ? "eager" : "lazy"}
                      fetchPriority={index < 10 ? "high" : "auto"}
                      decoding="sync"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 h-10 group-hover:text-[#00483d] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex flex-col">
                    <span className="text-red-600 font-bold text-lg">
                      {formatPrice(actualPrice)}
                    </span>
                    {originalPrice && originalPrice > actualPrice && (
                      <span className="text-gray-400 text-sm line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Trước
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                    }}
                    className={`w-10 h-10 rounded-md border flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? "bg-[#00483d] text-white border-[#00483d]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </LazySection>
    </div>
  );
}
