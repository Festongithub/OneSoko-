import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Shop } from '../types';
import { userAPI, shopsAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userShops: Shop[];
  activeShop: Shop | null;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  register: (userData: User) => void;
  setActiveShop: (shop: Shop | null) => void;
  showWelcomeMessage: boolean;
  welcomeMessage: string;
  hideWelcomeMessage: () => void;
  isLoading: boolean;
  isShopOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper to check if user is shop owner
  const isShopOwner = user?.profile?.is_shopowner || false;

  // Update active shop
  const handleSetActiveShop = (shop: Shop | null) => {
    setActiveShop(shop);
    if (shop) {
      localStorage.setItem('activeShop', JSON.stringify(shop));
    } else {
      localStorage.removeItem('activeShop');
    }
  };
  // Check for existing user session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        
        if (savedUser && accessToken) {
          const userData = JSON.parse(savedUser);
          
          // Verify token is still valid by trying to get current user
          try {
            const currentUser = await userAPI.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            
            // Fetch shops if user is shop owner
            if (currentUser.profile?.is_shopowner) {
              try {
                const shops = await shopsAPI.getMyShops();
                setUserShops(shops);
                
                // Set active shop from localStorage or first shop
                const savedActiveShop = localStorage.getItem('activeShop');
                if (savedActiveShop) {
                  const savedShop = JSON.parse(savedActiveShop);
                  const foundShop = shops.find(shop => shop.shopId === savedShop.shopId);
                  if (foundShop) {
                    setActiveShop(foundShop);
                  } else if (shops.length > 0) {
                    setActiveShop(shops[0]);
                    localStorage.setItem('activeShop', JSON.stringify(shops[0]));
                  }
                } else if (shops.length > 0) {
                  setActiveShop(shops[0]);
                  localStorage.setItem('activeShop', JSON.stringify(shops[0]));
                }
              } catch (error) {
                console.error('Error fetching user shops:', error);
              }
            }
          } catch (error) {
            // Token might be expired, try to refresh
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                // You might want to implement token refresh logic here
                console.log('Token refresh would happen here');
                setUser(userData);
                setIsAuthenticated(true);
                
                // Fetch shops if user is shop owner
                if (userData.profile?.is_shopowner) {
                  try {
                    const shops = await shopsAPI.getMyShops();
                    setUserShops(shops);
                    
                    // Set active shop from localStorage or first shop
                    const savedActiveShop = localStorage.getItem('activeShop');
                    if (savedActiveShop) {
                      const savedShop = JSON.parse(savedActiveShop);
                      const foundShop = shops.find(shop => shop.shopId === savedShop.shopId);
                      if (foundShop) {
                        setActiveShop(foundShop);
                      } else if (shops.length > 0) {
                        setActiveShop(shops[0]);
                        localStorage.setItem('activeShop', JSON.stringify(shops[0]));
                      }
                    } else if (shops.length > 0) {
                      setActiveShop(shops[0]);
                      localStorage.setItem('activeShop', JSON.stringify(shops[0]));
                    }
                  } catch (error) {
                    console.error('Error fetching user shops:', error);
                  }
                }
              } catch (refreshError) {
                // Refresh failed, clear auth state
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_profile');
                localStorage.removeItem('activeShop');
              }
            } else {
              // No refresh token, clear auth state
              localStorage.removeItem('user');
              localStorage.removeItem('access_token');
              localStorage.removeItem('user_profile');
              localStorage.removeItem('activeShop');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (userData: User) => {
    try {
      // Try to fetch complete user data including admin fields
      const completeUserData = await userAPI.getCurrentUser();
      setUser(completeUserData);
      localStorage.setItem('user', JSON.stringify(completeUserData));
      setIsAuthenticated(true);
      
      // If user is shop owner, fetch their shops and show personalized message
      if (completeUserData.profile?.is_shopowner) {
        try {
          const shops = await shopsAPI.getMyShops();
          setUserShops(shops);
          
          if (shops.length > 0) {
            // Set the first shop as active (or restore from localStorage)
            const savedActiveShop = localStorage.getItem('activeShop');
            let shopToActivate = shops[0];
            
            if (savedActiveShop) {
              const savedShop = JSON.parse(savedActiveShop);
              const foundShop = shops.find(shop => shop.shopId === savedShop.shopId);
              if (foundShop) {
                shopToActivate = foundShop;
              }
            }
            
            setActiveShop(shopToActivate);
            localStorage.setItem('activeShop', JSON.stringify(shopToActivate));
            
            // Shop owner welcome message
            const displayName = completeUserData.first_name || completeUserData.username;
            if (shops.length === 1) {
              setWelcomeMessage(`Hello ${displayName}, welcome to your ${shopToActivate.name} shop! 🏪`);
            } else {
              setWelcomeMessage(`Hello ${displayName}, welcome back! You're managing ${shops.length} shops. Currently active: ${shopToActivate.name} 🏪`);
            }
          } else {
            // Shop owner but no shops
            const displayName = completeUserData.first_name || completeUserData.username;
            setWelcomeMessage(`Hello ${displayName}, welcome to OneSoko! Ready to create your first shop? 🚀`);
          }
        } catch (error) {
          console.error('Error fetching shops:', error);
          const displayName = completeUserData.first_name || completeUserData.username;
          setWelcomeMessage(`Hello ${displayName}, welcome to OneSoko! 🏪`);
        }
      } else {
        // Regular user welcome message
        const displayName = completeUserData.first_name || completeUserData.username;
        setWelcomeMessage(`Dear ${displayName}, welcome to OneSoko! 🛍️`);
      }
    } catch (error) {
      // Fallback to provided user data if API call fails
      console.warn('Failed to fetch complete user data, using provided data:', error);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      
      // Simple welcome message for fallback
      const displayName = userData.first_name || userData.username;
      setWelcomeMessage(`Dear ${displayName}, welcome to OneSoko!`);
    }
    
    setShowWelcomeMessage(true);
    
    // Auto-hide welcome message after 5 seconds
    setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 5000);
  };

  const register = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Show welcome message for new registrations
    const displayName = userData.first_name || userData.username;
    setWelcomeMessage(`Dear ${displayName}, welcome to OneSoko! We're excited to have you join our community.`);
    setShowWelcomeMessage(true);
    
    // Auto-hide welcome message after 6 seconds for registrations
    setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 6000);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserShops([]);
    setActiveShop(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('activeShop');
    setShowWelcomeMessage(false);
  };

  const hideWelcomeMessage = () => {
    setShowWelcomeMessage(false);
  };

  const value = {
    user,
    isAuthenticated,
    userShops,
    activeShop,
    login,
    logout,
    register,
    setActiveShop: handleSetActiveShop,
    showWelcomeMessage,
    welcomeMessage,
    hideWelcomeMessage,
    isLoading,
    isShopOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 