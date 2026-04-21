import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Layout from './components/Layout';
import AuthProvider from './components/AuthProvider';
import { useProductStore } from './store/useProductStore';
import { useSettingsStore } from './store/useSettingsStore';
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
import Profile from './pages/Profile';

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
        <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="category/:slug" element={<Category />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="trade-in" element={<TradeIn />} />
              <Route path="warranty" element={<Warranty />} />
              <Route path="about" element={<About />} />
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
        </AuthProvider>
    </BrowserRouter>
  );
}
