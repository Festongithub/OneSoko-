import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface GoogleOAuthButtonProps {
  userType?: 'customer' | 'shop_owner';
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  userType = 'customer',
  onSuccess,
  onError,
  className = '',
  children
}) => {
  const { loginWithOAuth, isLoading } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google OAuth if not already done
      if (!window.google) {
        await loadGoogleScript();
      }

      window.google.accounts.oauth2.initTokenClient({
        client_id: 'your-google-client-id', // Replace with your Google Client ID
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              const result = await loginWithOAuth('google', response.access_token, userType);
              toast.success('Successfully logged in with Google!');
              onSuccess?.(result);
            } catch (error: any) {
              console.error('Google OAuth error:', error);
              toast.error(error.message || 'Failed to login with Google');
              onError?.(error);
            }
          } else {
            console.error('No access token received from Google');
            toast.error('Failed to get access token from Google');
          }
        },
        error_callback: (error: any) => {
          console.error('Google OAuth initialization error:', error);
          toast.error('Failed to initialize Google OAuth');
          onError?.(error);
        }
      }).requestAccessToken();
    } catch (error: any) {
      console.error('Google OAuth setup error:', error);
      toast.error('Failed to setup Google OAuth');
      onError?.(error);
    }
  };

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
      document.head.appendChild(script);
    });
  };

  const defaultContent = (
    <div className="flex items-center justify-center space-x-2">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continue with Google</span>
    </div>
  );

  return (
    <button
      onClick={handleGoogleLogin}
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

export default GoogleOAuthButton;
