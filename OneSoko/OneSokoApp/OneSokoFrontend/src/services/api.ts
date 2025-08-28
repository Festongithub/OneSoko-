import axios, { type AxiosResponse } from 'axios';
import type { AuthResponse } from '../types';

// Use environment-aware API URL - production will use relative paths through Nginx
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000/api'  // Development: direct Django API
  : '/api';                      // Production: through Nginx proxy

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData: {
  username?: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    address?: string;
  }): Promise<any> => {
    const response: AxiosResponse<any> = await api.post('/auth/register/', userData);
    return response.data;
  },

  registerShopOwner: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address?: string;
    shop_name: string;
    shop_description: string;
    shop_address: string;
    shop_phone: string;
    shop_email?: string;
    shop_social_link?: string;
    shop_street?: string;
    shop_city?: string;
    shop_country?: string;
  }): Promise<any> => {
    const response: AxiosResponse<any> = await api.post('/auth/register/shop-owner/', userData);
    return response.data;
  },

  oauthLogin: async (provider: string, accessToken: string, userType: string = 'customer'): Promise<any> => {
    const response: AxiosResponse<any> = await api.post('/auth/oauth/', {
      provider,
      access_token: accessToken,
      user_type: userType
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response: AxiosResponse<{ access: string }> = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  logout: async (_refreshToken: string): Promise<void> => {
    // For JWT, logout can be handled by just removing tokens from storage
    // If backend has blacklist functionality, use: await api.post('/auth/logout/', { refresh: refreshToken });
  },

  getProfile: async (): Promise<any> => {
    const response: AxiosResponse<any> = await api.get('/auth/profile/');
    return response.data;
  },
};

export default api;
