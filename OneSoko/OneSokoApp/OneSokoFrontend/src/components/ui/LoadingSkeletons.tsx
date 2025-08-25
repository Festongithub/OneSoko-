import React from 'react';

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 animate-pulse">
    <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
      <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
    </div>
  </div>
);

// Shop Card Skeleton
export const ShopCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-4/5"></div>
    </div>
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
  </div>
);
