import { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useOrderStore } from '../store/useOrderStore';
import { Link } from 'react-router-dom';

export default function Orders() {
  const user = useUserStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const subscribeOrders = useOrderStore((state) => state.subscribeOrders);

  useEffect(() => {
    const unsub = subscribeOrders();
    return () => unsub();
  }, [subscribeOrders]);

  const userOrders = orders.filter(o => o.customerPhone === user?.phone || o.customerName === user?.name);

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm mt-10">
        <h2 className="text-2xl font-bold mb-4">Tra cứu đơn hàng</h2>
        <p className="text-gray-500 mb-8">Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
        <Link to="/login" className="bg-[#00483d] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00382f] transition-colors inline-block">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
      
      {userOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="text-[#00483d] hover:underline mt-4 inline-block font-medium">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <div className="font-bold text-lg">Đơn hàng #{order.id.slice(-6)}</div>
                  <div className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'pending' ? 'CHỜ XỬ LÝ' : order.status === 'processing' ? 'ĐANG XỬ LÝ' : 'HOÀN THÀNH'}
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 border rounded">
                      <img src={item.variantImage || item.productImage} alt={item.productName} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-gray-500 text-xs">SL: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t text-right font-bold text-red-600">
                Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
