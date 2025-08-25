import React from 'react';
import { 
  CheckCircleIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  ArrowsRightLeftIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const LayoutImprovementDemo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <SparklesIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Enhanced Side-by-Side Navigation
          </h1>
        </div>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Your main menu components now appear concurrently side by side for a better user experience!
        </p>
      </div>

      {/* Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Desktop Layout Improvement */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ComputerDesktopIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Desktop Experience
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Sidebar always visible alongside content</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>True side-by-side layout with flex containers</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Smooth transitions and hover animations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Custom scrollbar styling for better aesthetics</span>
            </li>
          </ul>
        </div>

        {/* Mobile Layout Improvement */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DevicePhoneMobileIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Mobile Experience
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Overlay navigation with smooth slide animations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Enhanced touch targets and gestures</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Improved overlay with backdrop blur</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Better close button positioning</span>
            </li>
          </ul>
        </div>

        {/* Technical Improvements */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ArrowsRightLeftIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Layout Architecture
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Flexbox-based responsive layout system</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>CSS Grid integration for complex layouts</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Optimized z-index management</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Accessibility-focused design patterns</span>
            </li>
          </ul>
        </div>

        {/* User Experience */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Enhanced UX
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Concurrent component visibility</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Reduced cognitive load with persistent navigation</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Smooth micro-interactions and animations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
              <span>Improved visual hierarchy and spacing</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Before vs After Visual */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 text-center">
          Layout Comparison
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="space-y-2">
            <h4 className="font-medium text-neutral-700 dark:text-neutral-300">❌ Before (Stacked)</h4>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="space-y-2">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-600 rounded"></div>
                <div className="h-20 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                <div className="text-xs text-neutral-500">Menu appears at bottom</div>
              </div>
            </div>
          </div>
          
          {/* After */}
          <div className="space-y-2">
            <h4 className="font-medium text-neutral-700 dark:text-neutral-300">✅ After (Side-by-Side)</h4>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div className="flex space-x-2">
                <div className="w-1/3 h-20 bg-primary-100 dark:bg-primary-900/30 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-600 rounded"></div>
                  <div className="h-10 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                </div>
              </div>
              <div className="text-xs text-neutral-500 mt-2">Components appear side by side</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-success-900 dark:text-success-100 mb-3">
          🎉 How to Experience the Improvements
        </h3>
        <div className="space-y-2 text-success-800 dark:text-success-200">
          <p>1. <strong>Desktop:</strong> Navigate using the sidebar - notice how it stays visible alongside the content</p>
          <p>2. <strong>Mobile:</strong> Tap the menu button (☰) in the header to see the smooth slide-in navigation</p>
          <p>3. <strong>Transitions:</strong> Watch for the enhanced animations when switching between pages</p>
          <p>4. <strong>Accessibility:</strong> Try keyboard navigation (Tab/Enter) for improved focus management</p>
        </div>
      </div>
    </div>
  );
};

export default LayoutImprovementDemo;
