export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface UserProfile {
  id: number;
  user: User;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  is_shopowner: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  image_url?: string;
  category: Category;
  tags: Tag[];
  variants: ProductVariant[];
  reviews: Review[];
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  product: number;
  name: string;
  value: string;
  price_adjustment?: string;
  stock_quantity?: number;
}

export interface Shop {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  shopowner: User;
  products: Product[];
  logo_url?: string;
  banner_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product: number;
  user: User;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user: User;
  shop: Shop;
  total_amount: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  order_items: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: string;
}

export interface Payment {
  id: number;
  order: Order;
  amount: string;
  payment_method: 'card' | 'bank_transfer' | 'mobile_money' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: number;
  user: User;
  products: Product[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Message {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user: User;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ShopOwnerRegisterRequest extends RegisterRequest {
  phone_number?: string;
  shop_name: string;
  shop_description?: string;
  shop_address?: string;
  shop_phone?: string;
  business_license?: string;
  tax_id?: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
