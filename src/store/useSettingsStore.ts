import { create } from 'zustand';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { firestoreCache } from '../lib/firestoreCache';

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
  instagramUrl?: string;
  tiktokUrl?: string;
  footerText: string;
  warrantyPolicy?: string;
  aboutUsContent?: string;
  theme?: StoreTheme;
}

interface SettingsState {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  updateTheme: (newTheme: Partial<StoreTheme>) => Promise<void>;
  subscribeSettings: () => () => void;
}

const defaultTheme: StoreTheme = {
  topbar: { bg: 'rgb(219, 28, 50)', text: '#ffffff' },
  header: { bg: 'rgb(219, 28, 50)', text: '#ffffff' },
  menu: { bg: 'rgb(190, 15, 35)', text: '#ffffff' },
};

const defaultSettings: StoreSettings = {
  storeName: 'AloStore',
  phone: '0364760807',
  address: 'Hà Nội, Việt Nam',
  email: 'cskh@alostore.com',
  facebookUrl: 'https://facebook.com',
  zaloUrl: 'https://zalo.me',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  footerText: '© 2026 AloStore.',
  theme: defaultTheme,
  aboutUsContent: `<p>Với phương châm <strong>"Uy tín tạo nên thương hiệu"</strong>, AloStore luôn đặt chất lượng sản phẩm và sự hài lòng của khách hàng lên hàng đầu. Mỗi sản phẩm trước khi đến tay khách hàng đều được kiểm tra kỹ lưỡng, đảm bảo hoạt động ổn định và đúng như cam kết.</p>
<p>AloStore hướng tới trở thành địa chỉ tin cậy về công nghệ tại Quảng Ninh, nơi khách hàng có thể an tâm lựa chọn sản phẩm với mức giá hợp lý và dịch vụ chuyên nghiệp.</p>
<p class="font-medium text-[rgb(219,28,50)] italic">Chúng tôi không chỉ bán sản phẩm, mà còn mang đến trải nghiệm mua sắm đơn giản – nhanh chóng – đáng tin cậy.</p>`,
  warrantyPolicy: `<h2>I. Cam kết Lỗi Đổi Liền của AloStore</h2>
<p>Trong <strong>30 ngày đầu tiên</strong> kể từ ngày mua hàng, nếu sản phẩm phát sinh lỗi phần cứng do nhà sản xuất, quý khách sẽ được <strong>đổi ngay 1 sản phẩm mới nguyên seal</strong> (cùng model, cùng màu sắc) mà không phát sinh thêm bất kỳchi phí nào.</p>
<ul>
  <li><strong>Điều kiện áp dụng:</strong> Sản phẩm giữ nguyên tình trạng ban đầu, vỏ máy không trầy xước, cấn móp, rơi vỡ, không bị vào nước.</li>
  <li>Yêu cầu có đầy đủ hộp, sách hướng dẫn, phụ kiện đi kèm, tem bảo hành (nếu có) và hóa đơn mua hàng hợp lệ.</li>
</ul>

<h2>II. Chính sách đổi/trả hàng hoá của AloStore</h2>
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
  <li><strong>Địa điểm bảo hành:</strong> Quý khách có thể mang trực tiếp sản phẩm đến các Trung Tâm Bảo Hành ủy quyền của hãng, hoặc gửi máy tại toàn bộ chi nhánh cửa hàng của AloStore để được hỗ trợ tiếp nhận.</li>
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

// Initialize settings from cache synchronously for instant load
const getInitialSettings = (): StoreSettings => {
  const cached = firestoreCache.getSync<StoreSettings>('settings');
  return cached ? { ...defaultSettings, ...cached } : defaultSettings;
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: getInitialSettings(),
  updateSettings: async (newSettings) => {
    try {
      const merged = { ...get().settings, ...newSettings };
      await setDoc(doc(db, 'settings', 'global'), merged);
      firestoreCache.set('settings', merged, 60 * 60 * 1000);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lưu cài đặt');
    }
  },
  updateTheme: async (newTheme) => {
    try {
      const current = get().settings;
      const merged = { 
        ...current, 
        theme: { ...(current.theme || defaultTheme), ...newTheme } 
      };
      await setDoc(doc(db, 'settings', 'global'), merged);
      firestoreCache.set('settings', merged, 60 * 60 * 1000);
    } catch (error) {
      console.error(error);
    }
  },
  subscribeSettings: () => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        // Force update to AloStore and new red theme if the user is stuck on HoangHaMobile
        let needsUpdate = false;
        if (data.storeName.toLowerCase().includes('hoanghamobile')) {
          data.storeName = 'AloStore';
          data.footerText = '© 2026 AloStore.';
          needsUpdate = true;
        }
        if (!data.theme || data.theme.header.bg === '#00483d') {
          data.theme = defaultTheme;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
            setDoc(doc(db, 'settings', 'global'), { ...defaultSettings, ...data });
        }
        
        const mergedSettings = { ...defaultSettings, ...data };
        set({ settings: mergedSettings });
        firestoreCache.set('settings', mergedSettings, 10 * 60 * 1000);
      } else {
        setDoc(doc(db, 'settings', 'global'), defaultSettings).catch(console.error);
      }
    });
    return unsub;
  }
}));
