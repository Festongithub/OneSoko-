// Environment configuration for OneSoko Frontend
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  
  // Environment
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.REACT_APP_ENABLE_DEBUG === 'true',
  
  // App Configuration
  APP_NAME: 'OneSoko',
  APP_VERSION: '1.0.0',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Authentication
  TOKEN_STORAGE_KEY: 'access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  USER_STORAGE_KEY: 'user_data',
  
  // Cart
  CART_STORAGE_KEY: 'onesoko_cart',
  
  // Notifications
  NOTIFICATION_TIMEOUT: 5000, // 5 seconds
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/token/',
  TOKEN_REFRESH: '/token/refresh/',
  REGISTER: '/user-registration/',
  REGISTER_SHOP_OWNER: '/shopowner-registration/',
  
  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id: string) => `/products/${id}/`,
  PRODUCT_SEARCH: '/products/search/',
  MY_PRODUCTS: '/products/my_products/',
  
  // Shops
  SHOPS: '/shops/',
  SHOP_DETAIL: (id: string) => `/shops/${id}/`,
  SHOP_PUBLIC: (slug: string) => `/shops/${slug}/public/`,
  SHOP_PUBLIC_LIST: '/shops/public_list/',
  SHOP_PUBLIC_DETAIL: (id: string) => `/shops/${id}/public_detail/`,
  SHOP_PRODUCTS: (id: string) => `/shops/${id}/products/`,
  SHOP_ADD_PRODUCT: (id: string) => `/shops/${id}/add_product/`,
  SHOP_UPDATE_PRODUCT: (shopId: string, productId: string) => `/shops/${shopId}/products/${productId}/`,
  SHOP_DELETE_PRODUCT: (shopId: string, productId: string) => `/shops/${shopId}/delete_product/${productId}/`,
  SHOP_MY_SHOPS: '/shops/my_shops/',
  SHOP_UPDATE: (id: string) => `/shops/${id}/`,
  SHOP_VERIFICATION_UPLOAD: (id: string) => `/shops/${id}/verification/upload/`,
  SHOP_VERIFICATION_SUBMIT: (id: string) => `/shops/${id}/verification/submit/`,
  SHOP_SEARCH: '/shops/search/',
  
  // Categories
  CATEGORIES: '/categories/',
  CATEGORY_DETAIL: (id: number) => `/categories/${id}/`,
  CATEGORY_SEARCH: '/categories/search/',
  CATEGORY_PRODUCTS: (id: number) => `/categories/${id}/products/`,
  CATEGORY_STATS: '/categories/stats/',
  CATEGORY_POPULAR_PRODUCTS: (id: number) => `/categories/${id}/popular_products/`,
  
  // Tags
  TAGS: '/tags/',
  TAG_DETAIL: (id: number) => `/tags/${id}/`,
  
  // Reviews API
  REVIEWS: '/reviews/',
  REVIEW_DETAIL: (id: number) => `/reviews/${id}/`,
  REVIEWS_MY: '/reviews/my_reviews/',
  REVIEWS_BY_PRODUCT: '/reviews/by_product/',
  REVIEWS_BY_SHOP: '/reviews/by_shop/',
  REVIEWS_STATS: '/reviews/stats/',
  REVIEWS_PENDING_MODERATION: '/reviews/pending_moderation/',
  REVIEW_MARK_HELPFUL: (id: number) => `/reviews/${id}/mark_helpful/`,
  REVIEW_MODERATE: (id: number) => `/reviews/${id}/moderate/`,
  
  // Cart
  CART: '/cart/',
  CART_ADD_ITEM: '/cart/add_item/',
  CART_UPDATE_ITEM: (itemId: number) => `/cart/update_item/${itemId}/`,
  CART_REMOVE_ITEM: (itemId: number) => `/cart/remove_item/${itemId}/`,
  CART_CLEAR: '/cart/clear_cart/',
  CART_ITEM_COUNT: '/cart/item_count/',
  
  // Orders
  ORDERS: '/orders/',
  ORDER_DETAIL: (id: number) => `/orders/${id}/`,
  ORDER_MY_ORDERS: '/orders/my_orders/',
  ORDER_CREATE_FROM_CART: '/orders/create_from_cart/',
  ORDER_UPDATE_STATUS: (id: number) => `/orders/${id}/update_status/`,
  ORDER_DETAILS: (id: number) => `/orders/${id}/order_details/`,
  ORDER_SHOP_ORDERS: '/orders/shop_orders/',
  ORDER_SHOP_STATS: '/orders/shop_order_stats/',
  ORDER_COMPLETE: (id: number) => `/orders/${id}/complete_order/`,
  
  // Payments
  PAYMENTS: '/payments/',
  PAYMENT_DETAIL: (id: number) => `/payments/${id}/`,
  PAYMENT_MY_PAYMENTS: '/payments/my_payments/',
  PAYMENT_UPDATE_STATUS: (id: number) => `/payments/${id}/update_status/`,
  
  // Wishlist
  WISHLIST: '/wishlists/',
  WISHLIST_MY: '/wishlists/my_wishlist/',
  WISHLIST_ADD_PRODUCT: (id: number) => `/wishlists/${id}/add_product/`,
  WISHLIST_REMOVE_PRODUCT: (id: number, productId: string) => `/wishlists/${id}/remove_product/${productId}/`,
  
  // Messages
  MESSAGES: '/messages/',
  MESSAGES_CONVERSATIONS: '/messages/conversations/',
  MESSAGES_WITH_USER: '/messages/with_user/',
  MESSAGES_UNREAD_COUNT: '/messages/unread_count/',
  MESSAGE_MARK_READ: (id: number) => `/messages/${id}/mark_as_read/`,
  MESSAGES_MARK_ALL_READ: '/messages/mark_all_as_read/',
  
  // Notifications
  NOTIFICATIONS: '/notifications/',
  NOTIFICATION_DETAIL: (id: number) => `/notifications/${id}/`,
  NOTIFICATION_UNREAD: '/notifications/unread/',
  NOTIFICATION_UNREAD_COUNT: '/notifications/unread_count/',
  NOTIFICATION_MARK_READ: (id: number) => `/notifications/${id}/mark_as_read/`,
  NOTIFICATION_MARK_ALL_READ: '/notifications/mark_all_as_read/',
  NOTIFICATION_BY_TYPE: '/notifications/by_type/',
  NOTIFICATION_CLEAR_OLD: '/notifications/clear_old/',
  NOTIFICATION_STATS: '/notifications/stats/',
  NOTIFICATION_ORDER: '/notifications/order_notifications/',
  NOTIFICATION_CART: '/notifications/cart_notifications/',
  NOTIFICATION_PRODUCT: '/notifications/product_notifications/',
  
  // Product Inquiries
  INQUIRIES: '/inquiries/',
  INQUIRY_DETAIL: (id: number) => `/inquiries/${id}/`,
  INQUIRY_RESPOND: (id: number) => `/inquiries/${id}/respond/`,
  INQUIRY_RESOLVE: (id: number) => `/inquiries/${id}/mark_resolved/`,
  INQUIRY_MY: '/inquiries/my_inquiries/',
  INQUIRY_RECEIVED: '/inquiries/received_inquiries/',
  INQUIRY_PENDING: '/inquiries/pending_inquiries/',
  
  // User Profile
  USER_PROFILE: '/userprofiles/',
  USER_PROFILE_ME: '/userprofiles/me/',
  USER_PROFILE_UPDATE_BIO: '/userprofiles/update_bio/',
  USER_PROFILE_UPDATE_ADDRESS: '/userprofiles/update_address/',
  USER_PROFILE_UPLOAD_AVATAR: '/userprofiles/upload_avatar/',
  USER_PROFILE_REMOVE_AVATAR: '/userprofiles/remove_avatar/',
  USER_PROFILE_COMPLETION_STATUS: '/userprofiles/completion_status/',
  USER_PROFILE_TOGGLE_SHOPOWNER: '/userprofiles/toggle_shopowner/',
  USER_PROFILE_SEARCH: '/userprofiles/search/',
  USER_PROFILE_STATS: '/userprofiles/stats/',
  USER_PROFILE_PUBLIC: (id: number) => `/userprofiles/${id}/public/`,
  
  // Product Variants API
  PRODUCT_VARIANTS: '/variants/',
  PRODUCT_VARIANTS_BY_PRODUCT: '/variants/by_product/',
  PRODUCT_VARIANTS_MY_PRODUCTS: '/variants/my_product_variants/',
  PRODUCT_VARIANTS_LOW_STOCK: '/variants/low_stock/',
  PRODUCT_VARIANTS_OUT_OF_STOCK: '/variants/out_of_stock/',
  PRODUCT_VARIANTS_STATS: '/variants/stats/',
  PRODUCT_VARIANTS_BULK_CREATE: '/variants/bulk_create/',
  PRODUCT_VARIANTS_BULK_DELETE: '/variants/bulk_delete/',
  PRODUCT_VARIANT_UPDATE_QUANTITY: (id: number) => `/variants/${id}/update_quantity/`,
  PRODUCT_VARIANT_UPDATE_PRICE: (id: number) => `/variants/${id}/update_price_adjustment/`,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CONFLICT: 'This resource already exists.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
};

export default config; 