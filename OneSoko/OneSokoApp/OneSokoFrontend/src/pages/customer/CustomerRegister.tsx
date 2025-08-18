import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';
import FacebookOAuthButton from '../../components/auth/FacebookOAuthButton';
import GitHubOAuthButton from '../../components/auth/GitHubOAuthButton';
import { triggerPasswordSave } from '../../utils/passwordManager';
import toast from 'react-hot-toast';

const CustomerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const navigate = useNavigate();
  const { register } = useAuthStore();

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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined
      });
      
      // Trigger password save for browser
      if (formRef.current) {
        triggerPasswordSave(formRef.current);
      }
      
      toast.success('Account created successfully! Welcome to OneSoko!');
      navigate('/');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSuccess = () => {
    toast.success('Account created successfully! Welcome to OneSoko!');
    navigate('/');
  };

  const handleOAuthError = (error: any) => {
    console.error('OAuth error:', error);
    toast.error(error.message || 'OAuth registration failed');
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Back Button */}
          <div className="flex justify-center mb-4">
            <Link
              to="/register"
              className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to selection</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-primary-600 mb-2">OneSoko</h1>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Create Customer Account
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            Join thousands of customers shopping on OneSoko
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-secondary-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-200">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <GoogleOAuthButton
              userType="customer"
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
            />
            <FacebookOAuthButton
              userType="customer"
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
            />
            <GitHubOAuthButton
              userType="customer"
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
                Or register with email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="label">
                  First Name *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`input ${errors.first_name ? 'input-error' : ''}`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.first_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="label">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`input ${errors.last_name ? 'input-error' : ''}`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone_number" className="label">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                autoComplete="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address (Optional) */}
            <div>
              <label htmlFor="address" className="label">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="123 Main St, City, State"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a strong password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm">
              <span className="text-secondary-600 dark:text-secondary-400">
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <div className="text-xs text-secondary-500 dark:text-secondary-400 space-y-1">
              <p>
                By creating an account, you agree to our{' '}
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

export default CustomerRegister;
