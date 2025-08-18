import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowLeftIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../stores/cartStore';
import AddToCartButton from '../../components/cart/AddToCartButton';
import type { Product } from '../../types';
import toast from 'react-hot-toast';

// Featured products for shopping when cart is empty
const featuredProducts: Product[] = [
  {
    productId: 'shop-1',
    name: 'Premium Wireless Earbuds',
    price: '129.99',
    promotional_price: '99.99',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop',
    description: 'Crystal clear sound with active noise cancellation',
    quantity: 50,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '23.00',
    deleted_at: undefined
  },
  {
    productId: 'shop-2',
    name: 'Smart Home Speaker',
    price: '79.99',
    promotional_price: '79.99',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    description: 'Voice-controlled smart speaker with high-quality audio',
    quantity: 30,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '0.00',
    deleted_at: undefined
  },
  {
    productId: 'shop-3',
    name: 'Portable Phone Charger',
    price: '39.99',
    promotional_price: '29.99',
    image: 'https://images.unsplash.com/photo-1609592142191-82beb78b3e89?w=400&h=400&fit=crop',
    description: 'Fast-charging portable battery pack for all devices',
    quantity: 75,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '25.00',
    deleted_at: undefined
  },
  {
    productId: 'shop-4',
    name: 'Ergonomic Office Chair',
    price: '299.99',
    promotional_price: '249.99',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    description: 'Comfortable ergonomic chair with lumbar support',
    quantity: 15,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '17.00',
    deleted_at: undefined
  },
  {
    productId: 'shop-5',
    name: 'LED Desk Lamp',
    price: '59.99',
    promotional_price: '44.99',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop',
    description: 'Adjustable LED desk lamp with touch controls',
    quantity: 40,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '25.00',
    deleted_at: undefined
  },
  {
    productId: 'shop-6',
    name: 'Wireless Keyboard & Mouse',
    price: '89.99',
    promotional_price: '69.99',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    description: 'Compact wireless keyboard and mouse combo',
    quantity: 25,
    is_active: true,
    category: undefined,
    tags: [],
    variants: [],
    reviews: [],
    discount: '22.00',
    deleted_at: undefined
  }
];

const CartPage: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();
  
  const [isClearing, setIsClearing] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
    toast.success('Cart updated');
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    removeItem(itemId);
    toast.success(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    setIsClearing(true);
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
      toast.success('Cart cleared');
    }, 300);
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Empty Cart Header */}
          <div className="text-center py-8 mb-12">
            <ShoppingCartIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
              Start Building Your Cart
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300 mb-6 max-w-md mx-auto">
              Add products to your cart and manage your shopping list. You can add, update quantities, and remove items as needed.
            </p>
          </div>

          {/* Featured Products for Shopping */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Start Shopping - Featured Products
              </h2>
              <Link
                to="/explore"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                View All Products →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.productId} className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-secondary-900 dark:text-white">
                        ${product.promotional_price}
                      </span>
                      {product.promotional_price !== product.price && (
                        <span className="text-sm text-secondary-500 line-through">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <AddToCartButton 
                    product={product} 
                    size="sm" 
                    showQuantitySelector={false}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            
            {/* Additional Actions */}
            <div className="mt-8 text-center">
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-base font-medium rounded-md text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Your Shopping Cart
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart • 
              Manage quantities, remove items, or continue shopping
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-sm font-medium rounded-md text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors duration-200"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </button>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-medium text-secondary-900 dark:text-white">
                  Cart Items
                </h2>
              </div>
              
              <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {items.map((item) => {
                  const price = item.product.promotional_price 
                    ? parseFloat(item.product.promotional_price)
                    : parseFloat(item.product.price);
                  const variantAdjustment = item.variant?.price_adjustment 
                    ? parseFloat(item.variant.price_adjustment) 
                    : 0;
                  const finalPrice = price + variantAdjustment;
                  const itemTotal = finalPrice * item.quantity;

                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.image || '/api/placeholder/80/80'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-medium text-secondary-900 dark:text-white">
                                <Link 
                                  to={`/products/${item.product.productId}`}
                                  className="hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              {item.product.description && (
                                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 line-clamp-2">
                                  {item.product.description}
                                </p>
                              )}
                              {item.variant && (
                                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                                  Variant: {item.variant.name}
                                </p>
                              )}
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.id, item.product.name)}
                              className="ml-4 p-2 text-secondary-400 hover:text-red-500 transition-colors duration-200"
                              title="Remove item"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Price and Quantity Controls */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-secondary-300 dark:border-secondary-600 rounded-md">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <MinusIcon className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-secondary-900 dark:text-white min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white"
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Wishlist Button */}
                              <button className="p-2 text-secondary-400 hover:text-red-500 transition-colors duration-200">
                                <HeartIcon className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-medium text-secondary-900 dark:text-white">
                                ${itemTotal.toFixed(2)}
                              </p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                ${finalPrice.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 sticky top-8">
              <h2 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Subtotal ({getTotalItems()} items)
                  </span>
                  <span className="text-secondary-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Shipping
                  </span>
                  <span className="text-secondary-900 dark:text-white">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Tax (8%)
                  </span>
                  <span className="text-secondary-900 dark:text-white">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    Free shipping on orders over $50
                  </p>
                )}
                
                <div className="border-t border-secondary-200 dark:border-secondary-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-secondary-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-secondary-900 dark:text-white">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                Proceed to Checkout
              </button>
              
              <Link
                to="/explore"
                className="w-full mt-3 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm py-3 px-4 text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Add More Products Section */}
        <div className="mt-12 bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
              Add More Products
            </h3>
            <Link
              to="/explore"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              View All Products →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <div key={product.productId} className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h4 className="font-medium text-secondary-900 dark:text-white mb-1 text-sm line-clamp-2">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-secondary-900 dark:text-white">
                    ${product.promotional_price}
                  </span>
                  {product.promotional_price !== product.price && (
                    <span className="text-xs text-secondary-500 line-through">
                      ${product.price}
                    </span>
                  )}
                </div>
                <AddToCartButton 
                  product={product} 
                  size="sm" 
                  showQuantitySelector={false}
                  className="w-full text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
