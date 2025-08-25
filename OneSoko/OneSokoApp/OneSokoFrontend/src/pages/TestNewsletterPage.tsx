import React from 'react';
import { NewsletterSubscription } from '../components/newsletter';

const TestNewsletterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Newsletter Subscription Test
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Default variant */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Default Variant</h2>
              <NewsletterSubscription variant="default" />
            </div>
            
            {/* Minimal variant */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Minimal Variant</h2>
              <NewsletterSubscription variant="minimal" />
            </div>
            
            {/* Banner variant */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Banner Variant</h2>
              <NewsletterSubscription variant="banner" />
            </div>
          </div>

          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">API Test Information</h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Endpoint:</strong> POST /api/email-subscription/subscribe/</p>
              <p><strong>Payload:</strong> {JSON.stringify({ email: 'user@example.com', subscription_types: ['newsletter', 'promotions', 'updates'] }, null, 2)}</p>
              <p><strong>Expected Response:</strong> Confirmation message and email sent to console</p>
            </div>
          </div>

          <div className="mt-8 bg-green-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-green-900">Features Implemented</h2>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✅ Email validation and duplicate prevention</li>
              <li>✅ Confirmation email with HTML template</li>
              <li>✅ Token-based email confirmation</li>
              <li>✅ Subscription status tracking</li>
              <li>✅ Unsubscribe functionality</li>
              <li>✅ Django admin interface</li>
              <li>✅ Multiple subscription types</li>
              <li>✅ Real-time form feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNewsletterPage;
