export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  specs: Record<string, string>;
  variants: ProductVariant[];
  inStock: boolean;
  isUsed?: boolean;
  description?: string;
  reviews?: Review[];
  inventoryQuantity?: number; // Added for inventory tracking
  offers?: string[];
}

export interface ImportSlip {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  importPrice: number;
  totalPrice: number;
  supplier: string;
  importDate: string;
  note?: string;
}

export interface Expense {
  id: string;
  name: string;
  type: 'Marketing' | 'Nhân sự' | 'Vận hành' | 'Khác';
  amount: number;
  expenseDate: string;
  note?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  storage?: string;
  ram?: string;
  condition?: string;
  price: number;
  inStock: boolean;
  stock: number; // So luong ton kho
  image?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  username?: string;
  dob?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantColor: string;
  variantStorage?: string;
  variantRam?: string;
  variantCondition?: string;
  priceAtOrder: number;
  quantity: number;
  stockAtOrder: number; // Stock luc dat hang
  productImage: string;
  variantImage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMethod?: 'store' | 'home';
  note: string;
  items: OrderItem[];
  total: number;
  promotionCode?: string;
  discountAmount?: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface WarrantyHistory {
  id: string;
  date: string;
  description: string;
  status: 'received' | 'processing' | 'completed';
}

export interface Warranty {
  id: string;
  imei: string;
  productName: string;
  color: string;
  customerPhone: string;
  startDate: string;
  durationMonths: number;
  endDate: string;
  history: WarrantyHistory[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  title: string;
  subtitle: string;
  type: 'hero' | 'sub';
}

export interface Promotion {
  id: string;
  code: string;
  discountType?: 'fixed' | 'percent';
  discountAmount?: number;
  discountPercent?: number;
  minOrderValue?: number;
  description: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount?: number;
  applicableCategories?: string[];
  applicableTo?: 'all' | 'cart' | 'products'; // 'all' = ap dung moi noi, 'cart' = chi gio hang, 'products' = chi san pham
  applicableToAll?: boolean; // true = ap dung tat ca noi (gio hang + san pham)
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Campaign {
  id: string;
  name: string;
  endDate: string;
  isActive: boolean;
  products: {
    productId: string;
    flashSalePrice: number;
  }[];
}
