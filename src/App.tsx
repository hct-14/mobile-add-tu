/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, lazy, Suspense } from "react";
import Layout from "./components/Layout";
import AuthProvider from "./components/AuthProvider";
import { useProductStore } from "./store/useProductStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { useCampaignStore } from "./store/useCampaignStore";
import { useWarrantyStore } from "./store/useWarrantyStore";
import { useBannerStore } from "./store/useBannerStore";
import { usePromotionStore } from "./store/usePromotionStore";
import { useCategoryStore } from "./store/useCategoryStore";
import { useAnalyticsStore } from "./store/useAnalyticsStore";

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

export default function App() {
  const subscribeProducts = useProductStore((state) => state.subscribeProducts);
  const subscribeSettings = useSettingsStore(
    (state) => state.subscribeSettings,
  );
  const subscribeCampaigns = useCampaignStore(
    (state) => state.subscribeCampaigns,
  );
  const subscribeWarranties = useWarrantyStore(
    (state) => state.subscribeWarranties,
  );
  const subscribeBanners = useBannerStore((state) => state.subscribeBanners);
  const subscribePromotions = usePromotionStore(
    (state) => state.subscribePromotions,
  );
  const subscribeCategories = useCategoryStore(
    (state) => state.subscribeCategories,
  );
  const subscribeAnalytics = useAnalyticsStore(
    (state) => state.subscribeAnalytics,
  );

  useEffect(() => {
    const unsubProducts = subscribeProducts();
    const unsubSettings = subscribeSettings();
    const unsubCampaigns = subscribeCampaigns();
    const unsubWarranties = subscribeWarranties();
    const unsubBanners = subscribeBanners();
    const unsubPromotions = subscribePromotions();
    const unsubCategories = subscribeCategories();
    const unsubAnalytics = subscribeAnalytics();
    return () => {
      unsubProducts();
      unsubSettings();
      unsubCampaigns();
      unsubWarranties();
      unsubBanners();
      unsubPromotions();
      unsubCategories();
      unsubAnalytics();
    };
  }, [
    subscribeProducts,
    subscribeSettings,
    subscribeCampaigns,
    subscribeWarranties,
    subscribeBanners,
    subscribePromotions,
    subscribeCategories,
    subscribeAnalytics,
  ]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="product/:slug"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <ProductDetail />
                </Suspense>
              }
            />
            <Route
              path="category/:slug"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Category />
                </Suspense>
              }
            />
            <Route
              path="search"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <SearchResults />
                </Suspense>
              }
            />
            <Route
              path="trade-in"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <TradeIn />
                </Suspense>
              }
            />
            <Route
              path="warranty"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Warranty />
                </Suspense>
              }
            />
            <Route
              path="about"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <About />
                </Suspense>
              }
            />
            <Route
              path="campaign"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
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
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Cart />
                </Suspense>
              }
            />
            <Route
              path="checkout"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Checkout />
                </Suspense>
              }
            />
            <Route
              path="login"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="register"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Register />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Profile />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Orders />
                </Suspense>
              }
            />
            <Route
              path="admin"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
                  <Admin />
                </Suspense>
              }
            />
            <Route
              path="compare"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00483d] mb-4"></div>
                      <div className="text-lg text-gray-600 font-medium tracking-wide">Đang tải xin chờ chút...</div>
                    </div>
                  }
                >
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
      </AuthProvider>
    </BrowserRouter>
  );
}
