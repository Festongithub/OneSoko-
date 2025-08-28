import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { triggerPasswordSave, setupPasswordSave, enhanceFormForPasswordManager } from '../../utils/passwordManager';
import toast from 'react-hot-toast';

const ShopOwnerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    
    // Shop Information
    shopName: '',
    shopDescription: '',
    shopAddress: '',
    shopPhone: '',
    businessLicense: '',
    taxId: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  const navigate = useNavigate();
  const { registerShopOwner } = useAuthStore();

  // Enhance form for password manager compatibility
  useEffect(() => {
    if (formRef.current) {
      enhanceFormForPasswordManager(formRef.current);
    }
  }, []);

  // Auto-save passwords when user moves to step 2 or changes password
  useEffect(() => {
    if (formRef.current && formData.password && formData.email) {
      // Small delay to allow form to update
      const timer = setTimeout(() => {
        if (formRef.current) {
          // Store password data for browser password manager
          const form = formRef.current;
          const formDataObj = new FormData(form);
          formDataObj.set('email', formData.email);
          formDataObj.set('password', formData.password);
          
          // Trigger password manager detection
          const event = new CustomEvent('password-updated', {
            detail: { 
              email: formData.email, 
              hasPassword: true,
              step: currentStep 
            }
          });
          window.dispatchEvent(event);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.password, formData.email, currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!formData.shopDescription.trim()) {
      newErrors.shopDescription = 'Shop description is required';
    }

    if (!formData.shopAddress.trim()) {
      newErrors.shopAddress = 'Shop address is required';
    }

    if (!formData.shopPhone.trim()) {
      newErrors.shopPhone = 'Shop phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await registerShopOwner({
        // Personal data
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        
        // Shop data
        shop_name: formData.shopName,
        shop_description: formData.shopDescription,
        shop_address: formData.shopAddress,
        shop_phone: formData.shopPhone,
      });

      // Enhanced password save for browser
      if (formRef.current) {
        triggerPasswordSave(formRef.current);
        
        // Also try to store using Credential Management API
        try {
          const { passwordManagerUtils } = await import('../../utils/passwordManager');
          await passwordManagerUtils.storeCredentials(formData.email, formData.password);
        } catch (error) {
          console.log('Credential Management API not available:', error);
        }
      }

      toast.success('Shop registration successful! Credentials saved to your password manager.');
      navigate('/shop/dashboard');
      
    } catch (error: any) {
      console.error('Shop registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        code: error.code,
        config: error.config
      });
      
      if (error.response?.data) {
        const errorData = error.response.data;
        const newErrors: Record<string, string> = {};
        
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            newErrors[field] = errorData[field][0];
          } else {
            newErrors[field] = errorData[field];
          }
        });
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).some(key => ['username', 'email', 'password', 'firstName', 'lastName', 'phoneNumber'].includes(key))) {
          setCurrentStep(1);
        }
      } else {
        // Enhanced error message for debugging
        if (error.code === 'ERR_NETWORK') {
          toast.error('Network error: Cannot connect to backend. Please check if the backend server is running.');
        } else if (error.message?.includes('CORS')) {
          toast.error('CORS error: Backend needs CORS configuration for frontend requests.');
        } else {
          toast.error(`Registration failed: ${error.message || 'Please try again.'}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">OneSoko</h1>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Become a Shop Owner</h2>
          <p className="text-secondary-600">
            Start selling your products on OneSoko
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-secondary-300 text-secondary-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-secondary-600">Personal Info</span>
          </div>
          <div className={`mx-4 w-16 h-1 rounded ${
            currentStep >= 2 ? 'bg-primary-600' : 'bg-secondary-300'
          }`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-secondary-300 text-secondary-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-secondary-600">Shop Details</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="card">
          <div className="card-body">
            <form ref={formRef} onSubmit={currentStep === 2 ? handleSubmit : undefined} className="space-y-6" autoComplete="on">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">Personal Information</h3>
                  
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="label">
                      Username *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={errors.username ? 'input-error' : 'input'}
                      placeholder="Enter your username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
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
                      autoComplete="email username"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'input-error' : 'input'}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="label">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? 'input-error' : 'input'}
                        placeholder="First name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="label">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? 'input-error' : 'input'}
                        placeholder="Last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="label">
                      Phone Number *
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={errors.phoneNumber ? 'input-error' : 'input'}
                      placeholder="Enter your phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
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
                        className={errors.password ? 'input-error pr-10' : 'input pr-10'}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-secondary-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
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
                        className={errors.confirmPassword ? 'input-error pr-10' : 'input pr-10'}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-secondary-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary"
                    >
                      Next: Shop Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shop Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">Shop Information</h3>
                  
                  {/* Shop Name */}
                  <div>
                    <label htmlFor="shopName" className="label">
                      Shop Name *
                    </label>
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={handleChange}
                      className={errors.shopName ? 'input-error' : 'input'}
                      placeholder="Enter your shop name"
                    />
                    {errors.shopName && (
                      <p className="mt-1 text-sm text-red-600">{errors.shopName}</p>
                    )}
                  </div>

                  {/* Shop Description */}
                  <div>
                    <label htmlFor="shopDescription" className="label">
                      Shop Description *
                    </label>
                    <textarea
                      id="shopDescription"
                      name="shopDescription"
                      rows={4}
                      required
                      value={formData.shopDescription}
                      onChange={handleChange}
                      className={errors.shopDescription ? 'input-error' : 'input'}
                      placeholder="Describe what your shop sells and what makes it special"
                    />
                    {errors.shopDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.shopDescription}</p>
                    )}
                  </div>

                  {/* Shop Address */}
                  <div>
                    <label htmlFor="shopAddress" className="label">
                      Shop Address *
                    </label>
                    <textarea
                      id="shopAddress"
                      name="shopAddress"
                      rows={3}
                      required
                      value={formData.shopAddress}
                      onChange={handleChange}
                      className={errors.shopAddress ? 'input-error' : 'input'}
                      placeholder="Enter your shop's physical address"
                    />
                    {errors.shopAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.shopAddress}</p>
                    )}
                  </div>

                  {/* Shop Phone */}
                  <div>
                    <label htmlFor="shopPhone" className="label">
                      Shop Phone Number *
                    </label>
                    <input
                      id="shopPhone"
                      name="shopPhone"
                      type="tel"
                      required
                      value={formData.shopPhone}
                      onChange={handleChange}
                      className={errors.shopPhone ? 'input-error' : 'input'}
                      placeholder="Enter your shop's contact number"
                    />
                    {errors.shopPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.shopPhone}</p>
                    )}
                  </div>

                  {/* Business License (Optional) */}
                  <div>
                    <label htmlFor="businessLicense" className="label">
                      Business License Number (Optional)
                    </label>
                    <input
                      id="businessLicense"
                      name="businessLicense"
                      type="text"
                      value={formData.businessLicense}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your business license number if available"
                    />
                  </div>

                  {/* Tax ID (Optional) */}
                  <div>
                    <label htmlFor="taxId" className="label">
                      Tax ID (Optional)
                    </label>
                    <input
                      id="taxId"
                      name="taxId"
                      type="text"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your tax identification number if available"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn-outline-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Creating Shop...' : 'Create Shop'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerRegister;
