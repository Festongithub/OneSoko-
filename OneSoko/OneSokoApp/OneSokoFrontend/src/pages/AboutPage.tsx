import React from 'react';
import { 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  HeartIcon,
  GlobeAltIcon,
  TruckIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BuildingStorefrontIcon className="w-16 h-16 mx-auto mb-6 text-primary-100" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About OneSoko</h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Connecting local shops with customers, building stronger communities one purchase at a time.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Our Mission</h2>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              OneSoko empowers local businesses by providing them with modern e-commerce tools while 
              helping customers discover and support their neighborhood shops.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Community First</h3>
              <p className="text-secondary-600">
                Supporting local businesses and fostering community connections.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Trusted Platform</h3>
              <p className="text-secondary-600">
                Secure transactions and verified shop owners for peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Fast Delivery</h3>
              <p className="text-secondary-600">
                Quick local delivery from shops in your neighborhood.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Fair Pricing</h3>
              <p className="text-secondary-600">
                Competitive prices with transparent fees for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-secondary-600">
                <p>
                  OneSoko was born from a simple observation: while online shopping was booming, 
                  local shops were struggling to reach customers in the digital age.
                </p>
                <p>
                  We believed that technology should bridge the gap between traditional commerce 
                  and modern convenience, not replace it entirely. Our platform gives local 
                  businesses the tools they need to thrive online while maintaining the personal 
                  touch that makes them special.
                </p>
                <p>
                  Today, OneSoko connects thousands of customers with local shops, creating 
                  a thriving ecosystem that benefits everyone in the community.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                <GlobeAltIcon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">Global Vision, Local Impact</h3>
                <p className="text-secondary-600">
                  We're building a global network of local marketplaces, empowering communities 
                  worldwide while preserving what makes each neighborhood unique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Our Values</h2>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              These principles guide everything we do at OneSoko.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-secondary-200">
              <HeartIcon className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">Community Love</h3>
              <p className="text-secondary-600">
                We genuinely care about the communities we serve and work to strengthen local economies.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-secondary-200">
              <StarIcon className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">Excellence</h3>
              <p className="text-secondary-600">
                We strive for excellence in every interaction, from user experience to customer support.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-secondary-200">
              <ShieldCheckIcon className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">Integrity</h3>
              <p className="text-secondary-600">
                Transparency, honesty, and fairness are at the core of all our business practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join the OneSoko Community
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you're a customer looking for local treasures or a shop owner ready to go digital, 
            OneSoko is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Start Shopping
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Become a Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
