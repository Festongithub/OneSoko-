import React from 'react';
import QuickLinksWidget from '../components/layout/QuickLinksWidget';

const QuickLinksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Quick Links
            </h1>
            <p className="mt-2 text-lg text-secondary-600 dark:text-secondary-300">
              Quick access to all your favorite OneSoko features
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* All Links */}
            <div className="lg:col-span-2">
              <QuickLinksWidget
                variant="grid"
                showTitle={false}
                maxItems={20}
                className="mb-8"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg bg-secondary-50 dark:bg-secondary-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    Order #12345 delivered
                  </span>
                  <span className="ml-auto text-xs text-secondary-500">2h ago</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-secondary-50 dark:bg-secondary-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    New message from seller
                  </span>
                  <span className="ml-auto text-xs text-secondary-500">4h ago</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-secondary-50 dark:bg-secondary-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    Price drop alert
                  </span>
                  <span className="ml-auto text-xs text-secondary-500">1d ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default QuickLinksPage;
