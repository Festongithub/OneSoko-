import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface FacebookOAuthButtonProps {
  userType?: 'customer' | 'shop_owner';
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const FacebookOAuthButton: React.FC<FacebookOAuthButtonProps> = ({
  userType = 'customer',
  onSuccess,
  onError,
  className = '',
  children
}) => {
  const { loginWithOAuth, isLoading } = useAuthStore();

  const handleFacebookLogin = async () => {
    try {
      // Initialize Facebook SDK if not already done
      if (!window.FB) {
        await loadFacebookScript();
      }

      window.FB.login((response: any) => {
        if (response.authResponse) {
          handleFacebookResponse(response.authResponse);
        } else {
          console.error('Facebook login failed:', response);
          toast.error('Facebook login was cancelled or failed');
          onError?.(new Error('Facebook login failed'));
        }
      }, { scope: 'email,public_profile' });
    } catch (error: any) {
      console.error('Facebook OAuth setup error:', error);
      toast.error('Failed to setup Facebook OAuth');
      onError?.(error);
    }
  };

  const handleFacebookResponse = async (authResponse: any) => {
    try {
      const result = await loginWithOAuth('facebook', authResponse.accessToken, userType);
      toast.success('Successfully logged in with Facebook!');
      onSuccess?.(result);
    } catch (error: any) {
      console.error('Facebook OAuth error:', error);
      toast.error(error.message || 'Failed to login with Facebook');
      onError?.(error);
    }
  };

  const loadFacebookScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: 'your-facebook-app-id', // Replace with your Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.head.appendChild(script);
    });
  };

  const defaultContent = (
    <div className="flex items-center justify-center space-x-2">
      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      <span>Continue with Facebook</span>
    </div>
  );

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 
        rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 
        hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children || defaultContent}
    </button>
  );
};

export default FacebookOAuthButton;
