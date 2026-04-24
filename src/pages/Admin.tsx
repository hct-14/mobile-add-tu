import React, { useState, useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useProductStore } from '../store/useProductStore';
import { useOrderStore } from '../store/useOrderStore';
import { useBannerStore } from '../store/useBannerStore';
import { usePromotionStore } from '../store/usePromotionStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useCampaignStore } from '../store/useCampaignStore';
import { useWarrantyStore } from '../store/useWarrantyStore';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Image as ImageIcon, Tag, Edit, Trash2, CheckCircle, XCircle, BarChart3, ListTree, Zap, ShieldCheck, Clock, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import BannerModal from '../components/admin/BannerModal';
import PromotionModal from '../components/admin/PromotionModal';
import ProductModal from '../components/admin/ProductModal';
import CategoryModal from '../components/admin/CategoryModal';
import CampaignModal from '../components/admin/CampaignModal';
import WarrantyModal from '../components/admin/WarrantyModal';
import WarrantyHistoryModal from '../components/admin/WarrantyHistoryModal';
import ImportSlipModal from '../components/admin/ImportSlipModal';
import ExpenseModal from '../components/admin/ExpenseModal';
import { useWarehouseStore } from '../store/useWarehouseStore';
import { useTradeInStore } from '../store/useTradeInStore';
import SeedButton from '../lib/SeedButton';
import { useSettingsStore } from '../store/useSettingsStore';
import { Banner, Promotion, Product, Category, Campaign, Warranty, WarrantyHistory, ImportSlip, Expense } from '../types';
import { useEffect } from 'react';

