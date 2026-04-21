import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, Phone, Scale, X } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { useCompareStore } from '../store/useCompareStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useEffect, useState } from 'react';
import SearchComponent from './Search';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Layout() {
  const cartItems = useCartStore((state) => state.items);
  const user = useUserStore((state) => state.user);
  const compareItems = useCompareStore((state) => state.compareItems);
  const incrementPageView = useAnalyticsStore((state) => state.incrementPageView);
  const settings = useSettingsStore((state) => state.settings);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    incrementPageView();
    setIsMobileMenuOpen(false);
  }, [location.pathname, incrementPageView]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useUserStore.getState().logout();
      toast.success('Đã đăng xuất');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Đăng xuất thất bại');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div 
        className="text-sm py-1 hidden md:block transition-colors"
        style={{ backgroundColor: settings.theme?.topbar.bg, color: settings.theme?.topbar.text }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
          <div className="flex space-x-4">
            <Link to="/about" className="hover:opacity-80">Giới thiệu</Link>
            <Link to="/stores" className="hover:opacity-80">Hệ thống cửa hàng</Link>
            <Link to="/warranty" className="hover:opacity-80">Chính sách bảo hành</Link>
          </div>
          <div className="flex space-x-4 items-center">
            <span className="flex items-center"><Phone size={14} className="mr-1" /> {settings.phone}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className="sticky top-0 z-50 shadow-md transition-colors"
        style={{ backgroundColor: settings.theme?.header.bg, color: settings.theme?.header.text }}
      >
        <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="md:hidden p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center">
              <span className="text-yellow-400">{settings.storeName.substring(0, Math.floor(settings.storeName.length / 2))}</span>
              {settings.storeName.substring(Math.floor(settings.storeName.length / 2))}
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <SearchComponent />
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/compare" className="hidden md:flex flex-col items-center hover:text-yellow-400 transition-colors relative">
              <div className="relative">
                <Scale size={24} />
                {compareItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {compareItems.length}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">So sánh</span>
            </Link>
            <Link to="/orders" className="hidden md:flex flex-col items-center hover:text-yellow-400 transition-colors">
              <span className="text-xs">Kiểm tra</span>
              <span className="text-sm font-semibold">Đơn hàng</span>
            </Link>
            <Link to="/cart" className="relative flex flex-col items-center hover:text-yellow-400 transition-colors">
              <div className="relative">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden md:block mt-1">Giỏ hàng</span>
            </Link>
            {user ? (
              <div className="relative group">
                <Link to="/profile" className="flex flex-col items-center hover:text-yellow-400 transition-colors">
                  <User size={24} />
                  <span className="text-xs hidden md:block mt-1">{user.name}</span>
                </Link>
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                  <div className="bg-white rounded-md shadow-lg py-1 text-gray-800 border border-gray-100">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Hồ sơ cá nhân</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">Đơn hàng của tôi</Link>
                    {(user.role === 'admin' || user.role === 'sale' || user.role === 'warehouse') && (
                      <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100">Quản trị viên</Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex flex-col items-center hover:text-yellow-400 transition-colors">
                <User size={24} />
                <span className="text-xs hidden md:block mt-1">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav 
            className="md:hidden p-4 space-y-2 transition-colors"
            style={{ backgroundColor: settings.theme?.menu.bg, color: settings.theme?.menu.text }}
          >
            <Link to="/category/dien-thoai" className="block py-2 border-b border-white/10">ĐIỆN THOẠI</Link>
            <Link to="/category/laptop" className="block py-2 border-b border-white/10">LAPTOP</Link>
            <Link to="/category/apple" className="block py-2 border-b border-white/10">APPLE</Link>
            <Link to="/category/tablet" className="block py-2 border-b border-white/10">TABLET</Link>
            <Link to="/category/phu-kien" className="block py-2 border-b border-white/10">PHỤ KIỆN</Link>
            <Link to="/category/hang-cu" className="block py-2 border-b border-white/10">MÁY CŨ GIÁ RẺ</Link>
            <Link to="/trade-in" className="block py-2 border-b border-white/10">THU CŨ ĐỔI MỚI</Link>
            <Link to="/news" className="block py-2">TIN CÔNG NGHỆ</Link>
          </nav>
        )}

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <SearchComponent isMobile={true} />
        </div>

        {/* Navigation Menu */}
        <nav 
          className="hidden md:block transition-colors"
          style={{ backgroundColor: settings.theme?.menu.bg, color: settings.theme?.menu.text }}
        >
          <div className="container mx-auto px-4 max-w-7xl flex space-x-6 overflow-x-auto py-2 text-sm font-medium">
            <Link to="/category/dien-thoai" className="hover:opacity-80 whitespace-nowrap">ĐIỆN THOẠI</Link>
            <Link to="/category/laptop" className="hover:opacity-80 whitespace-nowrap">LAPTOP</Link>
            <Link to="/category/apple" className="hover:opacity-80 whitespace-nowrap">APPLE</Link>
            <Link to="/category/tablet" className="hover:opacity-80 whitespace-nowrap">TABLET</Link>
            <Link to="/category/phu-kien" className="hover:opacity-80 whitespace-nowrap">PHỤ KIỆN</Link>
            <Link to="/category/hang-cu" className="hover:opacity-80 whitespace-nowrap">MÁY CŨ GIÁ RẺ</Link>
            <Link to="/trade-in" className="hover:opacity-80 whitespace-nowrap">THU CŨ ĐỔI MỚI</Link>
            <Link to="/news" className="hover:opacity-80 whitespace-nowrap">TIN CÔNG NGHỆ</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-10">
        <div className="container mx-auto px-4 py-10 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Về AloStore</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-[#00483d]">Giới thiệu cửa hàng</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Hệ thống cửa hàng</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Tuyển dụng</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Tin công nghệ</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Liên hệ hợp tác</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Hỗ Trợ Khách Hàng</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/warranty" className="hover:text-[#00483d]">Chính sách bảo hành</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Hướng dẫn mua online</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Chính sách trả góp</Link></li>
                <li><Link to="#" className="hover:text-[#00483d]">Dịch vụ sữa chữa</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Tổng Đài Hỗ Trợ</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Gọi mua hàng: <strong>{settings.phone}</strong></li>
                <li>Email: <strong>{settings.email}</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Kết Nối Với Chúng Tôi</h3>
              <div className="flex space-x-4">
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-700">F</a>
                <a href={settings.zaloUrl} target="_blank" rel="noreferrer" className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600">Z</a>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-center text-sm text-gray-500">
            <p>{settings.footerText}</p>
            <p>Địa chỉ: {settings.address}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
