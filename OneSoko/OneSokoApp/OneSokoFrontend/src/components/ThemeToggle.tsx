import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, toggleTheme } = useTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1.5';
      case 'lg':
        return 'p-3';
      default:
        return 'p-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${getSizeClasses()}
        rounded-lg
        bg-secondary-100 hover:bg-secondary-200 
        dark:bg-secondary-800 dark:hover:bg-secondary-700
        text-secondary-700 dark:text-secondary-300
        transition-all duration-200
        flex items-center justify-center
        border border-secondary-200 dark:border-secondary-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
        dark:focus:ring-offset-secondary-900
        ${className}
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className={`${getIconSize()} transition-transform duration-200 hover:scale-110`} />
      ) : (
        <SunIcon className={`${getIconSize()} transition-transform duration-200 hover:scale-110`} />
      )}
    </button>
  );
};

export default ThemeToggle;