export default function Admin() {
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('analytics');

  const { products, deleteProduct, addProduct, updateProduct } = useProductStore();
  const { orders, updateOrderStatus, updateOrder } = useOrderStore();
  const { banners, updateBanner, addBanner, deleteBanner } = useBannerStore();
  const { promotions, addPromotion, deletePromotion, updatePromotion } = usePromotionStore();
  const { pageViews, productViews, productOrders, dailyViews } = useAnalyticsStore();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useCampaignStore();
  const { warranties, addWarranty, updateWarranty, deleteWarranty } = useWarrantyStore();
  const { importSlips, expenses, fetchWarehouseData, addImportSlip, addExpense } = useWarehouseStore();
  const { requests: tradeInRequests, updateStatus: updateTradeInStatus, deleteRequest: deleteTradeInRequest } = useTradeInStore();
  const { settings, updateSettings } = useSettingsStore();

  const [settingsForm, setSettingsForm] = useState(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  useEffect(() => {
    const { subscribeOrders } = useOrderStore.getState();
    const unsubOrders = subscribeOrders();
    const { subscribe: subscribeTradeIn } = useTradeInStore.getState();
    const unsubTradeIn = subscribeTradeIn();
    return () => {
      unsubOrders();
      unsubTradeIn();
    };
  }, []);

  // Modal states
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 10;
  
  const paginatedProducts = useMemo(() => {
    return products.slice((productPage - 1) * productsPerPage, productPage * productsPerPage);
  }, [products, productPage]);

  const totalProductPages = Math.ceil(products.length / productsPerPage);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const categoriesPerPage = 10;

  const paginatedCategories = useMemo(() => {
    return categories.slice((categoryPage - 1) * categoriesPerPage, categoryPage * categoriesPerPage);
  }, [categories, categoryPage]);
  
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignPage, setCampaignPage] = useState(1);
  const campaignsPerPage = 5;

  const paginatedCampaigns = useMemo(() => {
    return campaigns.slice((campaignPage - 1) * campaignsPerPage, campaignPage * campaignsPerPage);
  }, [campaigns, campaignPage]);
  
  const totalCampaignPages = Math.ceil(campaigns.length / campaignsPerPage);

  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [warrantyPage, setWarrantyPage] = useState(1);
  const warrantiesPerPage = 10;

  const paginatedWarranties = useMemo(() => {
    return warranties.slice((warrantyPage - 1) * warrantiesPerPage, warrantyPage * warrantiesPerPage);
  }, [warranties, warrantyPage]);
  
  const totalWarrantyPages = Math.ceil(warranties.length / warrantiesPerPage);

  const [isWarrantyHistoryModalOpen, setIsWarrantyHistoryModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 10;
  
  const paginatedOrders = useMemo(() => {
    return orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);
  }, [orders, orderPage]);
  
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-4 pb-4">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trước
        </button>
        <span className="text-sm font-medium">Trang {currentPage} / {totalPages}</span>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    );
  };

  const lowStockProducts = useMemo(() => {
    return products.filter(p => typeof p.inventoryQuantity === 'number' && p.inventoryQuantity < 5);
  }, [products]);

  const tabs = [
    { id: 'analytics', name: 'Phân tích', icon: BarChart3, roles: ['admin'] },
    { id: 'products', name: 'Sản phẩm', icon: Package, roles: ['admin', 'warehouse'], badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined },
    { id: 'warehouse', name: 'Kho hàng', icon: ListTree, roles: ['admin', 'warehouse'] },
    { id: 'categories', name: 'Danh mục', icon: ListTree, roles: ['admin'] },
    { id: 'orders', name: 'Đơn hàng', icon: ShoppingBag, roles: ['admin', 'sale'] },
    { id: 'banners', name: 'Banners', icon: ImageIcon, roles: ['admin'] },
    { id: 'promotions', name: 'Khuyến mãi', icon: Tag, roles: ['admin'] },
    { id: 'campaigns', name: 'Chiến dịch', icon: Zap, roles: ['admin'] },
    { id: 'warranties', name: 'Bảo hành', icon: ShieldCheck, roles: ['admin', 'sale'] },
    { id: 'trade-in', name: 'Thu cũ đổi mới', icon: RefreshCw, roles: ['admin', 'sale'], badge: tradeInRequests?.filter(r => r.status === 'pending').length || undefined },
    { id: 'settings', name: 'Cấu hình cửa hàng', icon: SettingsIcon, roles: ['admin'] },
  ];

  const allowedTabs = tabs.filter(t => user && t.roles.includes(user.role));
  
  useEffect(() => {
    // If active tab is not allowed for the user, reset to first allowed tab
    if (allowedTabs.length > 0 && !allowedTabs.find(t => t.id === activeTab)) {
      setActiveTab(allowedTabs[0].id);
    }
  }, [user, allowedTabs, activeTab]);

  const exportToExcel = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    // Convert array of objects to CSV
    const headers = Object.keys(data[0]);
    const csvContent = 
      "data:text/csv;charset=utf-8,\uFEFF" + // BOM for UTF-8
      headers.join(",") + "\n" +
      data.map(row => 
        headers.map(header => {
          let cell = row[header];
          if (cell === null || cell === undefined) return "";
          if (typeof cell === 'object') cell = JSON.stringify(cell);
          cell = String(cell);
          // Escape quotes
          cell = cell.replace(/"/g, '""');
          // Quote strings with commas or newlines
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(",")
      ).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || !['admin', 'sale', 'warehouse'].includes(user.role)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h2>
        <p className="text-gray-500 mb-4">Bạn không có quyền truy cập trang này.</p>
        <Link to="/" className="text-[#db1c32] hover:underline">Về trang chủ</Link>
      </div>
    );
  }

  // Prepare data for charts
  const topViewedProducts = Object.entries(productViews)
    .map(([id, views]) => {
      const product = products.find(p => p.id === id);
      return {
        name: product ? product.name : `Sản phẩm ${id}`,
        views
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const topOrderedProducts = useMemo(() => {
    const orderCount: Record<string, number> = {};
    orders.filter(o => o.status === 'completed').forEach(order => {
      order.items.forEach(item => {
        orderCount[item.productId] = (orderCount[item.productId] || 0) + item.quantity;
      });
    });

    return Object.entries(orderCount)
      .map(([id, count]) => {
        const product = products.find(p => p.id === id);
        return {
          name: product ? product.name : `Sản phẩm ${id}`,
          orders: count
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  }, [orders, products]);

  const dailyRevenueData = useMemo(() => {
    const revenueByDate: Record<string, number> = {};
    orders.filter(o => o.status === 'completed').forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + order.total;
    });
    
    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  const dailyViewsData = useMemo(() => {
    return Object.entries(dailyViews || {})
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyViews]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-sm p-4 h-fit">
        <h2 className="text-lg font-bold mb-4 px-2">Quản trị viên</h2>
        <nav className="space-y-1">
          {allowedTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#db1c32] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Icon size={18} className="mr-3" />
                  {tab.name}
                </div>
                {tab.badge !== undefined && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'analytics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Phân tích dữ liệu</h1>
              <SeedButton />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng lượt truy cập trang</h3>
                <p className="text-3xl font-bold text-[#00483d]">{pageViews}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng số đơn hàng</h3>
                <p className="text-3xl font-bold text-[#00483d]">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Doanh thu ước tính</h3>
                <p className="text-3xl font-bold text-[#00483d]">
                  {formatPrice(orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Lượt xem theo ngày</h3>
                {dailyViewsData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyViewsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#00483d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">Chưa có dữ liệu</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Doanh thu theo ngày</h3>
                {dailyRevenueData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                        <Tooltip formatter={(value: number) => formatPrice(value)} />
                        <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#eab308" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Sản phẩm xem nhiều nhất</h3>
                {topViewedProducts.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topViewedProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="views" name="Lượt xem" fill="#00483d" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">Chưa có dữ liệu</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Sản phẩm được đặt nhiều nhất</h3>
                {topOrderedProducts.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topOrderedProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="orders" name="Số lượng đặt" fill="#eab308" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
              <button 
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#b41729] transition-colors"
              >
                + Thêm sản phẩm
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-medium text-gray-600">ID</th>
                      <th className="p-4 font-medium text-gray-600">Hình ảnh</th>
                      <th className="p-4 font-medium text-gray-600">Tên sản phẩm</th>
                      <th className="p-4 font-medium text-gray-600">Danh mục</th>
                      <th className="p-4 font-medium text-gray-600">Giá bán</th>
                      <th className="p-4 font-medium text-gray-600">Tồn kho</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-500">{product.id}</td>
                        <td className="p-4">
                          <div className="w-12 h-12 rounded border overflow-hidden">
                            <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-900">{product.name}</td>
                        <td className="p-4 text-sm text-gray-500">{product.category}</td>
                        <td className="p-4 font-medium text-red-600">{formatPrice(product.price)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.inStock ? 'Còn hàng' : 'Hết hàng'} ({product.inventoryQuantity || 0})
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                                  deleteProduct(product.id);
                                }
                              }} 
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls currentPage={productPage} totalPages={totalProductPages} onPageChange={setProductPage} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
              <button 
                onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
                className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#b41729] transition-colors"
              >
                + Thêm danh mục
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-medium text-gray-600">ID</th>
                      <th className="p-4 font-medium text-gray-600">Icon</th>
                      <th className="p-4 font-medium text-gray-600">Tên danh mục</th>
                      <th className="p-4 font-medium text-gray-600">Slug</th>
                      <th className="p-4 font-medium text-gray-600">Mô tả</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-500">{category.id}</td>
                        <td className="p-4 text-2xl">{category.icon || '📁'}</td>
                        <td className="p-4 font-medium text-gray-900">{category.name}</td>
                        <td className="p-4 text-sm text-gray-500">{category.slug}</td>
                        <td className="p-4 text-sm text-gray-500">{category.description || '-'}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => { setEditingCategory(category); setIsCategoryModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
                                  deleteCategory(category.id);
                                }
                              }} 
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
              <button 
                onClick={() => exportToExcel(orders.map(o => ({
                  'Mã ĐH': o.id,
                  'Ngày đặt': new Date(o.createdAt).toLocaleDateString('vi-VN'),
                  'Khách hàng': o.customerName,
                  'SĐT': o.customerPhone,
                  'Địa chỉ': o.customerAddress,
                  'Sản phẩm': o.items.map(i => `${i.productName} (${i.quantity})`).join('; '),
                  'Tổng tiền': o.total,
                  'Trạng thái': o.status,
                  'Ghi chú': o.note || ''
                })), 'DanhSachDonHang')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                Xuất Excel
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-medium text-gray-600">Mã ĐH</th>
                      <th className="p-4 font-medium text-gray-600">Ngày đặt</th>
                      <th className="p-4 font-medium text-gray-600">Khách hàng</th>
                      <th className="p-4 font-medium text-gray-600">Tổng tiền</th>
                      <th className="p-4 font-medium text-gray-600">Trạng thái</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có đơn hàng nào</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="p-4 text-sm font-medium text-gray-900">#{order.id.slice(-6)}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                              <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                              <div className="text-xs text-gray-500">{order.customerPhone}</div>
                            </td>
                            <td className="p-4 font-medium text-red-600">{formatPrice(order.total)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'pending' ? 'Chờ xử lý' : order.status === 'processing' ? 'Đang xử lý' : order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-2">
                                <select 
                                  value={order.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value as any;
                                    if (newStatus === 'completed' && order.status !== 'completed') {
                                      // Reduce inventory
                                      order.items.forEach(item => {
                                        const product = products.find(p => p.id === item.productId);
                                        if (product && typeof product.inventoryQuantity === 'number') {
                                          const newQuantity = Math.max(0, product.inventoryQuantity - item.quantity);
                                          updateProduct(product.id, { inventoryQuantity: newQuantity });
                                        }
                                      });
                                    } else if (order.status === 'completed' && newStatus !== 'completed') {
                                      // Restore inventory
                                      order.items.forEach(item => {
                                        const product = products.find(p => p.id === item.productId);
                                        if (product && typeof product.inventoryQuantity === 'number') {
                                          const newQuantity = product.inventoryQuantity + item.quantity;
                                          updateProduct(product.id, { inventoryQuantity: newQuantity });
                                        }
                                      });
                                    }
                                    updateOrderStatus(order.id, newStatus);
                                  }}
                                  className="text-sm border rounded p-1 w-full"
                                >
                                  <option value="pending">Chờ xử lý</option>
                                  <option value="processing">Đang xử lý</option>
                                  <option value="completed">Hoàn thành</option>
                                  <option value="cancelled">Đã hủy</option>
                                </select>
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-2 rounded font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1"
                                  >
                                    <CheckCircle size={14} /> Xác nhận đơn hàng
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50 border-b">
                            <td colSpan={6} className="p-4">
                              <div className="text-sm font-medium mb-2">Chi tiết đơn hàng:</div>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded border">
                                    <div className="w-10 h-10 border rounded overflow-hidden flex-shrink-0">
                                      <img src={item.variantImage || item.productImage} alt={item.productName} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{item.productName}</div>
                                      <div className="text-xs text-gray-500">
                                        {item.variantColor}
                                        {item.variantStorage ? ` - ${item.variantStorage}` : ''}
                                        {item.variantRam ? ` - ${item.variantRam}` : ''}
                                        {item.variantCondition ? ` - ${item.variantCondition}` : ''}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500">SL: {item.quantity}</div>
                                      <div className="font-medium text-red-600">{formatPrice(item.priceAtOrder)}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {order.note && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Ghi chú:</span> {order.note}
                                </div>
                              )}
                              <div className="mt-1 text-sm text-gray-600">
                                <span className="font-medium">Địa chỉ:</span> {order.customerAddress}
                              </div>
                              {order.promotionCode && (
                                <div className="mt-1 text-sm text-green-600">
                                  <span className="font-medium">Mã giảm giá đã áp dụng:</span> {order.promotionCode} (-{formatPrice(order.discountAmount || 0)})
                                </div>
                              )}
                              {!order.promotionCode && order.status !== 'completed' && order.status !== 'cancelled' && (
                                <div className="mt-2 flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Nhập mã giảm giá..." 
                                    className="text-sm border rounded px-2 py-1"
                                    id={`promo-${order.id}`}
                                  />
                                  <button 
                                    onClick={() => {
                                      const input = document.getElementById(`promo-${order.id}`) as HTMLInputElement;
                                      const code = input?.value;
                                      if (code) {
                                        const promo = promotions.find(p => p.code === code && p.isActive);
                                        if (promo) {
                                          const newTotal = Math.max(0, order.total - (promo.discountAmount || 0));
                                          updateOrder(order.id, {
                                            promotionCode: promo.code,
                                            discountAmount: promo.discountAmount,
                                            total: newTotal
                                          });
                                          alert('Áp dụng mã giảm giá thành công!');
                                        } else {
                                          alert('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
                                        }
                                      }
                                    }}
                                    className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
                                  >
                                    Áp dụng
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý Banners</h1>
              <button 
                onClick={() => { setEditingBanner(null); setIsBannerModalOpen(true); }}
                className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#00382f] transition-colors"
              >
                + Thêm Banner
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{banner.title || 'Banner không tiêu đề'}</h3>
                      <p className="text-sm text-gray-500">Loại: {banner.type === 'hero' ? 'Banner chính' : 'Banner phụ'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setEditingBanner(banner); setIsBannerModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                      >
                        <Edit size={16} className="mr-1" /> Sửa
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
                            deleteBanner(banner.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                      >
                        <Trash2 size={16} className="mr-1" /> Xóa
                      </button>
                    </div>
                  </div>
                  <div className="aspect-[21/9] w-full bg-gray-100 rounded-lg overflow-hidden relative">
                    <img src={banner.imageUrl} alt={banner.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Link:</strong> {banner.link}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý Khuyến mãi</h1>
              <button 
                onClick={() => { setEditingPromo(null); setIsPromoModalOpen(true); }}
                className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#00382f] transition-colors"
              >
                + Thêm mã giảm giá
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-medium text-gray-600">Mã</th>
                      <th className="p-4 font-medium text-gray-600">Mô tả</th>
                      <th className="p-4 font-medium text-gray-600">Mức giảm</th>
                      <th className="p-4 font-medium text-gray-600">Thời gian</th>
                      <th className="p-4 font-medium text-gray-600">Đã dùng</th>
                      <th className="p-4 font-medium text-gray-600">Trạng thái</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((promo) => (
                      <tr key={promo.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{promo.code}</td>
                        <td className="p-4 text-sm text-gray-600">{promo.description}</td>
                        <td className="p-4 font-medium text-red-600">
                          {promo.discountType === 'percent' 
                            ? `${promo.discountPercent}%` 
                            : formatPrice(promo.discountAmount || 0)}
                          {promo.minOrderValue ? (
                            <div className="text-xs text-gray-500 font-normal mt-1">
                              Đơn tối thiểu: {formatPrice(promo.minOrderValue)}
                            </div>
                          ) : null}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {promo.startDate && (
                            <div className="mb-1">
                              <span className="text-gray-400">Từ:</span> {new Date(promo.startDate).toLocaleString('vi-VN')}
                            </div>
                          )}
                          {promo.endDate && (
                            <div>
                              <span className="text-gray-400">Đến:</span> {new Date(promo.endDate).toLocaleString('vi-VN')}
                            </div>
                          )}
                          {!promo.startDate && !promo.endDate && '-'}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {promo.usedCount || 0} {promo.usageLimit ? `/ ${promo.usageLimit}` : ''}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => updatePromotion(promo.id, { isActive: !promo.isActive })}
                            className={`flex items-center text-sm font-medium ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {promo.isActive ? <CheckCircle size={18} className="mr-1" /> : <XCircle size={18} className="mr-1" />}
                            {promo.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => { setEditingPromo(promo); setIsPromoModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa mã này?')) {
                                  deletePromotion(promo.id);
                                }
                              }} 
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'campaigns' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Quản lý Chiến dịch (Flash Sale)</h1>
              <button 
                onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}
                className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#00382f] transition-colors"
              >
                + Thêm chiến dịch
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-medium text-gray-600">Tên chiến dịch</th>
                      <th className="p-4 font-medium text-gray-600">Ngày kết thúc</th>
                      <th className="p-4 font-medium text-gray-600">Số SP</th>
                      <th className="p-4 font-medium text-gray-600">Trạng thái</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{campaign.name}</td>
                        <td className="p-4 text-sm text-gray-600">{new Date(campaign.endDate).toLocaleString('vi-VN')}</td>
                        <td className="p-4 text-sm text-gray-600">{campaign.products.length}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => updateCampaign(campaign.id, { isActive: !campaign.isActive })}
                            className={`flex items-center text-sm font-medium ${campaign.isActive ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {campaign.isActive ? <CheckCircle size={18} className="mr-1" /> : <XCircle size={18} className="mr-1" />}
                            {campaign.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => { setEditingCampaign(campaign); setIsCampaignModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
                                  deleteCampaign(campaign.id);
                                }
                              }} 
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warranties' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quản lý Bảo hành</h2>
              <button 
                onClick={() => { setEditingWarranty(null); setIsWarrantyModalOpen(true); }}
                className="bg-[#00483d] text-white px-4 py-2 rounded-md hover:bg-[#00382f] flex items-center"
              >
                <span className="mr-2">+</span> Thêm máy bảo hành
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 font-medium text-gray-600">IMEI / Serial</th>
                      <th className="p-4 font-medium text-gray-600">Sản phẩm</th>
                      <th className="p-4 font-medium text-gray-600">Khách hàng</th>
                      <th className="p-4 font-medium text-gray-600">Thời hạn</th>
                      <th className="p-4 font-medium text-gray-600">Trạng thái</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warranties.map((warranty) => {
                      const isExpired = new Date(warranty.endDate).getTime() < new Date().getTime();
                      return (
                        <tr key={warranty.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900 uppercase">{warranty.imei}</td>
                          <td className="p-4 text-sm text-gray-600">
                            <div>{warranty.productName}</div>
                            {warranty.color && <div className="text-xs text-gray-400">{warranty.color}</div>}
                          </td>
                          <td className="p-4 text-sm text-gray-600">{warranty.customerPhone}</td>
                          <td className="p-4 text-sm text-gray-600">
                            <div>Từ: {new Date(warranty.startDate).toLocaleDateString('vi-VN')}</div>
                            <div>Đến: {new Date(warranty.endDate).toLocaleDateString('vi-VN')}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {isExpired ? 'Hết hạn' : 'Còn hạn'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => { setSelectedWarranty(warranty); setIsWarrantyHistoryModalOpen(true); }}
                                className="text-[#00483d] hover:text-[#00382f] p-1"
                                title="Lịch sử bảo hành"
                              >
                                <Clock size={18} />
                              </button>
                              <button 
                                onClick={() => { setEditingWarranty(warranty); setIsWarrantyModalOpen(true); }}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Sửa"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm('Bạn có chắc chắn muốn xóa thông tin bảo hành này?')) {
                                    deleteWarranty(warranty.id);
                                  }
                                }} 
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {warranties.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          Chưa có dữ liệu bảo hành
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trade-in' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Yêu cầu Thu cũ đổi mới</h1>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-medium text-gray-600">Khách hàng</th>
                      <th className="p-4 font-medium text-gray-600">SĐT</th>
                      <th className="p-4 font-medium text-gray-600">Máy hiện tại</th>
                      <th className="p-4 font-medium text-gray-600">Tình trạng</th>
                      <th className="p-4 font-medium text-gray-600">Máy muốn đổi</th>
                      <th className="p-4 font-medium text-gray-600">Trạng thái</th>
                      <th className="p-4 font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeInRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">Chưa có yêu cầu nào</td>
                      </tr>
                    ) : (
                      tradeInRequests.map((req) => (
                        <tr key={req.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{req.name} {req.note && <div className="text-xs text-gray-500 font-normal mt-1">Ghi chú: {req.note}</div>}</td>
                          <td className="p-4 text-sm text-gray-600">{req.phone}</td>
                          <td className="p-4 font-medium text-gray-900">{req.oldDevice}</td>
                          <td className="p-4 text-sm text-gray-600">{req.condition}</td>
                          <td className="p-4 font-medium text-blue-600">{req.newDevice}</td>
                          <td className="p-4">
                            <select 
                              value={req.status}
                              onChange={(e) => updateTradeInStatus(req.id, e.target.value as any)}
                              className={`text-sm border rounded p-1 w-full font-medium ${
                                req.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                req.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                req.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              <option value="pending">Chờ xử lý</option>
                              <option value="processing">Đang xử lý</option>
                              <option value="completed">Đã hoàn tất</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                            <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
                                  deleteTradeInRequest(req.id);
                                }
                              }} 
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warehouse' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý Kho hàng, Chi phí & Lợi nhuận</h1>
            
            {/* 3 Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center justify-center gap-3 bg-[#00483d] text-white p-4 rounded-xl shadow-sm hover:bg-[#00382f] transition-all transform hover:scale-[1.02]"
              >
                <Package size={24} />
                <div className="text-left">
                  <div className="font-bold">Nhập hàng</div>
                  <div className="text-xs opacity-80">Thêm phiếu nhập mới</div>
                </div>
              </button>
              
              <button 
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center justify-center gap-3 bg-[#eab308] text-white p-4 rounded-xl shadow-sm hover:bg-yellow-600 transition-all transform hover:scale-[1.02]"
              >
                <Tag size={24} />
                <div className="text-left">
                  <div className="font-bold">Chi phí khác</div>
                  <div className="text-xs opacity-80">Quản lý chi tiêu vận hành</div>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('analytics')}
                className="flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-xl shadow-sm hover:bg-blue-700 transition-all transform hover:scale-[1.02]"
              >
                <BarChart3 size={24} />
                <div className="text-left">
                  <div className="font-bold">Báo cáo</div>
                  <div className="text-xs opacity-80">Xem thống kê chi tiết</div>
                </div>
              </button>
              
              <button 
                onClick={() => exportToExcel(products.map(p => ({
                  'ID': p.id,
                  'Tên sản phẩm': p.name,
                  'Danh mục': p.category,
                  'Thương hiệu': p.brand,
                  'Số lượng tồn': p.inventoryQuantity ?? 0,
                  'Giá bán': p.price
                })), 'BaoCaoKhoHang')}
                className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-xl shadow-sm hover:bg-green-700 transition-all transform hover:scale-[1.02]"
              >
                <ListTree size={24} />
                <div className="text-left">
                  <div className="font-bold">Xuất Excel</div>
                  <div className="text-xs opacity-80">Danh sách tồn kho</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng tiền nhập hàng</h3>
                <p className="text-2xl font-bold text-[#00483d]">
                  {formatPrice(importSlips.reduce((acc, slip) => acc + slip.totalPrice, 0))}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng chi phí khác</h3>
                <p className="text-2xl font-bold text-[#00483d]">
                  {formatPrice(expenses.reduce((acc, exp) => acc + exp.amount, 0))}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Lợi nhuận ước tính</h3>
                <p className="text-2xl font-bold text-[#00483d]">
                  {formatPrice(orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0) - importSlips.reduce((acc, slip) => acc + slip.totalPrice, 0) - expenses.reduce((acc, exp) => acc + exp.amount, 0))}
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Lịch sử nhập hàng gần đây</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-3 font-medium text-gray-600 text-sm">Ngày</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Sản phẩm</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Số lượng</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Tổng tiền</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Nhà cung cấp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importSlips.slice(0, 5).map((slip) => (
                        <tr key={slip.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-500">{new Date(slip.importDate).toLocaleDateString('vi-VN')}</td>
                          <td className="p-3 text-sm font-medium">{slip.productName}</td>
                          <td className="p-3 text-sm">{slip.quantity}</td>
                          <td className="p-3 text-sm font-medium text-red-600">{formatPrice(slip.totalPrice)}</td>
                          <td className="p-3 text-sm text-gray-500">{slip.supplier}</td>
                        </tr>
                      ))}
                      {importSlips.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-sm">Chưa có phiếu nhập nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Chi phí vận hành gần đây</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-3 font-medium text-gray-600 text-sm">Ngày</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Tên chi phí</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Loại</th>
                        <th className="p-3 font-medium text-gray-600 text-sm">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 5).map((exp) => (
                        <tr key={exp.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-500">{new Date(exp.expenseDate).toLocaleDateString('vi-VN')}</td>
                          <td className="p-3 text-sm font-medium">{exp.name}</td>
                          <td className="p-3 text-sm">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{exp.type}</span>
                          </td>
                          <td className="p-3 text-sm font-medium text-red-600">{formatPrice(exp.amount)}</td>
                        </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">Chưa có chi phí nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Cấu hình cửa hàng</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
              <form onSubmit={(e) => {
                e.preventDefault();
                updateSettings(settingsForm);
                alert('Đã lưu cấu hình cửa hàng!');
              }} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                  <input 
                    type="text" 
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({...settingsForm, storeName: e.target.value})}
                    className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
                    <input 
                      type="text" 
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                      className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                    <input 
                      type="email" 
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                      className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input 
                    type="text" 
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                    className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook</label>
                    <input 
                      type="url" 
                      value={settingsForm.facebookUrl}
                      onChange={(e) => setSettingsForm({...settingsForm, facebookUrl: e.target.value})}
                      className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Zalo</label>
                    <input 
                      type="url" 
                      value={settingsForm.zaloUrl}
                      onChange={(e) => setSettingsForm({...settingsForm, zaloUrl: e.target.value})}
                      className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Instagram</label>
                    <input 
                      type="url" 
                      value={settingsForm.instagramUrl || ''}
                      onChange={(e) => setSettingsForm({...settingsForm, instagramUrl: e.target.value})}
                      className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link TikTok</label>
                    <input 
                      type="url" 
                      value={settingsForm.tiktokUrl || ''}
                      onChange={(e) => setSettingsForm({...settingsForm, tiktokUrl: e.target.value})}
                      className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung Footer (Bản quyền)</label>
                  <input 
                    type="text" 
                    value={settingsForm.footerText}
                    onChange={(e) => setSettingsForm({...settingsForm, footerText: e.target.value})}
                    className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đoạn văn giới thiệu (HTML - Hiện tại trang "Về chúng tôi")</label>
                  <textarea 
                    value={settingsForm.aboutUsContent || ''}
                    onChange={(e) => setSettingsForm({...settingsForm, aboutUsContent: e.target.value})}
                    className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none font-mono text-sm" 
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Đoạn văn này hỗ trợ mã HTML. Bạn có thể sử dụng thẻ &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;.</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-bold mb-4">Tùy chỉnh giao diện (Theme)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {/* Topbar Colors */}
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-3">Thanh trên cùng (Topbar)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Màu nền</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={settingsForm.theme?.topbar.bg || '#00483d'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, topbar: { ...settingsForm.theme!.topbar, bg: e.target.value } }
                              })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={settingsForm.theme?.topbar.bg || '#00483d'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, topbar: { ...settingsForm.theme!.topbar, bg: e.target.value } }
                              })}
                              className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Màu chữ</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={settingsForm.theme?.topbar.text || '#ffffff'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, topbar: { ...settingsForm.theme!.topbar, text: e.target.value } }
                              })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={settingsForm.theme?.topbar.text || '#ffffff'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, topbar: { ...settingsForm.theme!.topbar, text: e.target.value } }
                              })}
                              className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Header Colors */}
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-3">Phần tìm kiếm (Header)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Màu nền</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={settingsForm.theme?.header.bg || '#00483d'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, header: { ...settingsForm.theme!.header, bg: e.target.value } }
                              })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={settingsForm.theme?.header.bg || '#00483d'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, header: { ...settingsForm.theme!.header, bg: e.target.value } }
                              })}
                              className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Màu chữ</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={settingsForm.theme?.header.text || '#ffffff'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, header: { ...settingsForm.theme!.header, text: e.target.value } }
                              })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={settingsForm.theme?.header.text || '#ffffff'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, header: { ...settingsForm.theme!.header, text: e.target.value } }
                              })}
                              className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Colors */}
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-3">Thanh danh mục (Menu)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Màu nền</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={settingsForm.theme?.menu.bg || '#00382f'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, menu: { ...settingsForm.theme!.menu, bg: e.target.value } }
                              })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={settingsForm.theme?.menu.bg || '#00382f'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, menu: { ...settingsForm.theme!.menu, bg: e.target.value } }
                              })}
                              className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Màu chữ</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={settingsForm.theme?.menu.text || '#ffffff'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, menu: { ...settingsForm.theme!.menu, text: e.target.value } }
                              })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={settingsForm.theme?.menu.text || '#ffffff'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                theme: { ...settingsForm.theme!, menu: { ...settingsForm.theme!.menu, text: e.target.value } }
                              })}
                              className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung Chính sách bảo hành (Hỗ trợ HTML)</label>
                  <textarea 
                    value={settingsForm.warrantyPolicy || ''}
                    onChange={(e) => setSettingsForm({...settingsForm, warrantyPolicy: e.target.value})}
                    className="w-full border rounded-md p-2 focus:ring-[#00483d] outline-none"
                    rows={10}
                    placeholder="<h2>Chính sách bảo hành</h2><p>Nhập nội dung vào đây...</p>"
                  />
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <button type="submit" className="bg-[#00483d] text-white font-medium py-2 px-6 rounded-md hover:bg-[#00382f]">
                    Lưu thay đổi
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn khôi phục giao diện mặc định?')) {
                        const defaultTheme = {
                          topbar: { bg: 'rgb(219, 28, 50)', text: '#ffffff' },
                          header: { bg: 'rgb(219, 28, 50)', text: '#ffffff' },
                          menu: { bg: 'rgb(190, 15, 35)', text: '#ffffff' },
                        };
                        setSettingsForm({...settingsForm, theme: defaultTheme});
                        // updateSettings({ theme: defaultTheme });
                      }
                    }}
                    className="text-[#db1c32] font-medium py-2 px-4 rounded-md hover:bg-gray-100"
                  >
                    Khôi phục màu mặc định
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <BannerModal 
        isOpen={isBannerModalOpen} 
        onClose={() => setIsBannerModalOpen(false)} 
        initialData={editingBanner}
        onSave={(banner) => {
          if (editingBanner) updateBanner(banner.id, banner);
          else addBanner(banner);
        }}
      />

      <PromotionModal 
        isOpen={isPromoModalOpen} 
        onClose={() => setIsPromoModalOpen(false)} 
        initialData={editingPromo}
        onSave={(promo) => {
          if (editingPromo) updatePromotion(promo.id, promo);
          else addPromotion(promo);
        }}
      />

      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        initialData={editingProduct}
        onSave={(product) => {
          if (editingProduct) {
            updateProduct(product.id, product);
          } else {
            let uniqueSlug = product.slug;
            let counter = 1;
            while (products.some(p => p.slug === uniqueSlug)) {
              uniqueSlug = `${product.slug}-${counter}`;
              counter++;
            }
            addProduct({ ...product, slug: uniqueSlug });
          }
        }}
      />

      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        initialData={editingCategory}
        onSave={(category) => {
          if (editingCategory) updateCategory(category.id, category);
          else addCategory(category);
        }}
      />

      <CampaignModal 
        isOpen={isCampaignModalOpen} 
        onClose={() => setIsCampaignModalOpen(false)} 
        initialData={editingCampaign}
        onSave={(campaign) => {
          if (editingCampaign) updateCampaign(campaign.id, campaign);
          else addCampaign(campaign);
        }}
      />

      <WarrantyModal 
        isOpen={isWarrantyModalOpen} 
        onClose={() => setIsWarrantyModalOpen(false)} 
        initialData={editingWarranty}
        onSave={(warranty) => {
          if (editingWarranty) updateWarranty(warranty.id, warranty);
          else addWarranty(warranty);
        }}
      />

      <WarrantyHistoryModal 
        isOpen={isWarrantyHistoryModalOpen} 
        onClose={() => setIsWarrantyHistoryModalOpen(false)} 
        warranty={selectedWarranty}
        onUpdateHistory={(id, history) => {
          updateWarranty(id, { history });
          // Update selected warranty to reflect changes in modal
          if (selectedWarranty) {
            setSelectedWarranty({ ...selectedWarranty, history });
          }
        }}
      />

      <ImportSlipModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        products={products}
        onSave={addImportSlip}
      />

      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={addExpense}
      />
    </div>
  );
}
