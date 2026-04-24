import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useOrderStore } from '../store/useOrderStore';
import { Navigate, Link } from 'react-router-dom';
import { Package, MapPin, Settings as SettingsIcon, Award } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const user = useUserStore(state => state.user);
  const orders = useOrderStore(state => state.orders);
  
  const [activeTab, setActiveTab] = useState('orders');
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const myOrders = orders.filter(o => o.customerPhone === user.username || o.customerName === user.name);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      if (password) {
        await updatePassword(auth.currentUser, password);
      }
      
      await updateDoc(doc(db, 'users', user.id), {
        name: name
      });
      
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-sm p-4 h-fit">
        <div className="flex items-center gap-3 mb-6 p-2">
          <div className="w-12 h-12 bg-[#00483d] rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold">{user.name}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-[#00483d] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package size={18} className="mr-3" />
            Đơn hàng của tôi
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'loyalty' ? 'bg-[#00483d] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Award size={18} className="mr-3" />
            Điểm thưởng (AloPoint)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-[#00483d] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon size={18} className="mr-3" />
            Cài đặt tài khoản
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Đơn hàng của tôi</h2>
            {myOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Bạn chưa có đơn hàng nào.
                <div className="mt-4">
                  <Link to="/" className="text-[#00483d] font-bold hover:underline">Mua sắm ngay</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4 pb-4 border-b">
                      <div>
                        <div className="font-bold">Đơn hàng #{order.id.slice(-6)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'pending' ? 'Chờ xử lý' : order.status === 'processing' ? 'Đang xử lý' : order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <img src={item.variantImage || item.productImage} alt={item.productName} loading="lazy" className="w-16 h-16 object-cover rounded border" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.variantColor} {item.variantStorage ? `- ${item.variantStorage}` : ''} x{item.quantity}
                            </div>
                          </div>
                          <div className="font-bold text-red-600">
                            {formatPrice(item.priceAtOrder)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Giao đến: {order.customerAddress}
                      </div>
                      <div className="font-bold">
                        Tổng tiền: <span className="text-red-600 text-lg">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Điểm thưởng AloPoint</h2>
            <div className="bg-gradient-to-r from-[#00483d] to-[#006858] text-white rounded-xl p-8 text-center mb-6">
              <Award size={48} className="mx-auto mb-4 opacity-80" />
              <div className="text-sm opacity-80 mb-1">Điểm hiện có</div>
              <div className="text-5xl font-bold">{user.loyaltyPoints || 0}</div>
              <div className="mt-4 text-sm bg-white/20 inline-block px-4 py-1 rounded-full">
                1 điểm = 1,000 VNĐ khi thanh toán
              </div>
            </div>
            
            <h3 className="font-bold mb-4">Làm thế nào để nhận điểm?</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 mb-6">
              <li>Mua sắm tại AloStore: Nhận 1% giá trị đơn hàng thành điểm AloPoint.</li>
              <li>Đánh giá sản phẩm sau khi mua: Tặng 10 điểm / đánh giá.</li>
              <li>Đăng ký tài khoản mới: Tặng ngay 50 điểm.</li>
            </ul>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Cài đặt tài khoản</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00483d]" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  value={user.email} 
                  className="w-full border p-2 rounded bg-gray-50 text-gray-500" 
                  disabled 
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00483d]" 
                  minLength={6}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#00483d] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#00382f] transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
