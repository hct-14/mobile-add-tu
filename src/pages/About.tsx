import { useSettingsStore } from '../store/useSettingsStore';
import { MapPin, Phone, Clock, CheckCircle, Award, Heart } from 'lucide-react';

export default function About() {
  const { settings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#00483d] to-[#006b52] text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold text-center mb-4">
            Chào mừng đến với {settings.storeName}
          </h1>
          <p className="text-center text-lg opacity-90 max-w-2xl mx-auto">
            {settings.storeName} là cửa hàng chuyên cung cấp các sản phẩm công nghệ chính hãng và uy tín, 
            mang đến cho khách hàng những lựa chọn tốt nhất về điện thoại, phụ kiện và dịch vụ sửa chữa.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        
        {/* About Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#00483d] mb-6 flex items-center">
            <Heart className="mr-3" />
            Về chúng tôi
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Với phương châm <strong className="text-[#00483d]">"Uy tín tạo nên thương hiệu"</strong>, 
              {settings.storeName} luôn đặt chất lượng sản phẩm và sự hài lòng của khách hàng lên hàng đầu. 
              Mỗi sản phẩm trước khi đến tay khách hàng đều được kiểm tra kỹ lưỡng, 
              đảm bảo hoạt động ổn định và đúng như cam kết.
            </p>
            <p>
              {settings.storeName} hướng tới trở thành địa chỉ tin cậy về công nghệ tại <strong>Quảng Ninh</strong>, 
              nơi khách hàng có thể an tâm lựa chọn sản phẩm với mức giá hợp lý và dịch vụ chuyên nghiệp.
            </p>
            <p className="mt-4 text-[#00483d] font-medium">
              Chúng tôi không chỉ bán sản phẩm, mà còn mang đến trải nghiệm mua sắm <strong>đơn giản – nhanh chóng – đáng tin cậy</strong>.
            </p>
          </div>
        </section>

        {/* Products & Services */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#00483d] mb-6 flex items-center">
            <Award className="mr-3" />
            Sản phẩm & Dịch vụ
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="font-bold text-lg mb-2">Điện thoại</h3>
              <p className="text-gray-600 text-sm">
                iPhone, Samsung, Xiaomi… (mới & like new)
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">🎧</div>
              <h3 className="font-bold text-lg mb-2">Phụ kiện</h3>
              <p className="text-gray-600 text-sm">
                Sạc, cáp, tai nghe, ốp lưng chính hãng
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="font-bold text-lg mb-2">Thu cũ đổi mới</h3>
              <p className="text-gray-600 text-sm">
                Hỗ trợ lên đời thiết bị với giá tốt nhất
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="font-bold text-lg mb-2">Sửa chữa</h3>
              <p className="text-gray-600 text-sm">
                Thay thế linh kiện nhanh chóng, chất lượng
              </p>
            </div>
          </div>
        </section>

        {/* Commitments */}
        <section className="bg-gradient-to-r from-[#00483d] to-[#006b52] rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CheckCircle className="mr-3" />
            Cam kết của chúng tôi
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start bg-white/10 rounded-lg p-4">
              <CheckCircle className="text-yellow-400 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold">Sản phẩm chất lượng</h3>
                <p className="text-sm opacity-90">Nguồn gốc rõ ràng, chính hãng 100%</p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 rounded-lg p-4">
              <CheckCircle className="text-yellow-400 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold">Giá cả cạnh tranh</h3>
                <p className="text-sm opacity-90">Nhiều ưu đãi hấp dẫn mỗi ngày</p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 rounded-lg p-4">
              <CheckCircle className="text-yellow-400 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold">Bảo hành minh bạch</h3>
                <p className="text-sm opacity-90">Hỗ trợ tận tâm, nhanh chóng</p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 rounded-lg p-4">
              <CheckCircle className="text-yellow-400 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold">Tư vấn đúng nhu cầu</h3>
                <p className="text-sm opacity-90">Không ép buộc mua hàng</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#00483d] mb-6 flex items-center">
            <MapPin className="mr-3" />
            Thông tin liên hệ
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{settings.storeName}</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="text-[#00483d] mr-3 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-gray-600">Chợ Tiền An, Quảng Yên, Quảng Ninh</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-[#00483d] mr-3 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-medium">Hotline</p>
                    <p className="text-gray-600">
                      <a href="tel:0364760807" className="hover:text-[#00483d]">0364.760.807</a>
                      {' / '}
                      <a href="tel:0386151863" className="hover:text-[#00483d]">0386.151.863</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="text-[#00483d] mr-3 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-medium">Giờ mở cửa</p>
                    <p className="text-gray-600">7h30 - 20h30 (Hàng ngày)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map placeholder */}
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin size={48} className="mx-auto mb-2" />
                <p>Bản đồ sẽ được cập nhật</p>
                <a 
                  href="https://maps.google.com/?q=Chợ+Tiền+An,+Quảng+Yên,+Quảng+Ninh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00483d] hover:underline text-sm"
                >
                  Mở trong Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
