// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  last_login?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user: string; // This is a string representation from StringRelatedField
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string;
  bio: string;
  avatar: string | null;
  address: string;
  is_shopowner: boolean;
}

// Shop Types
export interface Shop {
  shopId: string;
  name: string;
  description: string;
  location: string;
  logo: string | null;
  created_at: string;
  status: 'active' | 'suspended' | 'pending';
  phone: string;
  email: string;
  social_link: string;
  slug: string;
  views: number;
  total_sales: number;
  total_orders: number;
  latitude: number | null;
  longitude: number | null;
  street: string;
  city: string;
  country: string;
  shopowner: User;
  products?: Product[];
  
  // Enhanced Shop Identification Fields
  business_registration_number?: string;
  tax_identification_number?: string;
  business_type: 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc' | 'other';
  business_category: string;
  business_license?: string;
  website_url?: string;
  operating_hours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  payment_methods: string[];
  delivery_options: string[];
  return_policy?: string;
  shipping_policy?: string;
  terms_of_service?: string;
  privacy_policy?: string;
  
  // Social Media Links
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  
  // Business Verification
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'not_started' | 'under_review';
  verification_documents?: VerificationDocument[];
  verification_date?: string;
  
  // Additional Business Info
  establishment_year?: number;
  employee_count?: number;
  annual_revenue_range?: 'under_10k' | '10k_50k' | '50k_100k' | '100k_500k' | '500k_1m' | 'over_1m';
  target_market?: string;
  business_mission?: string;
  
  // Performance Metrics
  average_rating: number;
  total_reviews: number;
  response_rate: number;
  response_time_hours: number;
  
  // SEO and Marketing
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  featured_image?: string;
  gallery_images?: string[];
  
  // Compliance and Legal
  gdpr_compliant: boolean;
  terms_accepted: boolean;
  last_updated: string;
  updated_by: string;
}

// Product Types
export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string | null;
  category: Category | null;
  tags: Tag[];
  discount: number;
  promotional_price: number | null;
  is_active: boolean;
  shops: Shop[];
  rating?: number;
  stock?: number;
  created_at?: string;
  shop?: Shop;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  product: Product;
  name: string;
  value: string;
  price_adjustment: number;
  quantity: number;
  total_price?: number;
}

export interface CreateProductVariant {
  product: string; // productId
  name: string;
  value: string;
  price_adjustment: number;
  quantity: number;
}

// Review Types
export interface Review {
  id: number;
  review_type: 'product' | 'shop';
  product: Product | null;
  shop: Shop | null;
  user: User;
  username: string;
  first_name: string;
  last_name: string;
  rating: number;
  comment: string;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  product_name?: string;
  shop_name?: string;
  reviewed_item_name?: string;
}

// Order Types
export interface OrderItem {
  id: number;
  order: number;
  product: Product;
  quantity: number;
  total_price: number;
}

export interface CreateOrderItem {
  product_id: string;
  quantity: number;
}

export interface Order {
  id: number;
  user: User;
  shop: Shop;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrder {
  shop_id: string;
  items: CreateOrderItem[];
}

// Payment Types
export interface Payment {
  id: number;
  order: number | Order;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreatePayment {
  order_id: number;
  amount: number;
  payment_method?: string;
}

// Wishlist Types
export interface Wishlist {
  id: number;
  user: User;
  products: Product[];
}

// Message Types
export interface Message {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  is_read: boolean;
  timestamp: string;
  shop: Shop | null;
  product: Product | null;
}

// Notification Types
export interface Notification {
  id: number;
  user: User;
  message: string;
  type: string;
  is_read: boolean;
  timestamp: string;
  shop: Shop | null;
  product: Product | null;
  order: Order | null;
  inquiry: any | null;
  data: any;
}

// Cart Types
export interface CartItem {
  id: number;
  product: Product;
  shop: Shop;
  quantity: number;
  added_at: string;
  updated_at: string;
  total_price: number;
}

export interface Cart {
  id: number;
  user: User;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Search and Filter Types
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  location?: string;
  sortBy?: 'price' | 'rating' | 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Business Verification Types
export interface VerificationDocument {
  id: string;
  name: string;
  type: 'business_license' | 'tax_certificate' | 'identity_document' | 'bank_statement' | 'utility_bill' | 'other';
  file?: File | null;
  url?: string;
  uploadedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
} 