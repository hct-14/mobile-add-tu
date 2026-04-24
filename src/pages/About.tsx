import React from 'react';
import { Smartphone, Headphones, RefreshCcw, Wrench, MapPin, Phone, Clock, ShieldCheck, HeartHandshake, Zap, ThumbsUp } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

export default function About() {
  const settings = useSettingsStore(state => state.settings);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#00483d] to-[#006e5e] text-white rounded-3xl p-8 md:p-12 shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">Chào mừng đến với AloStore</h1>
        <p className="text-lg md:text-xl text-green-50 max-w-3xl leading-relaxed">
          AloStore là cửa hàng chuyên cung cấp các sản phẩm công nghệ chính hãng và uy tín, mang đến cho khách hàng những lựa chọn tốt nhất về điện thoại, phụ kiện và dịch vụ sửa chữa.
        </p>
      </div>

      {/* Về chúng tôi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-4 border-yellow-400 pb-2 inline-block">Về chúng tôi</h2>
          <div 
            className="space-y-4 text-gray-700 text-lg leading-relaxed content"
            dangerouslySetInnerHTML={{ __html: settings.aboutUsContent || '' }}
          />
        </div>
        <div className="hidden md:block rounded-xl overflow-hidden shadow-xl">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" alt="AloStore Store" loading="lazy" className="w-full h-[400px] object-cover" />
        </div>
      </div>

      {/* Sản phẩm & Dịch vụ */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Sản phẩm & Dịch vụ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Smartphone size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Điện thoại</h3>
            <p className="text-gray-600">iPhone, Samsung, Xiaomi…<br/>(mới & like new)</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Headphones size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Phụ kiện</h3>
            <p className="text-gray-600">Sạc, cáp, tai nghe, ốp lưng chính hãng</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <RefreshCcw size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Thu cũ đổi mới</h3>
            <p className="text-gray-600">Hỗ trợ lên đời thiết bị với giá thu vô cùng tốt nhất</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Wrench size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Sửa chữa</h3>
            <p className="text-gray-600">Thay thế linh kiện nhanh chóng, chất lượng uy tín</p>
          </div>
        </div>
      </div>

      {/* Cam kết */}
      <div className="bg-[#f8fcfb] rounded-3xl p-8 md:p-12 border border-green-50">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">Cam kết của chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4 items-start">
            <div className="mt-1 bg-white p-3 rounded-full text-green-600 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Sản phẩm chất lượng</h3>
              <p className="text-gray-600">Nguồn gốc xuất xứ rõ ràng, chính hãng 100%.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="mt-1 bg-white p-3 rounded-full text-green-600 shadow-sm">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Giá cả cạnh tranh</h3>
              <p className="text-gray-600">Nhiều chương trình ưu đãi hấp dẫn mỗi ngày.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="mt-1 bg-white p-3 rounded-full text-green-600 shadow-sm">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Bảo hành minh bạch</h3>
              <p className="text-gray-600">Hỗ trợ chăm sóc bảo hành tận tâm, nhanh chóng.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="mt-1 bg-white p-3 rounded-full text-green-600 shadow-sm">
              <ThumbsUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Tư vấn đúng nhu cầu</h3>
              <p className="text-gray-600">Luôn lắng nghe, không chèo kéo, không ép buộc mua hàng.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin liên hệ & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 border-b-4 border-yellow-400 pb-2 inline-block w-fit">Thông tin liên hệ</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="text-[#00483d] flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-gray-900">Địa chỉ</h4>
                <p className="text-gray-600">Chợ Tiền An, Quảng Yên, Quảng Ninh</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-[#00483d] flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-gray-900">Hotline</h4>
                <p className="text-gray-600">0364.760.807 / 0386.151.863</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-[#00483d] flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-gray-900">Giờ mở cửa</h4>
                <p className="text-gray-600">7h30 - 20h30 (Hàng ngày)</p>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Chợ+Tiền+An,+Quảng+Yên,+Quảng+Ninh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#00483d] text-white px-6 py-3 rounded-full font-medium hover:bg-[#00382d] transition-colors"
              >
                <MapPin size={20} />
                Mở trong Google Maps
              </a>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] lg:h-full w-full min-h-[300px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14896.790587786016!2d106.7770889!3d20.932757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a70b28489aedd%3A0xc68820c4f82c23bc!2zQ2jhu6MgVGnhu4FuIEFu!5e0!3m2!1svi!2s!4v1711234567890!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={Boolean(true)} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ AloStore"
          />
        </div>
      </div>
    </div>
  );
}
