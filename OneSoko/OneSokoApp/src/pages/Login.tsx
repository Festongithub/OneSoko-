import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { authAPI, userProfileAPI, shopsAPI } from '../services/api';
import { LoginForm } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'checking' | 'connected' | 'disconnected'>('unknown');
  const { login, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        setError('Backend server is running and accessible! ✅');
      } else {
        setConnectionStatus('disconnected');
        setError(`Backend responded with status: ${response.status}`);
      }
    } catch (error: any) {
      setConnectionStatus('disconnected');
      if (error.name === 'TimeoutError') {
        setError('⏰ Connection timeout - Backend server may not be running');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
        setError('🚫 Cannot connect to backend server (http://localhost:8000)\n\nTo start the backend:\n1. Open terminal in your Django project\n2. Run: python manage.py runserver 8000');
      } else {
        setError(`Connection error: ${error.message}`);
      }
    }
  };
  const location = useLocation();
  
  // Get the page user was trying to access before login
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authAPI.login(data);
      
      // Store tokens
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
      
      // Check user profile to determine if they're a shop owner
      try {
        const profile = await userProfileAPI.getMyProfile();
        localStorage.setItem('user_profile', JSON.stringify(profile));
        
        // Show welcome message and update auth state
        await login(profile);
        
        // Smart redirect based on user type and intended destination
        if (profile.is_shopowner) {
          // Shop owner redirect logic
          try {
            const userShops = await shopsAPI.getMyShops();
            if (userShops.length > 0) {
              // If they were trying to access a specific shop page, go there
              // Otherwise, redirect to shop dashboard
              if (from.startsWith('/shop') && from !== '/shop-dashboard') {
                navigate(from, { replace: true });
              } else {
                navigate('/shop-dashboard', { replace: true });
              }
            } else {
              // Shop owner but no shops - redirect to create shop
              navigate('/create-shop', { replace: true });
            }
          } catch (shopError) {
            console.warn('Could not fetch user shops:', shopError);
            navigate('/create-shop', { replace: true });
          }
        } else {
          // Regular user - go to intended page or home
          navigate(from, { replace: true });
        }
      } catch (profileError) {
        // If profile fetch fails, still authenticate but redirect to profile setup
        console.warn('Could not fetch user profile:', profileError);
        await login({ id: 0, username: data.username, email: '' } as any);
        navigate('/profile-setup', { replace: true });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error handling with specific messages
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('Network error') || errorMessage.includes('timeout')) {
          setError('🔌 Cannot connect to server. Please ensure the backend is running on http://localhost:8000');
        } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          setError('🚫 Login endpoint not found. Please check if the backend server is running and the API is properly configured.');
        } else if (errorMessage.includes('credentials') || errorMessage.includes('401')) {
          setError('❌ Invalid username or password. Please check your credentials and try again.');
        } else if (errorMessage.includes('500')) {
          setError('🛠️ Server error. Please try again later or contact support.');
        } else {
          setError(`⚠️ Login failed: ${errorMessage}`);
        }
      } else {
        setError('❌ Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">O</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className={`mb-6 border rounded-lg p-4 ${
              connectionStatus === 'connected' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <p className="text-sm whitespace-pre-line">{error}</p>
            </div>
          )}

          {/* Connection Test */}
          <div className="mb-6">
            <button
              type="button"
              onClick={testConnection}
              disabled={connectionStatus === 'checking'}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                connectionStatus === 'checking'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : connectionStatus === 'connected'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {connectionStatus === 'checking' ? '🔄 Testing Backend Connection...' : 
               connectionStatus === 'connected' ? '✅ Backend Connected' :
               connectionStatus === 'disconnected' ? '❌ Backend Disconnected - Click to Retry' :
               '🔧 Test Backend Connection'}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  {...register('username', { required: 'Username is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || connectionStatus === 'disconnected'}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                  isLoading || connectionStatus === 'disconnected'
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : connectionStatus === 'disconnected' ? (
                  'Connect to Backend First'
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Shop Owner Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  <strong>Shop Owners:</strong> Sign in to access your shop dashboard and manage products.
                </p>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 