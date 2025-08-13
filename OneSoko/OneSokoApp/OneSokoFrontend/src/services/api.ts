import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { config, API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES } from '../config/environment';
import {
  User,
  UserProfile,
  Shop,
  Product,
  Category,
  Review,
  Order,
  CreateOrder,
  Payment,
  CreatePayment,
  Wishlist,
  Message,
  Notification,
  Cart,
  LoginForm,
  RegisterForm,
  ProductVariant,
  CreateProductVariant,
  SearchFilters,
  PaginatedResponse
} from '../types';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_STORAGE_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${config.API_BASE_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem(config.TOKEN_STORAGE_KEY, response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem(config.TOKEN_STORAGE_KEY);
        localStorage.removeItem(config.REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(config.USER_STORAGE_KEY);
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Error handler utility
const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data as any;
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return data?.detail || data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return data?.detail || data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  } else if (error.request) {
    // Network error
    return ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Other error
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Authentication API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<{ access: string; refresh: string }> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  register: async (userData: RegisterForm): Promise<User> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  registerShopOwner: async (userData: RegisterForm): Promise<User> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.REGISTER_SHOP_OWNER, userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  logout: (): void => {
    localStorage.removeItem(config.TOKEN_STORAGE_KEY);
    localStorage.removeItem(config.REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(config.USER_STORAGE_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(config.TOKEN_STORAGE_KEY);
  },
};

// User API
export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    try {
      const response: AxiosResponse = await api.get('/api/user/me/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response: AxiosResponse = await api.patch('/api/user/update_me/', userData);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Products API
export const productsAPI = {
  getAll: async (filters?: SearchFilters): Promise<PaginatedResponse<Product>> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.PRODUCTS}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getById: async (id: string): Promise<Product> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getByCategory: async (categorySlug: string): Promise<Product[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.CATEGORY_DETAIL(parseInt(categorySlug))}/products/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  search: async (query: string, filters?: SearchFilters): Promise<Product[]> => {
    try {
      const params = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.PRODUCT_SEARCH}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getMyProducts: async (): Promise<Product[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.MY_PRODUCTS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Shops API
export const shopsAPI = {
  getAll: async (): Promise<Shop[]> => {
    try {
      // Use public endpoint that doesn't require authentication
      const response: AxiosResponse = await api.get(API_ENDPOINTS.SHOP_PUBLIC_LIST);
      
      // Handle enhanced response format
      if (response.data && response.data.shops) {
        return response.data.shops;
      }
      
      // Fallback for direct array response
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getById: async (id: string): Promise<Shop> => {
    try {
      // Use public endpoint that doesn't require authentication
      const response: AxiosResponse = await api.get(API_ENDPOINTS.SHOP_PUBLIC_DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getBySlug: async (slug: string): Promise<Shop> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.SHOP_PUBLIC(slug));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getProducts: async (shopId: string): Promise<Product[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.SHOP_PRODUCTS(shopId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  search: async (query: string, location?: string): Promise<Shop[]> => {
    try {
      const params = new URLSearchParams({ q: query });
      if (location) params.append('location', location);
      
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.SHOP_SEARCH}?${params.toString()}`);
      
      // Handle the enhanced search response format
      if (response.data && response.data.shops) {
        return response.data.shops;
      }
      
      // Fallback for direct array response
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Advanced search with filters
  advancedSearch: async (filters: {
    q?: string;
    city?: string;
    country?: string;
    status?: string;
  }): Promise<{ count: number; query: string; filters: any; shops: Shop[] }> => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.city) params.append('city', filters.city);
      if (filters.country) params.append('country', filters.country);
      if (filters.status) params.append('status', filters.status);
      
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.SHOP_SEARCH}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Autocomplete search
  autocomplete: async (query: string): Promise<{ query: string; suggestions: Shop[] }> => {
    try {
      const params = new URLSearchParams({ q: query });
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.SHOP_AUTOCOMPLETE}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Search by location
  searchByLocation: async (city?: string, country?: string): Promise<{
    locations: Array<{
      city: string;
      country: string;
      shop_count: number;
      recent_shops: Shop[];
    }>
  }> => {
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);
      
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.SHOP_BY_LOCATION}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get trending shops
  getTrending: async (): Promise<{ trending_shops: Shop[] }> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.SHOP_TRENDING);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Quick create shop
  quickCreate: async (shopData: {
    name: string;
    description: string;
    shopowner?: string;
    city?: string;
    country?: string;
  }): Promise<Shop> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.SHOP_QUICK_CREATE, shopData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Enhanced public list with search
  getPublicList: async (params?: {
    search?: string;
    city?: string;
    country?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ count: number; has_search: boolean; shops: Shop[] }> => {
    try {
      const urlParams = new URLSearchParams();
      if (params?.search) urlParams.append('search', params.search);
      if (params?.city) urlParams.append('city', params.city);
      if (params?.country) urlParams.append('country', params.country);
      if (params?.page) urlParams.append('page', params.page.toString());
      if (params?.page_size) urlParams.append('page_size', params.page_size.toString());
      
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.SHOP_PUBLIC_LIST}?${urlParams.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  create: async (shopData: FormData): Promise<Shop> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.SHOPS, shopData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  addProduct: async (shopId: string, productData: FormData): Promise<Product> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.SHOP_ADD_PRODUCT(shopId), productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  updateProduct: async (shopId: string, productId: string, productData: FormData): Promise<Product> => {
    try {
      const response: AxiosResponse = await api.put(API_ENDPOINTS.SHOP_UPDATE_PRODUCT(shopId, productId), productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  deleteProduct: async (shopId: string, productId: string): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.SHOP_DELETE_PRODUCT(shopId, productId));
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getMyShops: async (): Promise<Shop[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.SHOP_MY_SHOPS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateShop: async (shopId: string, shopData: Partial<Shop>): Promise<Shop> => {
    try {
      const response: AxiosResponse = await api.put(API_ENDPOINTS.SHOP_UPDATE(shopId), shopData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  uploadVerificationDocument: async (shopId: string, documentData: FormData): Promise<any> => {
    try {
      const response: AxiosResponse = await api.post(
        API_ENDPOINTS.SHOP_VERIFICATION_UPLOAD(shopId), 
        documentData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  submitVerification: async (shopId: string, documentIds: string[]): Promise<Shop> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.SHOP_VERIFICATION_SUBMIT(shopId), {
        document_ids: documentIds
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Cart API
export const cartAPI = {
  getCart: async (): Promise<Cart> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CART);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  addToCart: async (productId: string, shopId: string, quantity: number = 1): Promise<Cart> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.CART_ADD_ITEM, {
        product_id: productId,
        shop_id: shopId,
        quantity: quantity,
      });
      return response.data.cart;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    try {
      const response: AxiosResponse = await api.put(API_ENDPOINTS.CART_UPDATE_ITEM(itemId), {
        quantity: quantity,
      });
      return response.data.cart;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  removeFromCart: async (itemId: number): Promise<Cart> => {
    try {
      const response: AxiosResponse = await api.delete(API_ENDPOINTS.CART_REMOVE_ITEM(itemId));
      return response.data.cart;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  clearCart: async (): Promise<Cart> => {
    try {
      const response: AxiosResponse = await api.delete(API_ENDPOINTS.CART_CLEAR);
      return response.data.cart;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getCartItemCount: async (): Promise<number> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CART_ITEM_COUNT);
      return response.data.item_count;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.ORDER_MY_ORDERS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getById: async (orderId: number): Promise<Order> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.ORDER_DETAIL(orderId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  create: async (orderData: CreateOrder): Promise<Order> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.ORDERS, orderData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  createFromCart: async (): Promise<Order[]> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.ORDER_CREATE_FROM_CART);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateStatus: async (orderId: number, status: string): Promise<Order> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.ORDER_UPDATE_STATUS(orderId), { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getOrderDetails: async (orderId: number): Promise<Order> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.ORDER_DETAILS(orderId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Shop Owner Order Management
  getShopOrders: async (filters?: { status?: string; shop_id?: string }): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.shop_id) params.append('shop_id', filters.shop_id);
      
      const response: AxiosResponse = await api.get(
        `${API_ENDPOINTS.ORDER_SHOP_ORDERS}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getShopOrderStats: async (): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.ORDER_SHOP_STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  completeOrder: async (orderId: number): Promise<Order> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.ORDER_COMPLETE(orderId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PAYMENT_MY_PAYMENTS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getById: async (paymentId: number): Promise<Payment> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PAYMENT_DETAIL(paymentId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  create: async (paymentData: CreatePayment): Promise<Payment> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.PAYMENTS, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateStatus: async (paymentId: number, status: string): Promise<Payment> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.PAYMENT_UPDATE_STATUS(paymentId), { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getBySlug: async (slug: string): Promise<Category> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CATEGORY_DETAIL(parseInt(slug)));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  search: async (query: string): Promise<Category[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.CATEGORY_SEARCH}?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getProducts: async (categoryId: number): Promise<{ category: Category; products: Product[]; count: number }> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CATEGORY_PRODUCTS(categoryId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getStats: async (): Promise<{ total_categories: number; categories: Array<{ id: number; name: string; slug: string; product_count: number }> }> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CATEGORY_STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getPopularProducts: async (categoryId: number): Promise<{ category: Category; popular_products: Product[] }> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.CATEGORY_POPULAR_PRODUCTS(categoryId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  create: async (categoryData: { name: string; description?: string; slug?: string }): Promise<Category> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.CATEGORIES, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Reviews API
export const reviewsAPI = {
  // Get all reviews with optional filtering
  getAll: async (params?: {
    review_type?: 'product' | 'shop';
    product_id?: string;
    shop_id?: string;
    rating?: number;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<Review[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEWS, { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get a specific review
  getById: async (id: number): Promise<Review> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEW_DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Create a new review
  create: async (reviewData: {
    product?: string;
    shop?: string;
    rating: number;
    comment: string;
  }): Promise<Review> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.REVIEWS, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Update a review
  update: async (id: number, reviewData: {
    rating?: number;
    comment?: string;
  }): Promise<Review> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.REVIEW_DETAIL(id), reviewData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Delete a review
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.REVIEW_DETAIL(id));
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get current user's reviews
  getMyReviews: async (): Promise<Review[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEWS_MY);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get reviews for a specific product
  getByProduct: async (productId: string): Promise<Review[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEWS_BY_PRODUCT, {
        params: { product_id: productId }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get reviews for a specific shop
  getByShop: async (shopId: string): Promise<Review[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEWS_BY_SHOP, {
        params: { shop_id: shopId }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get review statistics
  getStats: async (params: {
    product_id?: string;
    shop_id?: string;
  }): Promise<{
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<number, number>;
    recent_reviews: Review[];
    helpful_reviews: Review[];
  }> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEWS_STATS, { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Mark a review as helpful
  markHelpful: async (id: number): Promise<Review> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.REVIEW_MARK_HELPFUL(id));
      return response.data.review;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Get pending moderation reviews (admin only)
  getPendingModeration: async (): Promise<Review[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.REVIEWS_PENDING_MODERATION);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  // Moderate a review (admin only)
  moderate: async (id: number, status: 'approved' | 'rejected'): Promise<Review> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.REVIEW_MODERATE(id), {
        status
      });
      return response.data.review;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Wishlist API
export const wishlistAPI = {
  getMyWishlist: async (): Promise<Wishlist> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.WISHLIST_MY);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  create: async (): Promise<Wishlist> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.WISHLIST);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  addProduct: async (productId: string): Promise<void> => {
    try {
      const wishlist = await wishlistAPI.getMyWishlist();
      await api.post(API_ENDPOINTS.WISHLIST_ADD_PRODUCT(wishlist.id), { product: productId });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  removeProduct: async (productId: string): Promise<void> => {
    try {
      const wishlist = await wishlistAPI.getMyWishlist();
      await api.delete(API_ENDPOINTS.WISHLIST_REMOVE_PRODUCT(wishlist.id, productId));
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  isInWishlist: async (productId: string): Promise<boolean> => {
    try {
      const wishlist = await wishlistAPI.getMyWishlist();
      return wishlist.products.some(product => product.productId === productId);
    } catch {
      return false;
    }
  },
};



// Messages API
export const messagesAPI = {
  getConversations: async (): Promise<any[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.MESSAGES_CONVERSATIONS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getWithUser: async (userId: number): Promise<Message[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.MESSAGES_WITH_USER}?user_id=${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  send: async (message: { recipient: number; content: string; shop?: string; product?: string }): Promise<Message> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.MESSAGES, message);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  markAsRead: async (messageId: number): Promise<void> => {
    try {
      await api.patch(API_ENDPOINTS.MESSAGE_MARK_READ(messageId));
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getUnreadCount: async (): Promise<number> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.MESSAGES_UNREAD_COUNT);
      return response.data.unread_count;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch(API_ENDPOINTS.MESSAGES_MARK_ALL_READ);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getSent: async (): Promise<Message[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.MESSAGES}sent/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getReceived: async (): Promise<Message[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.MESSAGES}received/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  delete: async (messageId: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINTS.MESSAGES}${messageId}/`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// Notifications API
export const notificationsAPI = {
  getMyNotifications: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATIONS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getUnread: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_UNREAD);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.patch(API_ENDPOINTS.NOTIFICATION_MARK_READ(notificationId));
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
    markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch(API_ENDPOINTS.NOTIFICATION_MARK_ALL_READ);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
      return response.data.unread_count;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// User Profile API
export const userProfileAPI = {
  getMyProfile: async (): Promise<UserProfile> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.USER_PROFILE_ME);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  createProfile: async (profileData: { bio: string; address: string; is_shopowner: boolean }): Promise<UserProfile> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.USER_PROFILE, profileData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.USER_PROFILE_ME, updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  updateBio: async (bio: string): Promise<UserProfile> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.USER_PROFILE_UPDATE_BIO, { bio });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  updateAddress: async (address: string): Promise<UserProfile> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.USER_PROFILE_UPDATE_ADDRESS, { address });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  uploadAvatar: async (file: File): Promise<UserProfile> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response: AxiosResponse = await api.post(API_ENDPOINTS.USER_PROFILE_UPLOAD_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  removeAvatar: async (): Promise<UserProfile> => {
    try {
      const response: AxiosResponse = await api.delete(API_ENDPOINTS.USER_PROFILE_REMOVE_AVATAR);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getCompletionStatus: async (): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.USER_PROFILE_COMPLETION_STATUS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getUserStats: async (): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.USER_PROFILE_STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  getPublicProfile: async (userId: number): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.USER_PROFILE_PUBLIC(userId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  searchUsers: async (username: string): Promise<any[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.USER_PROFILE_SEARCH}?username=${username}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
  
  toggleShopownerStatus: async (): Promise<any> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.USER_PROFILE_TOGGLE_SHOPOWNER);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }
};

// Product Inquiry API
export const inquiryAPI = {
  create: async (productId: string, message: string): Promise<any> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.INQUIRIES, {
        product_id: productId,
        message: message
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  respond: async (inquiryId: number, responseText: string): Promise<any> => {
    try {
      const response: AxiosResponse = await api.patch(`${API_ENDPOINTS.INQUIRY_RESPOND(inquiryId)}`, {
        response: responseText
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getMyInquiries: async (): Promise<any[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.INQUIRY_MY);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getReceivedInquiries: async (): Promise<any[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.INQUIRY_RECEIVED);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getPendingInquiries: async (): Promise<any[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.INQUIRY_PENDING);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  markResolved: async (inquiryId: number): Promise<any> => {
    try {
      const response: AxiosResponse = await api.patch(`${API_ENDPOINTS.INQUIRY_RESOLVE(inquiryId)}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }
};

// Enhanced Notification API
export const notificationAPI = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATIONS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getUnread: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_UNREAD);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
      return response.data.unread_count;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.patch(`${API_ENDPOINTS.NOTIFICATION_MARK_READ(notificationId)}`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch(API_ENDPOINTS.NOTIFICATION_MARK_ALL_READ);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getByType: async (type: string): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.NOTIFICATIONS}by_type/?type=${type}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getOrderNotifications: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_ORDER);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getCartNotifications: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_CART);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getProductNotifications: async (): Promise<Notification[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_PRODUCT);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getStats: async (): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.NOTIFICATION_STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  clearOld: async (): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.NOTIFICATION_CLEAR_OLD);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }
};

// Product Variants API
export const productVariantsAPI = {
  getAll: async (): Promise<ProductVariant[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PRODUCT_VARIANTS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getById: async (id: number): Promise<ProductVariant> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.PRODUCT_VARIANTS}${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  create: async (variantData: CreateProductVariant): Promise<ProductVariant> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.PRODUCT_VARIANTS, variantData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  update: async (id: number, variantData: Partial<ProductVariant>): Promise<ProductVariant> => {
    try {
      const response: AxiosResponse = await api.put(`${API_ENDPOINTS.PRODUCT_VARIANTS}${id}/`, variantData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINTS.PRODUCT_VARIANTS}${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getByProduct: async (productId: string): Promise<ProductVariant[]> => {
    try {
      const response: AxiosResponse = await api.get(`${API_ENDPOINTS.PRODUCT_VARIANTS_BY_PRODUCT}?product_id=${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getMyProductVariants: async (): Promise<ProductVariant[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PRODUCT_VARIANTS_MY_PRODUCTS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getLowStock: async (): Promise<ProductVariant[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PRODUCT_VARIANTS_LOW_STOCK);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getOutOfStock: async (): Promise<ProductVariant[]> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PRODUCT_VARIANTS_OUT_OF_STOCK);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  getStats: async (): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(API_ENDPOINTS.PRODUCT_VARIANTS_STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updateQuantity: async (id: number, quantity: number): Promise<ProductVariant> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.PRODUCT_VARIANT_UPDATE_QUANTITY(id), { quantity });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  updatePriceAdjustment: async (id: number, priceAdjustment: number): Promise<ProductVariant> => {
    try {
      const response: AxiosResponse = await api.patch(API_ENDPOINTS.PRODUCT_VARIANT_UPDATE_PRICE(id), { price_adjustment: priceAdjustment });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  bulkCreate: async (productId: string, variants: Partial<ProductVariant>[]): Promise<ProductVariant[]> => {
    try {
      const response: AxiosResponse = await api.post(API_ENDPOINTS.PRODUCT_VARIANTS_BULK_CREATE, {
        product_id: productId,
        variants: variants
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  bulkDelete: async (variantIds: number[]): Promise<any> => {
    try {
      const response: AxiosResponse = await api.delete(API_ENDPOINTS.PRODUCT_VARIANTS_BULK_DELETE, {
        data: { variant_ids: variantIds }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }
};

export default api; 