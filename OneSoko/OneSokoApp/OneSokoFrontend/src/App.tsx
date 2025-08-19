import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

// Store
import { useAuthStore } from './stores/authStore';

// Context
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartSidebar from './components/cart/CartSidebar';

// Pages
import HomePage from './pages/customer/HomePage';
import ExplorePage from './pages/customer/ExplorePage';
import ShopDetailPage from './pages/customer/ShopDetailPage';
import CartPage from './pages/customer/CartPage';
import TestComponent from './components/TestComponent';
import LoginPage from './pages/customer/LoginPage';
import CustomerRegister from './pages/customer/CustomerRegister';
import SignupSelection from './pages/customer/SignupSelection';
import ShopOwnerRegister from './pages/shop-owner/ShopOwnerRegister';
import ReviewsTestPage from './pages/ReviewsTestPage';

// Shop Owner Pages
import ShopDashboard from './pages/shop-owner/ShopDashboard';
import ShopProducts from './pages/shop-owner/ShopProducts';
import AddProduct from './pages/shop-owner/AddProduct';
import EditProduct from './pages/shop-owner/EditProduct';
import ShopSettings from './pages/shop-owner/ShopSettings';
import ShopAnalytics from './pages/shop-owner/ShopAnalytics';
import AdvancedAnalyticsDashboard from './pages/shop-owner/AdvancedAnalyticsDashboard';

// Enhanced Order Management Pages
import OrderManagementPage from './pages/shop/OrderManagementPage';
import OrderDetailPage from './pages/shop/OrderDetailPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderLookupPage from './pages/customer/OrderLookupPage';

// Customer Loyalty & Rewards Pages
import CustomerLoyaltyDashboard from './pages/customer/CustomerLoyaltyDashboard';
import ShopOwnerLoyaltyDashboard from './pages/shop-owner/ShopOwnerLoyaltyDashboard';

// Notifications Pages
import NotificationsPage from './pages/customer/NotificationsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

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
            <Header />
            
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
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/search" element={<ExplorePage />} />
                <Route path="/shops" element={<ExplorePage />} />
                <Route path="/shops/:id" element={<ShopDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<SignupSelection />} />
                <Route path="/register/customer" element={<CustomerRegister />} />
                <Route path="/register/shop-owner" element={<ShopOwnerRegister />} />
                
                {/* Protected Shop Owner Routes */}
                <Route 
                  path="/shop/dashboard" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <ShopDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/products" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <ShopProducts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/products/add" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <AddProduct />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/products/edit/:id" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <EditProduct />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/orders" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <OrderManagementPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/orders/:id" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customer/orders/:id/track" 
                  element={<OrderTrackingPage />} 
                />
                <Route 
                  path="/track-order" 
                  element={<OrderLookupPage />} 
                />
                <Route 
                  path="/shop/settings" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <ShopSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/analytics" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <ShopAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/advanced-analytics" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <AdvancedAnalyticsDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/loyalty" 
                  element={
                    <ProtectedRoute requireShopOwner={true}>
                      <ShopOwnerLoyaltyDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Customer Loyalty Routes */}
                <Route 
                  path="/loyalty" 
                  element={
                    <ProtectedRoute>
                      <CustomerLoyaltyDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Notifications Routes */}
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/test" element={<TestComponent />} />
                <Route path="/reviews-demo" element={<ReviewsTestPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
          
          {/* Cart Sidebar */}
          <CartSidebar />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
