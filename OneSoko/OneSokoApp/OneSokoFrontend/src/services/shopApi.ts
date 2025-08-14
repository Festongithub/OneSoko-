import api from './api';
import type { Shop, Product } from '../types';

export const shopApi = {
  getAll: async (): Promise<Shop[]> => {
    const response = await api.get('/shops/');
    return response.data;
  },

  getById: async (id: number): Promise<Shop> => {
    const response = await api.get(`/shops/${id}/`);
    return response.data;
  },

  create: async (shopData: Partial<Shop>): Promise<Shop> => {
    const response = await api.post('/shops/', shopData);
    return response.data;
  },

  update: async (id: number, shopData: Partial<Shop>): Promise<Shop> => {
    const response = await api.put(`/shops/${id}/`, shopData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/shops/${id}/`);
  },

  getProducts: async (shopId: number): Promise<Product[]> => {
    const response = await api.get(`/shops/${shopId}/products/`);
    return response.data;
  },

  addProduct: async (shopId: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.post(`/shops/${shopId}/add_product/`, productData);
    return response.data;
  },

  removeProduct: async (shopId: number, productId: number): Promise<void> => {
    await api.delete(`/shops/${shopId}/products/${productId}/`);
  },

  getMyShop: async (): Promise<Shop> => {
    const response = await api.get('/shops/?owner=me');
    return response.data[0]; // Assuming one shop per owner
  },
};
