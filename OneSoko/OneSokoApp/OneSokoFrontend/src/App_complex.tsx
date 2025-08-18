import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

// Store
import { useAuthStore } from './stores/authStore';

// Context
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ShopOwnerGuard from './components/ShopOwnerGuard';
import CustomerShopAccess from './components/CustomerShopAccess';
import ShopOwnerRedirect from './components/ShopOwnerRedirect';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartSidebar from './components/cart/CartSidebar';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ExplorePage from './pages/customer/ExplorePage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CategoriesPage from './pages/customer/CategoriesPage';
import ShopsPage from './pages/customer/ShopsPage';
import ShopDetailPage from './pages/customer/ShopDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import ProfilePage from './pages/customer/ProfilePage';
import OrdersPage from './pages/customer/OrdersPage';
import WishlistPage from './pages/customer/WishlistPage';

// Auth Components
import GitHubCallback from './components/auth/GitHubCallback';

// Shop Owner Pages
import ShopDashboard from './pages/shop-owner/ShopDashboard';
import ShopProducts from './pages/shop-owner/ShopProducts';
import ShopOrders from './pages/shop-owner/ShopOrders';
import ShopAnalytics from './pages/shop-owner/ShopAnalytics';
import ShopSettings from './pages/shop-owner/ShopSettings';
import ShopOwnerRegister from './pages/shop-owner/ShopOwnerRegister';
import AddProduct from './pages/shop-owner/AddProduct';
import EditProduct from './pages/shop-owner/EditProduct';

// Other Pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check authentication status on app startup
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
        // Continue rendering the app even if auth check fails
      } finally {
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, [checkAuth]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading OneSoko...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col transition-colors duration-200">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          
          <Routes>
            {/* Customer Routes */}
            <Route
              path="/*"
              element={
                <>
                  <Header variant="customer" />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/shops" element={<ShopsPage />} />
                      <Route path="/shops/:id" element={
                        <CustomerShopAccess>
                          <ShopDetailPage />
                        </CustomerShopAccess>
                      } />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/register/shop-owner" element={<ShopOwnerRegister />} />
                      <Route path="/auth/github/callback" element={<GitHubCallback />} />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/orders" element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/wishlist" element={
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />

            {/* Shop Owner Routes */}
            <Route
              path="/shop-owner"
              element={
                <ProtectedRoute requireShopOwner={true}>
                  <ShopOwnerRedirect />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/shop-owner/*"
              element={
                <ProtectedRoute requireShopOwner={true}>
                  <ShopOwnerGuard requiresShopAccess={false}>
                    <Header variant="shop-owner" />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/dashboard" element={<ShopDashboard />} />
                        <Route path="/products" element={<ShopProducts />} />
                        <Route path="/products/new" element={<AddProduct />} />
                        <Route path="/products/:id/edit" element={<EditProduct />} />
                        <Route path="/orders" element={<ShopOrders />} />
                        <Route path="/analytics" element={<ShopAnalytics />} />
                        <Route path="/settings" element={<ShopSettings />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                  </ShopOwnerGuard>
                </ProtectedRoute>
              }
            />

            {/* Shop-specific routes (for shop owners accessing their specific shop) */}
            <Route
              path="/shop-owner/shop/:shopId/*"
              element={
                <ProtectedRoute requireShopOwner={true}>
                  <ShopOwnerGuard requiresShopAccess={true}>
                    <Header variant="shop-owner" />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/dashboard" element={<ShopDashboard />} />
                        <Route path="/products" element={<ShopProducts />} />
                        <Route path="/products/new" element={<AddProduct />} />
                        <Route path="/products/:id/edit" element={<EditProduct />} />
                        <Route path="/orders" element={<ShopOrders />} />
                        <Route path="/analytics" element={<ShopAnalytics />} />
                        <Route path="/settings" element={<ShopSettings />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                  </ShopOwnerGuard>
                </ProtectedRoute>
              }
            />
          </Routes>
          
          {/* Global Cart Sidebar */}
          <CartSidebar />
        </div>
      </Router>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
