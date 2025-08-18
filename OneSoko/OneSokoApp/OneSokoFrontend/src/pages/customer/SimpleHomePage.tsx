import { Link, useNavigate } from 'react-router-dom';

const SimpleHomePage = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to{' '}
            <span className="text-primary-600">OneSoko</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover amazing products from trusted shops. Your one-stop marketplace for everything you need.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={handleStartShopping}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Start Shopping
              </button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                to="/shops"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Browse Shops
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose OneSoko?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🛍️ Wide Selection
              </h3>
              <p className="text-gray-600">
                Thousands of products from trusted sellers across multiple categories.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🚚 Fast Delivery
              </h3>
              <p className="text-gray-600">
                Quick and reliable shipping to get your orders to you on time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🔒 Secure Shopping
              </h3>
              <p className="text-gray-600">
                Safe and secure transactions with buyer protection guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHomePage;
