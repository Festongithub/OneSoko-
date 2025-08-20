import React from 'react';

// Skeleton Loading Component
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded ${className}`}></div>
);

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="card overflow-hidden">
    <SkeletonLoader className="w-full h-48" />
    <div className="card-body space-y-3">
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-3 w-1/2" />
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-5 w-20" />
        <SkeletonLoader className="h-8 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

// Button Loading State
export const ButtonLoading: React.FC<{ children: React.ReactNode; isLoading: boolean; className?: string }> = ({ 
  children, 
  isLoading, 
  className = "" 
}) => (
  <button 
    className={`relative ${className} ${isLoading ? 'cursor-not-allowed opacity-75' : ''}`}
    disabled={isLoading}
  >
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
    <span className={isLoading ? 'invisible' : 'visible'}>{children}</span>
  </button>
);

// Success/Error Toast Animation
export const ToastNotification: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ type, message, isVisible, onClose }) => {
  const bgColor = {
    success: 'bg-success-500',
    error: 'bg-error-500',
    info: 'bg-primary-500'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-elevated flex items-center space-x-3 min-w-[300px]`}>
        <span className="text-lg font-bold">{icon}</span>
        <span className="flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Page Loading Overlay
export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading...</p>
    </div>
  </div>
);

export default { SkeletonLoader, ProductCardSkeleton, ButtonLoading, ToastNotification, PageLoader };
