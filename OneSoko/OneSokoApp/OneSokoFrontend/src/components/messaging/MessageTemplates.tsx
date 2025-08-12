import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface MessageTemplatesProps {
  onSelectTemplate: (template: string) => void;
  onClose: () => void;
  isShopOwner?: boolean;
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  onSelectTemplate,
  onClose,
  isShopOwner = false
}) => {
  const [activeCategory, setActiveCategory] = useState('general');

  const customerTemplates = {
    general: [
      "Hi! I'm interested in learning more about this product.",
      "Hello! Is this item still available?",
      "Could you please provide more details about this product?",
      "What are the shipping options for this item?",
      "Do you offer any discounts for bulk purchases?",
      "Can I see more photos of this product?",
      "What's the return policy for this item?",
      "Is this product authentic/genuine?"
    ],
    pricing: [
      "What's your best price for this item?",
      "Do you accept price negotiations?",
      "Are there any ongoing promotions?",
      "What payment methods do you accept?",
      "Do you offer installment plans?",
      "Is the price inclusive of taxes?"
    ],
    shipping: [
      "How long does shipping usually take?",
      "Do you offer express delivery?",
      "What are your shipping charges?",
      "Can you ship to my location?",
      "Do you provide tracking information?",
      "Is international shipping available?"
    ],
    support: [
      "I need help with my recent order.",
      "Can you help me track my order?",
      "I'd like to return/exchange this item.",
      "There seems to be an issue with my order.",
      "Can you provide warranty information?",
      "I need technical support for this product."
    ]
  };

  const shopOwnerTemplates = {
    general: [
      "Thank you for your interest in our products!",
      "Hello! I'd be happy to help you with any questions.",
      "Welcome to our shop! How can I assist you today?",
      "Thank you for choosing our store.",
      "I appreciate your business!",
      "Feel free to ask if you need any assistance."
    ],
    product_info: [
      "This product is currently in stock and ready to ship.",
      "Here are the detailed specifications you requested:",
      "This item comes with a full warranty.",
      "The product includes the following accessories:",
      "This is one of our bestselling items.",
      "I can provide additional photos if needed."
    ],
    pricing: [
      "The current price includes all applicable taxes.",
      "We offer competitive pricing with quality guarantee.",
      "Bulk discounts are available for orders over X items.",
      "We accept the following payment methods:",
      "Special pricing is available for repeat customers.",
      "The price is firm, but I can offer free shipping."
    ],
    shipping: [
      "We offer fast and secure shipping nationwide.",
      "Your order will be processed within 24 hours.",
      "Tracking information will be provided once shipped.",
      "Express delivery is available for urgent orders.",
      "We use reliable courier services for delivery.",
      "Packaging is done with extra care to prevent damage."
    ],
    customer_service: [
      "Your satisfaction is our top priority.",
      "We stand behind the quality of our products.",
      "Please let me know if you're not completely satisfied.",
      "We offer easy returns and exchanges.",
      "Our customer support team is here to help.",
      "Thank you for being a valued customer."
    ],
    promotional: [
      "Check out our latest deals and offers!",
      "New arrivals are now available in our store.",
      "Don't miss our limited-time promotion!",
      "Follow us for exclusive updates and discounts.",
      "Refer a friend and get special discounts!",
      "Subscribe to our newsletter for early access to sales."
    ]
  };

  const templates = isShopOwner ? shopOwnerTemplates : customerTemplates;
  const categories = Object.keys(templates);

  const categoryLabels: { [key: string]: string } = {
    general: 'General',
    pricing: 'Pricing',
    shipping: 'Shipping',
    support: 'Support',
    product_info: 'Product Info',
    customer_service: 'Customer Service',
    promotional: 'Promotional'
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Message Templates
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 mb-4 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-sm rounded-md whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* Templates */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {templates[activeCategory as keyof typeof templates]?.map((template, index) => (
            <div
              key={index}
              className="group p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {template}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(template);
                  }}
                  className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                  title="Copy to clipboard"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Tip */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Click on any template to insert it into your message. 
            You can then edit it before sending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplates;
