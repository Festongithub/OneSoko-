import React, { useState, useEffect } from 'react';
import { useAuthSimple } from '../../hooks/useAuth';
import { wishlistApi } from '../../services/wishlistApi';

// Simple Heart Icons (since react-bootstrap-icons might not be available)
const HeartOutline = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const HeartFilled = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = '',
  showText = false,
  size = 'md'
}) => {
  const { isAuthenticated } = useAuthSimple();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  useEffect(() => {
    if (isAuthenticated && productId) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistApi.checkProduct(productId);
      setIsInWishlist(response.in_wishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login or show login modal
      alert('Please login to add items to wishlist');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await wishlistApi.toggleProduct(productId);
      setIsInWishlist(response.in_wishlist);
      
      // Show success message
      const action = response.action === 'added' ? 'added to' : 'removed from';
      console.log(`Product ${action} wishlist`);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading || !isAuthenticated}
      className={`
        inline-flex items-center justify-center gap-2 
        transition-all duration-200 hover:scale-105
        ${isInWishlist 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isInWishlist ? (
        <HeartFilled className={sizeClasses[size]} />
      ) : (
        <HeartOutline className={sizeClasses[size]} />
      )}
      
      {showText && (
        <span className="text-sm font-medium">
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};
