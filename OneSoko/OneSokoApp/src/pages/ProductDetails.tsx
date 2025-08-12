import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  HeartIcon, 
  ShoppingCartIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Product, Review, Shop } from '../types';
import { productsAPI, reviewsAPI, wishlistAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import AddToCartButton from '../components/cart/AddToCartButton';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          productsAPI.getById(productId),
          reviewsAPI.getByProduct(productId)
        ]);

        setProduct(productData);
        setShop(productData.shops[0] || null);
        setReviews(reviewsData);

        // Check if product is in wishlist
        try {
          const isInWishlist = await wishlistAPI.isInWishlist(productId);
          setIsWishlisted(isInWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }

        // Fetch related products
        if (productData.category) {
          try {
            const related = await productsAPI.getByCategory(productData.category.slug);
            setRelatedProducts(related.filter(p => p.productId !== productId).slice(0, 4));
          } catch (error) {
            console.error('Error fetching related products:', error);
          }
        }
      } catch (error) {
        setError('Product not found');
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCartSuccess = () => {
    // Optional: Show success message or update cart count
    console.log('Product added to cart successfully!');
  };

  const handleAddToCartError = (error: string) => {
    setError(error);
  };

  const handleToggleWishlist = async () => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      if (isWishlisted) {
        await wishlistAPI.removeProduct(product.productId);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.addProduct(product.productId);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    const basePrice = product.promotional_price || product.price;
    return basePrice * (1 - product.discount / 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !product || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center hover:text-primary-600"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/shops')}
            className="hover:text-primary-600"
          >
            Shops
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/shops/${shop.slug}`)}
            className="hover:text-primary-600"
          >
            {shop.name}
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Shop Info */}
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary-600">{shop.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {shop.city}, {shop.country}
                </div>
              </div>
              <button
                onClick={() => navigate(`/shops/${shop.slug}`)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Shop
              </button>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= calculateAverageRating() ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(calculateDiscountedPrice())}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.promotional_price || product.price)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.quantity > 0 ? (
                <p className="text-green-600 text-sm">In Stock ({product.quantity} available)</p>
              ) : (
                <p className="text-red-600 text-sm">Out of Stock</p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-semibold text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {product && shop && (
                <AddToCartButton
                  product={product}
                  shop={shop}
                  quantity={quantity}
                  className="w-full py-3"
                  onSuccess={handleAddToCartSuccess}
                  onError={handleAddToCartError}
                />
              )}
            </div>

            {/* Contact Shop */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Shop</h3>
              <div className="space-y-2">
                {shop.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {shop.phone}
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    {shop.email}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/messages?shop=${shop.shopId}`)}
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                  Send Message to Shop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {review.user.first_name?.charAt(0) || review.user.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.user.first_name || review.user.username} {review.user.last_name || ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.productId}
                  product={relatedProduct}
                  shop={shop}
                  showShopInfo={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails; 