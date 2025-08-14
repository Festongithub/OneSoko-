import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Store
import { useAuthStore } from './stores/authStore';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Customer Pages
import HomePage from './pages/customer/HomePage';
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

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-secondary-50 flex flex-col">
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
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/shops" element={<ShopsPage />} />
                      <Route path="/shops/:id" element={<ShopDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/register/shop-owner" element={<ShopOwnerRegister />} />
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
              path="/shop/*"
              element={
                <ProtectedRoute requireShopOwner={true}>
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
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
