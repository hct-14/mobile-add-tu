import { useUserStore } from '../store/useUserStore';
import { Link } from 'react-router-dom';

export default function Orders() {
  const user = useUserStore((state) => state.user);

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
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">📦</span>
        </div>
        <p>Bạn chưa có đơn hàng nào.</p>
        <Link to="/" className="text-[#00483d] hover:underline mt-4 inline-block font-medium">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
