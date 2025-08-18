import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface AboutIconProps {
  className?: string;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AboutIcon: React.FC<AboutIconProps> = ({ 
  className = '', 
  variant = 'outline',
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const baseClasses = `${sizeClasses[size]} ${className}`;

  if (variant === 'solid') {
    return (
      <div className={`${baseClasses} bg-primary-600 text-white rounded-full flex items-center justify-center p-1`}>
        <InformationCircleIcon className="w-full h-full" />
      </div>
    );
  }

  return <InformationCircleIcon className={baseClasses} />;
};

export default AboutIcon;
