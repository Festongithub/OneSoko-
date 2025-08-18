import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface GitHubOAuthButtonProps {
  userType?: 'customer' | 'shop_owner';
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
}

const GitHubOAuthButton: React.FC<GitHubOAuthButtonProps> = ({
  userType = 'customer',
  onSuccess,
  onError,
  className = '',
  children
}) => {
  const { loginWithOAuth, isLoading } = useAuthStore();

  const handleGitHubLogin = () => {
    try {
      const clientId = 'your-github-client-id'; // Replace with your GitHub Client ID
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = 'user:email';
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Store state and user type for verification
      sessionStorage.setItem('github_oauth_state', state);
      sessionStorage.setItem('github_oauth_user_type', userType);
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      // Open GitHub OAuth in a popup
      const popup = window.open(
        githubAuthUrl,
        'github-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for the popup to close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          
          // Check if we received the access token
          const accessToken = sessionStorage.getItem('github_access_token');
          const receivedState = sessionStorage.getItem('github_received_state');
          const storedState = sessionStorage.getItem('github_oauth_state');
          
          if (accessToken && receivedState === storedState) {
            handleGitHubResponse(accessToken);
            
            // Clean up session storage
            sessionStorage.removeItem('github_access_token');
            sessionStorage.removeItem('github_received_state');
            sessionStorage.removeItem('github_oauth_state');
            sessionStorage.removeItem('github_oauth_user_type');
          }
        }
      }, 1000);
    } catch (error: any) {
      console.error('GitHub OAuth setup error:', error);
      toast.error('Failed to setup GitHub OAuth');
      onError?.(error);
    }
  };

  const handleGitHubResponse = async (accessToken: string) => {
    try {
      const result = await loginWithOAuth('github', accessToken, userType);
      toast.success('Successfully logged in with GitHub!');
      onSuccess?.(result);
    } catch (error: any) {
      console.error('GitHub OAuth error:', error);
      toast.error(error.message || 'Failed to login with GitHub');
      onError?.(error);
    }
  };

  const defaultContent = (
    <div className="flex items-center justify-center space-x-2">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <span>Continue with GitHub</span>
    </div>
  );

  return (
    <button
      onClick={handleGitHubLogin}
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

export default GitHubOAuthButton;
