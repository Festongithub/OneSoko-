import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GitHubCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('GitHub OAuth error:', error);
          window.close();
          return;
        }
        
        if (!code || !state) {
          console.error('Missing code or state parameter');
          window.close();
          return;
        }
        
        // Verify state matches what we stored
        const storedState = sessionStorage.getItem('github_oauth_state');
        if (state !== storedState) {
          console.error('State mismatch - possible CSRF attack');
          window.close();
          return;
        }
        
        // Exchange code for access token
        const accessToken = await exchangeCodeForToken(code);
        
        if (accessToken) {
          // Store the access token and state for the parent window to pick up
          sessionStorage.setItem('github_access_token', accessToken);
          sessionStorage.setItem('github_received_state', state);
        }
        
        // Close the popup
        window.close();
      } catch (error) {
        console.error('GitHub callback error:', error);
        window.close();
      }
    };

    handleCallback();
  }, [navigate]);

  const exchangeCodeForToken = async (code: string): Promise<string | null> => {
    try {
      // Instead of exposing client secret on frontend, we should call our backend
      // to handle the token exchange securely
      const response = await fetch('/api/auth/github/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
        }),
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        return data.access_token;
      } else {
        console.error('Failed to get access token:', data);
        return null;
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Processing GitHub Login...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we complete your authentication.
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;
