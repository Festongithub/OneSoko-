import api from './api';
import type { Product, Category, Tag, Review } from '../types';

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products/');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  create: async (productData: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products/', productData);
    return response.data;
  },

  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}/`, productData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}/`);
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/products/?category=${categoryId}`);
    return response.data;
  },
};

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  },

  create: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },

  update: async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}/`, categoryData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}/`);
  },
};

export const tagApi = {
  getAll: async (): Promise<Tag[]> => {
    const response = await api.get('/tags/');
    return response.data;
  },

  create: async (tagData: Partial<Tag>): Promise<Tag> => {
    const response = await api.post('/tags/', tagData);
    return response.data;
  },
};

export const reviewApi = {
  getByProduct: async (productId: number): Promise<Review[]> => {
    const response = await api.get(`/reviews/?product=${productId}`);
    return response.data;
  },

  create: async (reviewData: Partial<Review>): Promise<Review> => {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  },

  update: async (id: number, reviewData: Partial<Review>): Promise<Review> => {
    const response = await api.put(`/reviews/${id}/`, reviewData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}/`);
  },
};
