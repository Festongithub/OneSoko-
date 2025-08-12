import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const WelcomeMessage: React.FC = () => {
  const { showWelcomeMessage, welcomeMessage, hideWelcomeMessage } = useAuth();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (showWelcomeMessage) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            hideWelcomeMessage();
            return 0;
          }
          return prev - 2; // Decrease by 2% every 100ms for 5 seconds total
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [showWelcomeMessage, hideWelcomeMessage]);

  if (!showWelcomeMessage) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-200 dark:border-green-700 p-4 animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {welcomeMessage}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We're glad to have you here!
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={hideWelcomeMessage}
              className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-1 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage; 