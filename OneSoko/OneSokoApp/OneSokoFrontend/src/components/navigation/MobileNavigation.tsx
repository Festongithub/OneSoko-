import React, { useState, useEffect, useRef } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface MobileNavigationProps {
  user?: {
    name: string;
    avatar?: string;
    email: string;
  };
  onLogout?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  user,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { label: 'Home', href: '/', icon: <HomeIcon className="h-6 w-6" /> },
    { label: 'Search', href: '/search', icon: <MagnifyingGlassIcon className="h-6 w-6" /> },
    { label: 'Wishlist', href: '/wishlist', icon: <HeartIcon className="h-6 w-6" />, badge: 3 },
    { label: 'Cart', href: '/cart', icon: <ShoppingBagIcon className="h-6 w-6" />, badge: 5 },
    { label: 'Profile', href: '/profile', icon: <UserCircleIcon className="h-6 w-6" /> },
    { label: 'Settings', href: '/settings', icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  // Touch/Mouse handlers for swipe gestures
  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    setCurrentX(clientX);
    const deltaX = clientX - startX;
    
    if (sidebarRef.current) {
      if (!isOpen && deltaX > 0) {
        // Opening gesture
        sidebarRef.current.style.transform = `translateX(${-280 + deltaX}px)`;
      } else if (isOpen && deltaX < 0) {
        // Closing gesture
        sidebarRef.current.style.transform = `translateX(${deltaX}px)`;
      }
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 140; // Half of sidebar width
    
    if (!isOpen && deltaX > threshold) {
      setIsOpen(true);
    } else if (isOpen && deltaX < -threshold) {
      setIsOpen(false);
    }
    
    // Reset transform
    if (sidebarRef.current) {
      sidebarRef.current.style.transform = '';
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Bars3Icon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
          </button>
          
          <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
            OneSoko
          </Link>
          
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
            </Link>
            <Link
              to="/cart"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
            >
              <ShoppingBagIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                5
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            OneSoko
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-6 py-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {user && (
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}

        {/* Swipe Indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-neutral-300 dark:bg-neutral-600 rounded-full w-1 h-12 opacity-30" />
      </div>

      {/* Bottom Navigation (Alternative for very small screens) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 p-2 relative ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <div className="relative">
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: 'h-5 w-5'
                  } as any)}
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
