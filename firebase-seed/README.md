# Firebase Seed Data

Thư mục chứa dữ liệu mẫu (seed data) để import vào Firebase Firestore.

## Cấu trúc dữ liệu

### Collections

| Collection | Mô tả | Số lượng document |
|------------|-------|-------------------|
| `categories` | Danh mục sản phẩm | 7 |
| `products` | Sản phẩm điện thoại | 8 |
| `banners` | Banner quảng cáo | 5 |
| `promotions` | Mã khuyến mãi | 5 |
| `campaigns` | Chiến dịch khuyến mãi | 3 |
| `settings` | Cấu hình cửa hàng | 3 |

## Cách sử dụng

### Cách 1: Sử dụng Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `alostore-61726`
3. Vào Firestore Database > Data
4. Import từng file JSON theo thứ tự:
   - `categories.json`
   - `products.json`
   - `banners.json`
   - `promotions.json`
   - `campaigns.json`
   - `settings.json`

### Cách 2: Sử dụng Script (Node.js)

```bash
# Cài đặt dependencies
npm install

# Chạy script import
npx tsx import-seed.ts
```

## Cập nhật Seed Data

Để thêm/sửa sản phẩm, chỉnh sửa file `products.json` với format:

```json
{
  "products": {
    "product_id_unique": {
      "id": "product_id_unique",
      "name": "Tên sản phẩm",
      "slug": "ten-san-pham",
      "price": 15000000,
      "category": "cat_iphone",
      "brand": "Apple",
      "inStock": true,
      "variants": [...]
    }
  }
}
```

## Lưu ý

- Dữ liệu trong `products` sử dụng image URLs từ Firebase Storage. Hãy upload hình ảnh trước khi import.
- Các `id` phải là unique trong collection.
- `category` trong product phải khớp với `id` trong collection `categories`.
