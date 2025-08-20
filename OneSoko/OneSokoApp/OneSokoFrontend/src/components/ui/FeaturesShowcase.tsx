import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  HeartIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stats?: string;
  benefit: string;
}

const features: Feature[] = [
  {
    id: 'security',
    title: 'Enterprise Security',
    description: 'Bank-level encryption and fraud protection for safe transactions',
    icon: ShieldCheckIcon,
    color: 'from-blue-500 to-blue-600',
    stats: '99.9% Safe',
    benefit: 'Shop with confidence knowing your data is protected'
  },
  {
    id: 'delivery',
    title: 'Fast Delivery',
    description: 'Express shipping and real-time tracking for all orders',
    icon: TruckIcon,
    color: 'from-green-500 to-green-600',
    stats: '24-48hrs',
    benefit: 'Get your products delivered lightning-fast'
  },
  {
    id: 'payment',
    title: 'Flexible Payments',
    description: 'Multiple payment options including mobile money and cards',
    icon: CreditCardIcon,
    color: 'from-purple-500 to-purple-600',
    stats: '10+ Methods',
    benefit: 'Pay your way with secure payment options'
  },
  {
    id: 'support',
    title: '24/7 Support',
    description: 'Round-the-clock customer service via chat, email, and phone',
    icon: ChatBubbleLeftRightIcon,
    color: 'from-orange-500 to-orange-600',
    stats: 'Always Here',
    benefit: 'Get help whenever you need it, day or night'
  },
  {
    id: 'quality',
    title: 'Quality Assured',
    description: 'Verified sellers and authentic products with quality guarantee',
    icon: StarIcon,
    color: 'from-yellow-500 to-yellow-600',
    stats: '5-Star Rating',
    benefit: 'Only the best products from trusted sellers'
  },
  {
    id: 'wishlist',
    title: 'Smart Wishlist',
    description: 'Save favorites and get alerts on price drops and availability',
    icon: HeartIcon,
    color: 'from-pink-500 to-pink-600',
    stats: 'Price Alerts',
    benefit: 'Never miss a deal on your favorite items'
  },
  {
    id: 'analytics',
    title: 'Business Tools',
    description: 'Advanced analytics and tools for sellers to grow their business',
    icon: ChartBarIcon,
    color: 'from-indigo-500 to-indigo-600',
    stats: 'Growth Tools',
    benefit: 'Scale your business with data-driven insights'
  },
  {
    id: 'express',
    title: 'Express Checkout',
    description: 'One-click purchasing with saved payment and delivery preferences',
    icon: ClockIcon,
    color: 'from-teal-500 to-teal-600',
    stats: 'One-Click',
    benefit: 'Checkout in seconds with saved preferences'
  }
];

interface FeaturesShowcaseProps {
  className?: string;
}

export const FeaturesShowcase: React.FC<FeaturesShowcaseProps> = ({ className = "" }) => {
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setActiveFeature(current => {
        const currentIndex = features.findIndex(f => f.id === current);
        const nextIndex = (currentIndex + 1) % features.length;
        return features[nextIndex].id;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  return (
    <section className={`py-20 bg-white dark:bg-neutral-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Why Choose OneSoko?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Experience the future of e-commerce with our enterprise-grade platform 
            designed for both customers and businesses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => {
              const isActive = feature.id === activeFeature;
              return (
                <div
                  key={feature.id}
                  className={`group relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br ' + feature.color + ' text-white shadow-elevated scale-105' 
                      : 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md'
                  }`}
                  onClick={() => {
                    setActiveFeature(feature.id);
                    setIsAutoRotating(false);
                  }}
                  onMouseEnter={() => setIsAutoRotating(false)}
                  onMouseLeave={() => setIsAutoRotating(true)}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-br ${feature.color} text-white group-hover:scale-110`
                    }`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h3 className={`font-semibold text-sm mb-1 ${
                        isActive ? 'text-white' : 'text-neutral-900 dark:text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-xs ${
                        isActive ? 'text-white/80' : 'text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {feature.stats}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 pointer-events-none animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature Details */}
          <div className="space-y-8">
            <div 
              key={activeFeature} 
              className="animate-fade-in"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${activeFeatureData.color} text-white shadow-elevated`}>
                  <activeFeatureData.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {activeFeatureData.title}
                  </h3>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400">
                    {activeFeatureData.stats}
                  </p>
                </div>
              </div>

              <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                {activeFeatureData.description}
              </p>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-l-4 border-primary-500">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  💡 Key Benefit
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  {activeFeatureData.benefit}
                </p>
              </div>
            </div>

            {/* Auto-rotation indicator */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  isAutoRotating ? 'bg-primary-500 animate-pulse' : 'bg-neutral-300'
                }`} />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {isAutoRotating ? 'Auto-rotating features' : 'Auto-rotation paused'}
                </span>
              </div>
              
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {isAutoRotating ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
