import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import AuthLoading from './components/AuthLoading';
import WelcomeMessage from './components/WelcomeMessage';
import SmartRedirect from './components/SmartRedirect';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopOwnerRegistration from './pages/ShopOwnerRegistration';
import ProfileSetup from './pages/ProfileSetup';
import ShopsList from './pages/ShopsList';
import ShopDetails from './pages/ShopDetails';
import CreateShop from './pages/CreateShop';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import Categories from './pages/Categories';
import EnterpriseCategories from './pages/EnterpriseCategories';
import Messages from './pages/Messages';
import UserProfile from './pages/UserProfile';

// New Scalability Components
import EnhancedCategoriesManagement from './components/EnhancedCategoriesManagement';
import AdvancedSearch from './components/AdvancedSearch';
import ProductVariants from './pages/ProductVariants';
import Reviews from './pages/Reviews';
import Wishlist from './pages/Wishlist';
import Payments from './pages/Payments';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import ShopOrderManagementPage from './pages/ShopOrderManagementPage';
import Products from './pages/Products';
import Notifications from './pages/Notifications';

// API Test Components
import OrderApiTest from './components/OrderApiTest';
import CategoriesApiTest from './components/CategoriesApiTest';
import MessagesApiTest from './components/MessagesApiTest';
import UserProfileApiTest from './components/UserProfileApiTest';
import ProductVariantsApiTest from './components/ProductVariantsApiTest';
import ReviewsApiTest from './components/ReviewsApiTest';
import WishlistApiTest from './components/WishlistApiTest';
import PaymentsApiTest from './components/PaymentsApiTest';
import ShopSystemTest from './pages/ShopSystemTest';

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Router>
        {/* Welcome Message */}
        <WelcomeMessage />
        
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-72">
            {/* Top Navbar */}
            <Navbar onSidebarToggle={() => setSidebarOpen(true)} />
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-3">
              <Routes>
                {/* Landing and Auth Pages */}
                <Route path="/" element={<SmartRedirect><LandingPage /></SmartRedirect>} />
                <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
                <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />
                <Route path="/register-shop-owner" element={<AuthGuard><ShopOwnerRegistration /></AuthGuard>} />
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                
                {/* Main Pages */}
                <Route path="/shops" element={<ShopsList />} />
                <Route path="/shop/:shopId" element={<ShopDetails />} />
                <Route path="/create-shop" element={<ProtectedRoute><CreateShop /></ProtectedRoute>} />
                <Route path="/shop-dashboard" element={<ProtectedRoute><ShopOwnerDashboard /></ProtectedRoute>} />
                
                {/* Sidebar Navigation Pages */}
                <Route path="/categories" element={<Categories />} />
                <Route path="/enterprise-categories" element={<EnterpriseCategories />} />
                <Route path="/enhanced-categories" element={<ProtectedRoute><EnhancedCategoriesManagement /></ProtectedRoute>} />
                <Route path="/advanced-search" element={<AdvancedSearch />} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/product-variants" element={<ProtectedRoute><ProductVariants /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                
                {/* Shopping Pages */}
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                
                {/* Shop Management Pages */}
                <Route path="/shop/orders" element={<ProtectedRoute><ShopOrderManagementPage /></ProtectedRoute>} />
                <Route path="/shop/products" element={<ProtectedRoute><ProductVariants /></ProtectedRoute>} />
                <Route path="/shop/analytics" element={<ProtectedRoute><ShopOwnerDashboard /></ProtectedRoute>} />
                <Route path="/shop/settings" element={<ProtectedRoute><ShopOwnerDashboard /></ProtectedRoute>} />
                <Route path="/shop/earnings" element={<ProtectedRoute><ShopOwnerDashboard /></ProtectedRoute>} />
                <Route path="/my-shops" element={<ProtectedRoute><ShopsList /></ProtectedRoute>} />
                
                {/* User Account Pages */}
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                
                {/* API Test Pages */}
                <Route path="/shop-system-test" element={<ShopSystemTest />} />
                <Route path="/order-api-test" element={<ProtectedRoute><OrderApiTest /></ProtectedRoute>} />
                <Route path="/categories-api-test" element={<ProtectedRoute><CategoriesApiTest /></ProtectedRoute>} />
                <Route path="/messages-api-test" element={<ProtectedRoute><MessagesApiTest /></ProtectedRoute>} />
                <Route path="/user-profile-api-test" element={<ProtectedRoute><UserProfileApiTest /></ProtectedRoute>} />
                <Route path="/product-variants-api-test" element={<ProtectedRoute><ProductVariantsApiTest /></ProtectedRoute>} />
                <Route path="/reviews-api-test" element={<ProtectedRoute><ReviewsApiTest /></ProtectedRoute>} />
                <Route path="/wishlist-api-test" element={<ProtectedRoute><WishlistApiTest /></ProtectedRoute>} />
                <Route path="/payments-api-test" element={<ProtectedRoute><PaymentsApiTest /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 