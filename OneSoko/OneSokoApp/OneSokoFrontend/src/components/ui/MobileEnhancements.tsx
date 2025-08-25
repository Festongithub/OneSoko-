import React, { useState, useEffect } from 'react';
import { ChevronUpIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

// Scroll to Top Button
export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`fixed bottom-6 right-6 z-50 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-elevated hover:shadow-2xl transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="w-6 h-6" />
    </button>
  );
};

// Mobile Contact Options
interface ContactOption {
  type: 'phone' | 'email' | 'chat';
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const contactOptions: ContactOption[] = [
  {
    type: 'phone',
    label: 'Call Us',
    value: '+254 700 123 456',
    icon: PhoneIcon,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    type: 'email',
    label: 'Email Us',
    value: 'support@onesoko.com',
    icon: EnvelopeIcon,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    type: 'chat',
    label: 'Live Chat',
    value: 'Start Chat',
    icon: ChatBubbleLeftIcon,
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

export const MobileContactButtons: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleContactAction = (option: ContactOption) => {
    switch (option.type) {
      case 'phone':
        window.location.href = `tel:${option.value}`;
        break;
      case 'email':
        window.location.href = `mailto:${option.value}`;
        break;
      case 'chat':
        // Implement chat functionality
        console.log('Opening chat...');
        break;
    }
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 md:hidden">
      {/* Contact Options */}
      <div className={`mb-4 space-y-2 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {contactOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleContactAction(option)}
            className={`flex items-center space-x-2 px-4 py-2 ${option.color} text-white rounded-full shadow-elevated text-sm font-medium whitespace-nowrap animate-slide-up`}
          >
            <option.icon className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-elevated hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  let startY = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      
      if (distance > 0) {
        setIsPulling(true);
        setPullDistance(distance);
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center transition-all duration-200"
          style={{ 
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: pullProgress 
          }}
        >
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Refreshing...</span>
              </>
            ) : pullProgress >= 1 ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Release to refresh</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 5a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Pull to refresh</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

// Toast Notification System
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastContext = React.createContext<{
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
} | null>(null);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-500 border-success-600';
      case 'error':
        return 'bg-error-500 border-error-600';
      case 'warning':
        return 'bg-warning-500 border-warning-600';
      default:
        return 'bg-primary-500 border-primary-600';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`${getToastStyles()} text-white p-4 rounded-lg shadow-elevated animate-slide-down border-l-4`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-lg font-bold">{getIcon()}</span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-white/90 mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-white/80 hover:text-white"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default { ScrollToTop, MobileContactButtons, PullToRefresh, ToastProvider, useToast };
