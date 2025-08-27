export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user: User;
  bio?: string;
  avatar_url?: string;
  cover_photo_url?: string;
  phone_number?: string;
  address?: string;
  website?: string;
  date_of_birth?: string;
  location?: string;
  is_shopowner: boolean;
  is_public: boolean;
  is_email_verified: boolean;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  verification_type?: string;
  verification_badge: {
    is_verified: boolean;
    type?: string;
    color?: string;
  };
  full_name: string;
  display_name: string;
  profile_completion_percentage: number;
  is_following?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: string;
  quantity: number;
  stock_quantity?: number;
  image?: string;
  image_url?: string;
  discount: string;
  promotional_price?: string;
  is_active: boolean;
  deleted_at?: string;
  category?: Category;
  tags: Tag[];
  variants?: ProductVariant[];
  reviews?: Review[];
  average_rating?: number;
  shops?: ShopBasicInfo[];
  // Additional properties for homepage display
  originalPrice?: number;
  rating?: number;
  badge?: string;
  shop?: string;
}

export interface ShopBasicInfo {
  shopId: string;
  name: string;
  location: string;
  city: string;
  country: string;
  logo_url?: string;
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
  shopId: string;
  id?: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  social_link?: string;
  slug: string;
  shopowner: User;
  products: Product[];
  logo?: string;
  logo_url?: string;
  status: 'active' | 'suspended' | 'pending';
  is_active: boolean;
  views: number;
  total_sales: string;
  total_orders: number;
  latitude?: string;
  longitude?: string;
  street: string;
  city: string;
  country: string;
  created_at: string;
  deleted_at?: string;
  products_count?: number;
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
  addedAt: string;
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
  profile?: UserProfile;
  shop?: Shop;
  is_new_user?: boolean;
  needs_shop_setup?: boolean;
  message?: string;
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
