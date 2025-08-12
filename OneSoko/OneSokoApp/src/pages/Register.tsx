import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import { RegisterForm } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedType, setSelectedType] = useState<'customer' | 'shopowner' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'checking' | 'connected' | 'disconnected'>('unknown');
  const { register: registerUser, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to access before registration
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
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const testEndpoint = selectedType === 'shopowner' 
        ? 'http://localhost:8000/api/shopowner-registration/' 
        : 'http://localhost:8000/api/user-registration/';
        
      const response = await fetch(testEndpoint, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        setError('');
        setSuccess('Backend server is running and accessible! ✅');
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
      setSuccess('');
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!selectedType) {
      setError('Please select an account type');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedType === 'shopowner') {
        // Redirect to shop owner registration page
        navigate('/register-shop-owner', { replace: true });
        return;
      } else {
        const result = await authAPI.register(data);
        setSuccess('Account created successfully! Redirecting to complete your profile...');
        
        // Create user data object for auth context
        const userData = {
          id: result.id || 0,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          is_shop_owner: false
        };
        
        // Update auth state
        await registerUser(userData);
        
        // Redirect to profile setup or intended destination
        setTimeout(() => {
          const destination = userData.first_name && userData.last_name ? from : '/profile-setup';
          navigate(destination, { replace: true });
        }, 2000);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-4 block">
              Choose Account Type
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedType('customer')}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'customer'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <UserIcon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Customer</div>
                  <div className="text-sm opacity-75">Shop and browse products</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedType('shopowner')}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'shopowner'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <BuildingStorefrontIcon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Shop Owner</div>
                  <div className="text-sm opacity-75">Sell products and manage your store</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className={`mb-6 border rounded-lg p-4 ${
              connectionStatus === 'connected' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <p className="text-sm whitespace-pre-line">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Connection Test */}
          {selectedType && (
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
                    : selectedType === 'customer'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                }`}
              >
                {connectionStatus === 'checking' ? '🔄 Testing Backend Connection...' : 
                 connectionStatus === 'connected' ? '✅ Backend Connected' :
                 connectionStatus === 'disconnected' ? '❌ Backend Disconnected - Click to Retry' :
                 `🔧 Test ${selectedType === 'customer' ? 'Customer' : 'Shop Owner'} Registration`}
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                  })}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: 'Invalid email address' 
                    }
                  })}
                  type="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  {...register('first_name', { required: 'First name is required' })}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                <input
                  {...register('last_name', { required: 'Last name is required' })}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
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
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !selectedType || connectionStatus === 'disconnected'}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                  isLoading || !selectedType || connectionStatus === 'disconnected'
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : selectedType === 'customer'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : selectedType === 'shopowner'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : connectionStatus === 'disconnected' ? (
                  'Connect to Backend First'
                ) : !selectedType ? (
                  'Select Account Type'
                ) : (
                  `Create ${selectedType === 'customer' ? 'Customer' : selectedType === 'shopowner' ? 'Shop Owner' : ''} Account`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 