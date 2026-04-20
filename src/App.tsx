/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Compare from './pages/Compare';
import SearchResults from './pages/SearchResults';
import TradeIn from './pages/TradeIn';
import Warranty from './pages/Warranty';
import About from './pages/About';
import AuthProvider from './components/AuthProvider';
import { useProductStore } from './store/useProductStore';
import { useSettingsStore } from './store/useSettingsStore';
import { usePromotionStore } from './store/usePromotionStore';
import { useCategoryStore } from './store/useCategoryStore';
import { useBannerStore } from './store/useBannerStore';
import { useOrderStore } from './store/useOrderStore';
import { useWarrantyStore } from './store/useWarrantyStore';
import { useCampaignStore } from './store/useCampaignStore';

export default function App() {
  const subscribeProducts = useProductStore((state) => state.subscribeProducts);
  const subscribeSettings = useSettingsStore((state) => state.subscribeSettings);
  const initializePromotions = usePromotionStore((state) => state.initializePromotions);
  const initializeCategories = useCategoryStore((state) => state.initializeCategories);
  const initializeBanners = useBannerStore((state) => state.initializeBanners);
  const initializeOrders = useOrderStore((state) => state.initializeOrders);
  const initializeWarranties = useWarrantyStore((state) => state.initializeWarranties);
  const initializeCampaigns = useCampaignStore((state) => state.initializeCampaigns);

  useEffect(() => {
    // Initialize all Firestore subscriptions
    const unsubProducts = subscribeProducts();
    const unsubSettings = subscribeSettings();
    const unsubPromotions = initializePromotions();
    const unsubCategories = initializeCategories();
    const unsubBanners = initializeBanners();
    const unsubOrders = initializeOrders();
    const unsubWarranties = initializeWarranties();
    const unsubCampaigns = initializeCampaigns();

    return () => {
      unsubProducts();
      unsubSettings();
      unsubPromotions();
      unsubCategories();
      unsubBanners();
      unsubOrders();
      unsubWarranties();
      unsubCampaigns();
    };
  }, [
    subscribeProducts, 
    subscribeSettings,
    initializePromotions,
    initializeCategories,
    initializeBanners,
    initializeOrders,
    initializeWarranties,
    initializeCampaigns
  ]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="category/:slug" element={<Category />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="trade-in" element={<TradeIn />} />
            <Route path="warranty" element={<Warranty />} />
            <Route path="about" element={<About />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="orders" element={<Orders />} />
            <Route path="admin" element={<Admin />} />
            <Route path="compare" element={<Compare />} />
            <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - Không tìm thấy trang</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
