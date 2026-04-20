import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ObjectColors {
  bg: string;
  text: string;
}

export interface StoreTheme {
  topbar: ObjectColors;
  header: ObjectColors;
  menu: ObjectColors;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  address: string;
  email: string;
  facebookUrl: string;
  zaloUrl: string;
  footerText: string;
  warrantyPolicy?: string;
  theme?: StoreTheme;
}

interface SettingsState {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateTheme: (newTheme: Partial<StoreTheme>) => void;
}

const defaultTheme: StoreTheme = {
  topbar: { bg: '#00483d', text: '#ffffff' },
  header: { bg: '#00483d', text: '#ffffff' },
  menu: { bg: '#00382f', text: '#ffffff' },
};

const defaultSettings: StoreSettings = {
  storeName: 'HoangHaMobile',
  phone: '1900 2091',
  address: 'Số 89 Tam Trinh, Phường Mai Động, Quận Hoàng Mai, Thành Phố Hà Nội, Việt Nam.',
  email: 'cskh@hoanghamobile.com',
  facebookUrl: 'https://facebook.com',
  zaloUrl: 'https://zalo.me',
  footerText: '© 2026 Công ty Cổ phần Xây dựng và Đầu tư Thương mại Hoàng Hà.',
  theme: defaultTheme,
  warrantyPolicy: `<h2>I. Cam kết Lỗi Đổi Liền của Hoàng Hà</h2>
<p>Trong <strong>30 ngày đầu tiên</strong> kể từ ngày mua hàng, nếu sản phẩm phát sinh lỗi phần cứng do nhà sản xuất, quý khách sẽ được <strong>đổi ngay 1 sản phẩm mới nguyên seal</strong> (cùng model, cùng màu sắc) mà không phát sinh thêm bất kỳ chi phí nào.</p>
<ul>
  <li><strong>Điều kiện áp dụng:</strong> Sản phẩm giữ nguyên tình trạng ban đầu, vỏ máy không trầy xước, cấn móp, rơi vỡ, không bị vào nước.</li>
  <li>Yêu cầu có đầy đủ hộp, sách hướng dẫn, phụ kiện đi kèm, tem bảo hành (nếu có) và hóa đơn mua hàng hợp lệ.</li>
</ul>

<h2>II. Chính sách đổi/trả hàng hoá của Hoàng Hà</h2>
<p>Đối với các sản phẩm khách hàng mua tại hệ thống, chúng tôi áp dụng quy định trả hàng như sau:</p>
<ul>
  <li><strong>Trả hàng do lỗi nhà sản xuất:</strong> Trong 30 ngày đầu, quý khách có thể trả lại hàng và được hoàn tiền 100% (nếu không đổi sản phẩm khác hoặc sản phẩm thay thế đã hết hàng).</li>
  <li><strong>Đổi trả theo nhu cầu cá nhân (Sản phẩm không lỗi):</strong> Trong vòng 15 ngày, nếu sản phẩm không lỗi nhưng quý khách muốn trả hàng, hệ thống sẽ hỗ trợ thu mua lại với mức <strong>phí 20%</strong> giá trị sản phẩm.</li>
</ul>
<p><em>*Lưu ý: Không áp dụng 100% đổi trả với các mặt hàng phụ kiện hao mòn (như ốp lưng đã dùng, miếng dán màn hình).</em></p>

<h2>III. Chính sách về bảo hành sản phẩm</h2>
<p>Nhằm mang đến tính minh bạch và sự an tâm tuyệt đối, toàn bộ thiết bị bán ra được áp dụng chế độ bảo hành chuẩn của hãng:</p>
<ol>
  <li><strong>Thời gian bảo hành:</strong> Điện thoại, máy tính bảng được bảo hành chính hãng từ <strong>12 đến 24 tháng</strong> (tùy thuộc vào quy định của từng thương hiệu như Apple, Samsung, Xiaomi,...). Củ sạc, cáp zin theo máy được bảo hành 6 - 12 tháng.</li>
  <li><strong>Địa điểm bảo hành:</strong> Quý khách có thể mang trực tiếp sản phẩm đến các Trung Tâm Bảo Hành ủy quyền của hãng, hoặc gửi máy tại toàn bộ chi nhánh cửa hàng của Hoàng Hà để được hỗ trợ tiếp nhận.</li>
  <li><strong>Các trường hợp TỪ CHỐI bảo hành (Out of Warranty):</strong>
    <ul>
      <li>Sản phẩm đã qua thời hạn bảo hành ghi nhận trên hệ thống.</li>
      <li>Thiết bị có dấu hiệu rơi vỡ, va đập mạnh, cấn móp, cong vênh, trầy xước nặng.</li>
      <li>Thiết bị bị chất lỏng xâm nhập (bị vào nước), hóa chất, bụi bẩn hoặc bảo quản trong môi trường nhiệt độ/độ ẩm không đúng tiêu chuẩn (có dấu hiệu quỳ tím đổi màu).</li>
      <li>Máy bị can thiệp phần mềm (Root, Jailbreak) không hợp lệ hoặc đã bị tự ý tháo mở, đem sửa chữa tại các cơ sở bên ngoài không thuộc ủy quyền.</li>
    </ul>
  </li>
</ol>`,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      updateTheme: (newTheme) => set((state) => ({
        settings: { 
          ...state.settings, 
          theme: { ...(state.settings.theme || defaultTheme), ...newTheme } 
        }
      })),
    }),
    {
      name: 'store-settings-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          persistedState.settings.warrantyPolicy = defaultSettings.warrantyPolicy;
        }
        if (version <= 1) {
          persistedState.settings.theme = defaultTheme;
        }
        return persistedState as SettingsState;
      }
    }
  )
);
