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

export default function App() {
  const subscribeProducts = useProductStore((state) => state.subscribeProducts);
  const subscribeSettings = useSettingsStore((state) => state.subscribeSettings);

  useEffect(() => {
    const unsubProducts = subscribeProducts();
    const unsubSettings = subscribeSettings();
    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, [subscribeProducts, subscribeSettings]);

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
