/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import AuthProvider from './components/AuthProvider';
import { useProductStore } from './store/useProductStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useCampaignStore } from './store/useCampaignStore';
import { useWarrantyStore } from './store/useWarrantyStore';
import { useBannerStore } from './store/useBannerStore';
import { usePromotionStore } from './store/usePromotionStore';
import { useCategoryStore } from './store/useCategoryStore';
import { useAnalyticsStore } from './store/useAnalyticsStore';

const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Category = lazy(() => import('./pages/Category'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Orders = lazy(() => import('./pages/Orders'));
const Admin = lazy(() => import('./pages/Admin'));
const Compare = lazy(() => import('./pages/Compare'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const TradeIn = lazy(() => import('./pages/TradeIn'));
const Warranty = lazy(() => import('./pages/Warranty'));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import('./pages/Profile'));
const Campaign = lazy(() => import('./pages/Campaign'));

export default function App() {
  const subscribeProducts = useProductStore((state) => state.subscribeProducts);
  const subscribeSettings = useSettingsStore((state) => state.subscribeSettings);
  const subscribeCampaigns = useCampaignStore((state) => state.subscribeCampaigns);
  const subscribeWarranties = useWarrantyStore((state) => state.subscribeWarranties);
  const subscribeBanners = useBannerStore((state) => state.subscribeBanners);
  const subscribePromotions = usePromotionStore((state) => state.subscribePromotions);
  const subscribeCategories = useCategoryStore((state) => state.subscribeCategories);
  const subscribeAnalytics = useAnalyticsStore((state) => state.subscribeAnalytics);

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
    subscribeProducts, subscribeSettings, subscribeCampaigns, subscribeWarranties,
    subscribeBanners, subscribePromotions, subscribeCategories, subscribeAnalytics
  ]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Đang tải...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="category/:slug" element={<Category />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="trade-in" element={<TradeIn />} />
              <Route path="warranty" element={<Warranty />} />
              <Route path="about" element={<About />} />
              <Route path="campaign" element={<Campaign />} />
              <Route path="stores" element={<div className="p-20 text-center text-xl">Hệ thống cửa hàng đang cập nhật...</div>} />
              <Route path="news" element={<div className="p-20 text-center text-xl">Tin tức đang cập nhật...</div>} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="admin" element={<Admin />} />
              <Route path="compare" element={<Compare />} />
              <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - Không tìm thấy trang</div>} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
