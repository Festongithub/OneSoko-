import api from './api';
import type { Shop, Product } from '../types';

export const shopApi = {
  getAll: async (): Promise<Shop[]> => {
    const response = await api.get('/shops/?page_size=100'); // Ensure we get all shops
    return response.data.results || response.data;
  },

  getById: async (id: string): Promise<Shop> => {
    const response = await api.get(`/shops/${id}/`);
    return response.data;
  },

  getLocations: async (): Promise<string[]> => {
    try {
      const response = await api.get('/shops/locations/');
      return response.data;
    } catch (error) {
      // Fallback: get all shops and extract locations client-side
      const shops = await api.get('/shops/?page_size=100');
      const shopsData = shops.data.results || shops.data;
      const locationSet = new Set<string>();
      
      shopsData.forEach((shop: any) => {
        if (shop.location) locationSet.add(shop.location);
        if (shop.city) locationSet.add(shop.city);
        if (shop.country) locationSet.add(shop.country);
      });
      
      return Array.from(locationSet).sort();
    }
  },

  search: async (params: {
    q?: string;
    location?: string;
    verified?: boolean;
    sort?: string;
  } = {}): Promise<Shop[]> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/shops/search/?${searchParams.toString()}`);
    return response.data.results || response.data;
  },

  create: async (shopData: Partial<Shop>): Promise<Shop> => {
    const response = await api.post('/shops/', shopData);
    return response.data;
  },

  update: async (id: string, shopData: Partial<Shop>): Promise<Shop> => {
    const response = await api.put(`/shops/${id}/`, shopData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/shops/${id}/`);
  },

  getProducts: async (shopId: string): Promise<Product[]> => {
    const response = await api.get(`/shops/${shopId}/products/`);
    return response.data;
  },

  addProduct: async (shopId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.post(`/shops/${shopId}/add_product/`, productData);
    return response.data;
  },

  removeProduct: async (shopId: string, productId: string): Promise<void> => {
    await api.delete(`/shops/${shopId}/products/${productId}/`);
  },

  getMyShop: async (): Promise<Shop> => {
    const response = await api.get('/shops/?owner=me');
    return response.data.results?.[0] || response.data[0]; // Assuming one shop per owner
  },
};
