import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'button' | 'dropdown' | 'icon';
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  variant = 'button', 
  className = '' 
}) => {
  const { theme, toggleTheme } = useTheme();

  const renderButton = () => (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );

  const renderDropdown = () => (
    <div className="relative">
      <button
        onClick={toggleTheme}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        } ${className}`}
      >
        {theme === 'light' ? (
          <MoonIcon className="w-4 h-4" />
        ) : (
          <SunIcon className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      </button>
    </div>
  );

  const renderIcon = () => (
    <button
      onClick={toggleTheme}
      className={`p-1 rounded-full transition-colors ${
        theme === 'dark'
          ? 'text-yellow-400 hover:text-yellow-300'
          : 'text-gray-600 hover:text-gray-800'
      } ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );

  switch (variant) {
    case 'dropdown':
      return renderDropdown();
    case 'icon':
      return renderIcon();
    default:
      return renderButton();
  }
};

export default ThemeSwitcher; 