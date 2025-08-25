import api from './api';

export interface WishlistResponse {
  wishlist: {
    id: number;
    user: string;
    products: any[];
    created_at: string;
    updated_at: string;
  };
  total_items: number;
  created: boolean;
}

export interface WishlistStats {
  total_items: number;
  total_value: number;
  available_items: number;
  unavailable_items: number;
  categories: string[];
  categories_count: number;
}

export interface ProductToggleResponse {
  message: string;
  action: 'added' | 'removed';
  in_wishlist: boolean;
  total_items: number;
}

export interface CheckProductResponse {
  in_wishlist: boolean;
  product_id: string;
}

export const wishlistApi = {
  // Get user's wishlist
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get('/wishlists/');
    return response.data;
  },

  // Get wishlist statistics
  getStats: async (): Promise<WishlistStats> => {
    const response = await api.get('/wishlists/stats/');
    return response.data;
  },

  // Add product to wishlist
  addProduct: async (productId: string): Promise<ProductToggleResponse> => {
    const response = await api.post('/wishlists/add_product/', {
      product_id: productId
    });
    return response.data;
  },

  // Remove product from wishlist
  removeProduct: async (productId: string): Promise<ProductToggleResponse> => {
    const response = await api.delete('/wishlists/remove_product/', {
      data: { product_id: productId }
    });
    return response.data;
  },

  // Toggle product in wishlist
  toggleProduct: async (productId: string): Promise<ProductToggleResponse> => {
    const response = await api.post('/wishlists/toggle_product/', {
      product_id: productId
    });
    return response.data;
  },

  // Check if product is in wishlist
  checkProduct: async (productId: string): Promise<CheckProductResponse> => {
    const response = await api.get(`/wishlists/check_product/?product_id=${productId}`);
    return response.data;
  },

  // Clear entire wishlist
  clearWishlist: async (): Promise<{ message: string; total_items: number }> => {
    const response = await api.delete('/wishlists/clear_wishlist/');
    return response.data;
  },

  // Get products grouped by category
  getProductsByCategory: async (): Promise<{ categories: Record<string, any[]> }> => {
    const response = await api.get('/wishlists/products_by_category/');
    return response.data;
  }
};

export default wishlistApi;
