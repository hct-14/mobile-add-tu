/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, lazy, Suspense, useRef, ReactNode } from "react";
import Layout from "./components/Layout";
import AuthProvider from "./components/AuthProvider";
import { useProductStore } from "./store/useProductStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { useCampaignStore } from "./store/useCampaignStore";
import { useBannerStore } from "./store/useBannerStore";
import { usePromotionStore } from "./store/usePromotionStore";
import { useCategoryStore } from "./store/useCategoryStore";

import Home from "./pages/Home";
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Category = lazy(() => import("./pages/Category"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Orders = lazy(() => import("./pages/Orders"));
const Admin = lazy(() => import("./pages/Admin"));
const Compare = lazy(() => import("./pages/Compare"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const TradeIn = lazy(() => import("./pages/TradeIn"));
const Warranty = lazy(() => import("./pages/Warranty"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));
const Campaign = lazy(() => import("./pages/Campaign"));

// Shared loading fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
    <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
  </div>
);

// Route prefetcher for critical pages
const RoutePrefetcher = ({ children }: { children: ReactNode }) => {
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Prefetch most likely next pages after initial load
    const timer = setTimeout(() => {
      if (!prefetchedRef.current.has('product')) {
        import("./pages/ProductDetail");
        prefetchedRef.current.add('product');
      }
      if (!prefetchedRef.current.has('category')) {
        import("./pages/Category");
        prefetchedRef.current.add('category');
      }
      if (!prefetchedRef.current.has('cart')) {
        import("./pages/Cart");
        prefetchedRef.current.add('cart');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
};

// Deferred imports for non-critical stores
let warrantyStore: any = null;
let analyticsStore: any = null;

const getDeferredStores = async () => {
  if (!warrantyStore) {
    const w = await import("./store/useWarrantyStore");
    warrantyStore = w.useWarrantyStore;
    const a = await import("./store/useAnalyticsStore");
    analyticsStore = a.useAnalyticsStore;
  }
};

export default function App() {
  const subscribeProducts = useProductStore((state) => state.subscribeProducts);
  const subscribeSettings = useSettingsStore(
    (state) => state.subscribeSettings,
  );
  const subscribeCampaigns = useCampaignStore(
    (state) => state.subscribeCampaigns,
  );
  const subscribeBanners = useBannerStore((state) => state.subscribeBanners);
  const subscribePromotions = usePromotionStore(
    (state) => state.subscribePromotions,
  );
  const subscribeCategories = useCategoryStore(
    (state) => state.subscribeCategories,
  );

  // Critical subscriptions - load immediately
  useEffect(() => {
    const unsubProducts = subscribeProducts();
    const unsubSettings = subscribeSettings();
    const unsubCampaigns = subscribeCampaigns();
    const unsubBanners = subscribeBanners();
    const unsubPromotions = subscribePromotions();
    const unsubCategories = subscribeCategories();

    return () => {
      unsubProducts();
      unsubSettings();
      unsubCampaigns();
      unsubBanners();
      unsubPromotions();
      unsubCategories();
    };
  }, [
    subscribeProducts,
    subscribeSettings,
    subscribeCampaigns,
    subscribeBanners,
    subscribePromotions,
    subscribeCategories,
  ]);

  // Non-critical subscriptions - load after initial render
  useEffect(() => {
    // Defer warranty and analytics to not block initial render
    getDeferredStores().then(() => {
      if (warrantyStore) {
        warrantyStore.getState().subscribeWarranties();
      }
      if (analyticsStore) {
        analyticsStore.getState().subscribeAnalytics();
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <RoutePrefetcher>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route
                path="product/:slug"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path="category/:slug"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Category />
                  </Suspense>
                }
              />
              <Route
                path="search"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SearchResults />
                  </Suspense>
                }
              />
              <Route
                path="trade-in"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TradeIn />
                  </Suspense>
                }
              />
              <Route
                path="warranty"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Warranty />
                  </Suspense>
                }
              />
              <Route
                path="about"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <About />
                  </Suspense>
                }
              />
              <Route
                path="campaign"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Campaign />
                  </Suspense>
                }
              />
              <Route
                path="stores"
                element={
                  <div className="p-20 text-center text-xl">
                    Hệ thống cửa hàng đang cập nhật...
                  </div>
                }
              />
              <Route
                path="news"
                element={
                  <div className="p-20 text-center text-xl">
                    Tin tức đang cập nhật...
                  </div>
                }
              />
              <Route
                path="cart"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Cart />
                  </Suspense>
                }
              />
              <Route
                path="checkout"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Checkout />
                  </Suspense>
                }
              />
              <Route
                path="login"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="register"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Register />
                  </Suspense>
                }
              />
              <Route
                path="profile"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                }
              />
              <Route
                path="orders"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Orders />
                  </Suspense>
                }
              />
              <Route
                path="admin"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Admin />
                  </Suspense>
                }
              />
              <Route
                path="compare"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Compare />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <div className="text-center py-20 text-2xl font-bold">
                    404 - Không tìm thấy trang
                  </div>
                }
              />
            </Route>
          </Routes>
        </RoutePrefetcher>
      </AuthProvider>
    </BrowserRouter>
  );
}
