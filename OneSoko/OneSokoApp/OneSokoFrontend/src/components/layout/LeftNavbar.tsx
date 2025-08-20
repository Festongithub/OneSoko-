import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  RssIcon,
  MagnifyingGlassIcon,
  MapIcon,
  Squares2X2Icon,
  BuildingStorefrontIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  RssIcon as RssSolid,
  MagnifyingGlassIcon as MagnifyingSolid,
  MapIcon as MapSolid,
  Squares2X2Icon as SquaresSolid,
  BuildingStorefrontIcon as StorefrontSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
}

interface LeftNavbarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  { 
    name: 'Home', 
    href: '/', 
    icon: HomeIcon, 
    iconSolid: HomeSolid 
  },
  { 
    name: 'Feed', 
    href: '/feed', 
    icon: RssIcon, 
    iconSolid: RssSolid 
  },
  { 
    name: 'Discover', 
    href: '/discover', 
    icon: MagnifyingGlassIcon, 
    iconSolid: MagnifyingSolid 
  },
  { 
    name: 'Explore', 
    href: '/explore', 
    icon: MapIcon, 
    iconSolid: MapSolid 
  },
  { 
    name: 'Categories', 
    href: '/products', 
    icon: Squares2X2Icon, 
    iconSolid: SquaresSolid 
  },
  { 
    name: 'Shop', 
    href: '/shops', 
    icon: BuildingStorefrontIcon, 
    iconSolid: StorefrontSolid 
  },
];

const LeftNavbar: React.FC<LeftNavbarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 z-40 shadow-lg transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-secondary-200 dark:border-secondary-700">
          <Link to="/" className="flex items-center space-x-3" onClick={handleLinkClick}>
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-2xl font-bold text-secondary-900 dark:text-white">OneSoko</span>
          </Link>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const IconComponent = active ? item.iconSolid : item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                      ${active 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm' 
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:text-secondary-900 dark:hover:text-secondary-200'
                      }
                    `}
                  >
                    <IconComponent 
                      className={`
                        w-6 h-6 mr-3 transition-colors duration-200
                        ${active 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-secondary-500 dark:text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-300'
                        }
                      `} 
                    />
                    <span className="transition-colors duration-200">
                      {item.name}
                    </span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
            <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-primary-100 mb-3">Get unlimited access to all features</p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftNavbar;
