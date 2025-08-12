import React from 'react';

const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
        </div>
        
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        
        {/* Loading Text */}
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Loading OneSoko...
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we prepare your experience
        </p>
      </div>
    </div>
  );
};

export default AuthLoading;
