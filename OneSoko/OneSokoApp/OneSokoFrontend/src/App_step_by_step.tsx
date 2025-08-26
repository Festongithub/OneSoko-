import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartStore } from './stores/cartStore';
import CartSidebar from './components/cart/CartSidebar';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OneSoko...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">OneSoko</h1>
              
              <div className="flex items-center space-x-6">
                <nav className="flex space-x-4">
                  <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
                  <a href="/explore" className="text-gray-600 hover:text-gray-900">Explore</a>
                  <a href="/products" className="text-gray-600 hover:text-gray-900">Products</a>
                </nav>
                
                {/* Cart Button */}
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to OneSoko! 🛍️
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Your one-stop marketplace for everything you need.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Shop Products</h3>
                      <p className="text-gray-600">Discover amazing products from local shops</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                      <p className="text-gray-600">Get your orders delivered quickly</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
                      <p className="text-gray-600">Safe and secure payment methods</p>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/explore" element={
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore</h2>
                  <p className="text-gray-600">Explore page content will go here...</p>
                </div>
              } />
              <Route path="/products" element={
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Sample Product 1 */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                      <h3 className="text-lg font-semibold mb-2">Sample Product 1</h3>
                      <p className="text-gray-600 mb-4">A great product for your needs</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">$29.99</span>
                        <button
                          onClick={() => {
                            // Add sample product to cart
                            const sampleProduct = {
                              productId: 'sample-1',
                              name: 'Sample Product 1',
                              description: 'A great product for your needs',
                              price: '29.99',
                              quantity: 10,
                              discount: '0',
                              is_active: true,
                              tags: [],
                              image: '',
                              shopId: 'sample-shop'
                            };
                            useCartStore.getState().addItem(sampleProduct);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Sample Product 2 */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                      <h3 className="text-lg font-semibold mb-2">Sample Product 2</h3>
                      <p className="text-gray-600 mb-4">Another amazing product</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">$49.99</span>
                        <button
                          onClick={() => {
                            const sampleProduct = {
                              productId: 'sample-2',
                              name: 'Sample Product 2',
                              description: 'Another amazing product',
                              price: '49.99',
                              quantity: 5,
                              discount: '0',
                              is_active: true,
                              tags: [],
                              image: '',
                              shopId: 'sample-shop'
                            };
                            useCartStore.getState().addItem(sampleProduct);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Sample Product 3 */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                      <h3 className="text-lg font-semibold mb-2">Sample Product 3</h3>
                      <p className="text-gray-600 mb-4">The perfect choice for you</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">$19.99</span>
                        <button
                          onClick={() => {
                            const sampleProduct = {
                              productId: 'sample-3',
                              name: 'Sample Product 3',
                              description: 'The perfect choice for you',
                              price: '19.99',
                              quantity: 20,
                              discount: '0',
                              is_active: true,
                              tags: [],
                              image: '',
                              shopId: 'sample-shop'
                            };
                            useCartStore.getState().addItem(sampleProduct);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              } />
              <Route path="*" element={
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h2>
                  <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
        
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-gray-500">© 2025 OneSoko. All rights reserved.</p>
          </div>
        </footer>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar />
    </Router>
  );
}

export default App;
