import React, { useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface NewsletterSubscriptionProps {
  variant?: 'default' | 'minimal' | 'banner';
  showTitle?: boolean;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  variant = 'default',
  showTitle = true,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscriptionStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/email-subscription/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          subscription_types: ['newsletter', 'promotions', 'updates']
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionStatus('success');
        setMessage('Thank you! Please check your email to confirm your subscription.');
        setEmail('');
      } else {
        setSubscriptionStatus('error');
        setMessage(data.email?.[0] || data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetStatus = () => {
    setSubscriptionStatus('idle');
    setMessage('');
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'space-y-2',
          form: 'flex space-x-2',
          input: 'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm',
          button: 'px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium'
        };
      case 'banner':
        return {
          container: 'bg-primary-50 p-6 rounded-lg space-y-4',
          form: 'flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3',
          input: 'flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
          button: 'px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium'
        };
      default:
        return {
          container: 'space-y-3',
          form: 'flex space-x-2',
          input: 'flex-1 px-3 py-2 bg-secondary-800 text-white placeholder-secondary-400 border border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm',
          button: 'px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      {showTitle && (
        <div className="flex items-center space-x-2">
          <EnvelopeIcon className="h-5 w-5 text-primary-500" />
          <h3 className={`font-semibold ${variant === 'banner' ? 'text-lg' : 'text-sm'}`}>
            Stay Updated
          </h3>
        </div>
      )}
      
      {variant === 'banner' && (
        <p className="text-gray-600">
          Get the latest product updates, exclusive deals, and news from our marketplace.
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (subscriptionStatus !== 'idle') resetStatus();
          }}
          disabled={isSubmitting}
          className={`${styles.input} disabled:opacity-50`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${styles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Subscribing...' : buttonText}
        </button>
      </form>
      
      {/* Status message */}
      {subscriptionStatus !== 'idle' && (
        <div className={`flex items-center space-x-2 text-sm ${
          subscriptionStatus === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {subscriptionStatus === 'success' ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscription;
