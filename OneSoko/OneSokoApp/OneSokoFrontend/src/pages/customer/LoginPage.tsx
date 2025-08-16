import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';
import FacebookOAuthButton from '../../components/auth/FacebookOAuthButton';
import GitHubOAuthButton from '../../components/auth/GitHubOAuthButton';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginType, setLoginType] = useState<'customer' | 'shop_owner'>('customer');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, userType } = useAuthStore();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the auth store login method which handles the API call
      await login(formData.email, formData.password);
      
      toast.success('Login successful!');
      
      // Check if user is a shop owner and redirect accordingly
      const redirectPath = userType === 'shop_owner' ? '/shop/dashboard' : from;
      navigate(redirectPath, { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
        setErrors({
          email: 'Invalid credentials',
          password: 'Invalid credentials'
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSuccess = (response: any) => {
    toast.success('Login successful!');
    
    // Determine redirect based on user type or OAuth response
    const redirectPath = response?.profile?.is_shopowner || loginType === 'shop_owner' 
      ? '/shop/dashboard' 
      : from;
    navigate(redirectPath, { replace: true });
  };

  const handleOAuthError = (error: any) => {
    console.error('OAuth error:', error);
    toast.error(error.message || 'OAuth login failed');
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">OneSoko</h1>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            Sign in to your account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-secondary-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-200">
          {/* Login Type Toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
              <button
                type="button"
                onClick={() => setLoginType('customer')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  loginType === 'customer'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setLoginType('shop_owner')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  loginType === 'shop_owner'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                }`}
              >
                Shop Owner
              </button>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <GoogleOAuthButton
              userType={loginType}
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
            />
            <FacebookOAuthButton
              userType={loginType}
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
            />
            <GitHubOAuthButton
              userType={loginType}
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-secondary-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900 dark:text-secondary-100">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm">
              <span className="text-secondary-600 dark:text-secondary-400">
                Don't have an account?{' '}
              </span>
              <Link
                to={loginType === 'shop_owner' ? '/register/shop-owner' : '/register'}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {loginType === 'shop_owner' ? 'Become a seller' : 'Sign up'}
              </Link>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <div className="text-xs text-secondary-500 dark:text-secondary-400 space-y-1">
              <p>
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
