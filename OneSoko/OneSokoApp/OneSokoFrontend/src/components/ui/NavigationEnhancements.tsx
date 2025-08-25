import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items = [], 
  className = "",
  showHome = true 
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from URL if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({ label: 'Home', href: '/', icon: HomeIcon });
    }

    pathnames.forEach((pathname, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = pathname
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: index === pathnames.length - 1 ? undefined : href
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 mx-2 text-neutral-400" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center space-x-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center space-x-1 ${
                  isLast 
                    ? 'text-neutral-900 dark:text-white font-medium' 
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}>
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Quick Action Floating Button
interface QuickActionButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color?: 'primary' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  onClick,
  icon: IconComponent,
  label,
  color = 'primary',
  size = 'md',
  position = 'bottom-right',
  className = ""
}) => {
  const colorClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    success: 'bg-success-600 hover:bg-success-700 text-white',
    error: 'bg-error-600 hover:bg-error-700 text-white',
    warning: 'bg-warning-600 hover:bg-warning-700 text-white'
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]} ${sizeClasses[size]} ${colorClasses[color]}
        rounded-full shadow-elevated hover:shadow-2xl transition-all duration-200
        flex items-center justify-center group z-40 ${className}
      `}
      title={label}
    >
      <IconComponent className={iconSizes[size]} />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};

// Progress Indicator for Multi-step Processes
interface ProgressStepProps {
  steps: { label: string; completed: boolean }[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressStepProps> = ({
  steps,
  currentStep,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <div className={`
              relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
              ${isCompleted 
                ? 'bg-success-600 border-success-600 text-white' 
                : isCurrent 
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-neutral-300 text-neutral-500'
              }
            `}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step Label */}
            <span className={`
              ml-2 text-sm font-medium
              ${isCompleted || isCurrent 
                ? 'text-neutral-900 dark:text-white' 
                : 'text-neutral-500 dark:text-neutral-400'
              }
            `}>
              {step.label}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-colors duration-200
                ${isCompleted 
                  ? 'bg-success-600' 
                  : 'bg-neutral-300 dark:bg-neutral-600'
                }
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default { Breadcrumbs, QuickActionButton, ProgressIndicator };
