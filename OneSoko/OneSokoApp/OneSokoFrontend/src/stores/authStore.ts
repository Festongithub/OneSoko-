import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile, Shop } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  shop: Shop | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'customer' | 'shop_owner' | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: string, accessToken: string, userType?: 'customer' | 'shop_owner') => Promise<{ is_new_user?: boolean; needs_shop_setup?: boolean }>;
  register: (userData: RegisterUserData) => Promise<void>;
  registerShopOwner: (userData: RegisterShopOwnerData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User, profile?: UserProfile, shop?: Shop) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUserType: (userType: 'customer' | 'shop_owner') => void;
}

interface RegisterUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
}

interface RegisterShopOwnerData extends RegisterUserData {
  phone_number: string; // Override to make required for shop owners
  shop_name: string;
  shop_description: string;
  shop_address: string;
  shop_phone: string;
  shop_email?: string;
  shop_social_link?: string;
  shop_street?: string;
  shop_city?: string;
  shop_country?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      userProfile: null,
      shop: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      userType: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login({ email, password });
          
          const { access, refresh, user, profile, shop } = response;
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          
          const userType = profile?.is_shopowner ? 'shop_owner' : 'customer';
          
          set({
            user,
            userProfile: profile,
            shop: shop || null,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            userType,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithOAuth: async (provider: string, accessToken: string, userType: 'customer' | 'shop_owner' = 'customer') => {
        try {
          set({ isLoading: true });
          const response = await authApi.oauthLogin(provider, accessToken, userType);
          
          const { access, refresh, user, profile, shop, is_new_user, needs_shop_setup } = response;
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          
          const finalUserType = profile?.is_shopowner ? 'shop_owner' : 'customer';
          
          set({
            user,
            userProfile: profile,
            shop: shop || null,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            userType: finalUserType,
          });

          // Return additional info for handling new users or shop setup
          return { is_new_user, needs_shop_setup };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterUserData) => {
        try {
          set({ isLoading: true });
          const response = await authApi.register(userData);
          
          const { access, refresh, user, profile } = response;
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          
          set({
            user,
            userProfile: profile,
            shop: null,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            userType: 'customer',
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      registerShopOwner: async (userData: RegisterShopOwnerData) => {
        try {
          set({ isLoading: true });
          const response = await authApi.registerShopOwner(userData);
          
          const { access, refresh, user, profile, shop } = response;
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          
          set({
            user,
            userProfile: profile,
            shop,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            userType: 'shop_owner',
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call backend logout if we have a token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          // Even if backend logout fails, we still clear local storage
          console.error('Logout error:', error);
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          userProfile: null,
          shop: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          userType: null,
        });
      },

      checkAuth: async () => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!accessToken || !refreshToken) {
            set({ isAuthenticated: false, userType: null });
            return;
          }
          
          // Try to get user profile to verify token is still valid
          const response = await authApi.getProfile();
          const { user, profile, shop } = response;
          
          const userType = profile?.is_shopowner ? 'shop_owner' : 'customer';
          
          set({
            user,
            userProfile: profile,
            shop: shop || null,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            userType,
          });
        } catch (error) {
          console.warn('Auth check failed, clearing tokens:', error);
          // Token is invalid, clear everything
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            userProfile: null,
            shop: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            userType: null,
          });
        }
      },

      setUser: (user: User, profile?: UserProfile, shop?: Shop) => {
        const userType = profile?.is_shopowner ? 'shop_owner' : 'customer';
        set({ 
          user, 
          userProfile: profile, 
          shop: shop || null,
          userType 
        });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      updateUserType: (userType: 'customer' | 'shop_owner') => {
        set({ userType });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        shop: state.shop,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
      }),
    }
  )
);
