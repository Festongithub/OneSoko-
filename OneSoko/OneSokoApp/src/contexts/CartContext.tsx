import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, shopId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(errorMessage);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, shopId: string, quantity: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCart = await cartAPI.addToCart(productId, shopId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      throw err; // Re-throw to allow component-level error handling
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCart = await cartAPI.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCart = await cartAPI.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCart = await cartAPI.clearCart();
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Calculate derived values
  const itemCount = cart?.total_items || 0;
  const totalPrice = cart?.total_price || 0;

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Auto-refresh cart every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchCart, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchCart]);

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
