import React, { useState } from 'react';
import { Phone, RefreshCw, ShieldCheck, Zap, MessageSquare, ChevronDown, CheckCircle, Upload } from 'lucide-react';

export default function TradeIn() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    oldDevice: '',
    condition: '',
    newDevice: '',
    area: '',
    note: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'phone') {
      // Allow only numbers
      const value = e.target.value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [e.target.name]: value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#00483d] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Thu cũ minh bạch – Lên đời máy mới dễ dàng</h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Quy trình đơn giản, kiểm tra nhanh chóng, hỗ trợ đổi máy tiện lợi. Về giá thu cũ và mức bù chênh, shop sẽ tư vấn trực tiếp cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="bg-yellow-500 text-[#00483d] font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition">Liên hệ shop ngay</a>
            <a href="#register" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-[#00483d] transition">Đăng ký thu cũ</a>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {['Minh bạch quy trình', 'Hỗ trợ nhanh', 'Không thủ tục rườm rà', 'Tư vấn trực tiếp'].map(item => (
              <div key={item} className="flex items-center justify-center gap-2 bg-white/10 p-3 rounded-lg">
                <CheckCircle size={16} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Tại sao nên chọn thu cũ tại shop?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: RefreshCw, title: 'Thu cũ nhanh gọn', desc: 'Không mất thời gian rao bán, nhận máy mới ngay.' },
            { icon: Zap, title: 'Lên đời tiết kiệm', desc: 'Tối ưu chi phí, hỗ trợ giá tốt nhất khi đổi máy.' },
            { icon: ShieldCheck, title: 'Quy trình rõ ràng', desc: 'Mọi bước đều minh bạch, an tâm tuyệt đối.' },
            { icon: MessageSquare, title: 'Tư vấn tận tình', desc: 'Nhân viên hỗ trợ 1:1, giải đáp mọi thắc mắc.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-start gap-3">
              <item.icon className="text-[#00483d] flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-10 px-4 bg-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Quy trình 4 bước đơn giản</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { step: '01', title: 'Gửi thông tin', desc: 'Điền form hoặc chat.' },
              { step: '02', title: 'Tư vấn', desc: 'Shop liên hệ.' },
              { step: '03', title: 'Kiểm tra', desc: 'Mang máy qua shop.' },
              { step: '04', title: 'Hoàn tất', desc: 'Đổi máy, nhận máy mới.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg text-center">
                <div className="text-[#00483d] font-bold text-lg mb-1">{item.step}</div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Đăng ký thu cũ đổi mới</h2>
          <p className="text-center text-gray-500 mb-8">Vui lòng điền thông tin máy cũ và máy muốn đổi để shop tư vấn chi tiết.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Họ và tên *" required className="w-full border rounded-lg p-3" onChange={handleChange} />
              <input type="text" name="phone" placeholder="Số điện thoại *" required className="w-full border rounded-lg p-3" onChange={handleChange} value={formData.phone} />
            </div>
            <input type="text" name="oldDevice" placeholder="Dòng máy đang sử dụng *" required className="w-full border rounded-lg p-3" onChange={handleChange} />
            <input type="text" name="condition" placeholder="Tình trạng máy (trầy, lỗi, pin...)" className="w-full border rounded-lg p-3" onChange={handleChange} />
            <input type="text" name="newDevice" placeholder="Máy muốn đổi lên *" required className="w-full border rounded-lg p-3" onChange={handleChange} />
            <textarea name="note" placeholder="Ghi chú thêm" className="w-full border rounded-lg p-3" rows={3} onChange={handleChange}></textarea>
            
            <button type="submit" className="w-full bg-[#00483d] text-white font-bold py-4 rounded-lg hover:bg-[#00382f]">Gửi yêu cầu ngay</button>
          </form>
          {submitted && <p className="text-center text-green-600 mt-4 font-bold">Yêu cầu đã được gửi! Shop sẽ liên hệ với bạn sớm nhất.</p>}
        </div>
      </section>
    </div>
  );
}
