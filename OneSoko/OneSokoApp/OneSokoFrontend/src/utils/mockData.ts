import { Shop } from '../types';

export const createMockShop = (overrides: Partial<Shop> = {}): Shop => {
  return {
    shopId: '1',
    name: 'Sample Shop',
    description: 'A sample shop for testing',
    location: 'Nairobi, Kenya',
    logo: null,
    created_at: '2024-01-01T00:00:00Z',
    status: 'active',
    phone: '+254700000000',
    email: 'shop@example.com',
    social_link: 'https://example.com',
    slug: 'sample-shop',
    views: 100,
    total_sales: 10000,
    total_orders: 50,
    latitude: -1.2921,
    longitude: 36.8219,
    street: 'Sample Street',
    city: 'Nairobi',
    country: 'Kenya',
    shopowner: {
      id: 1,
      username: 'shopowner',
      email: 'owner@example.com',
      first_name: 'Shop',
      last_name: 'Owner',
      date_joined: '2024-01-01T00:00:00Z'
    },
    // Required fields that were missing
    business_type: 'sole_proprietorship',
    business_category: 'Electronics',
    payment_methods: ['cash', 'mobile_money'],
    delivery_options: ['pickup', 'delivery'],
    is_verified: false,
    verification_status: 'not_submitted',
    average_rating: 4.5,
    total_reviews: 10,
    response_rate: 95,
    response_time_hours: 24, // Add missing required field
    gdpr_compliant: true, // Add missing required field  
    terms_accepted: true, // Add missing required field
    last_updated: '2024-01-01T00:00:00Z', // Add missing required field
    updated_by: 'system', // Add missing required field
    ...overrides
  };
};

export const createMockShops = (): Shop[] => [
  createMockShop({
    shopId: '1',
    name: 'Tech Haven Electronics',
    description: 'Your one-stop shop for all electronics and gadgets. We offer the latest smartphones, laptops, and accessories.',
    business_category: 'Electronics',
    slug: 'tech-haven-electronics',
    phone: '+254700123456',
    email: 'info@techhaven.co.ke',
    social_link: 'https://facebook.com/techhaven',
    views: 1250,
    total_sales: 45000,
    total_orders: 89,
    street: 'Kimathi Street',
    shopowner: {
      id: 1,
      username: 'techowner',
      email: 'owner@techhaven.co.ke',
      first_name: 'John',
      last_name: 'Kamau',
      date_joined: '2024-01-10T00:00:00Z'
    }
  }),
  createMockShop({
    shopId: '2',
    name: 'Fashion Forward Boutique',
    description: 'Trendy clothing and accessories for men and women. Latest fashion trends at affordable prices.',
    business_category: 'Fashion',
    location: 'Mombasa, Kenya',
    created_at: '2024-01-20T14:30:00Z',
    slug: 'fashion-forward-boutique',
    phone: '+254700654321',
    email: 'info@fashionforward.co.ke',
    social_link: 'https://instagram.com/fashionforward',
    views: 890,
    total_sales: 32000,
    total_orders: 67,
    latitude: -4.0435,
    longitude: 39.6682,
    street: 'Moi Avenue',
    city: 'Mombasa',
    shopowner: {
      id: 2,
      username: 'fashionista',
      email: 'owner@fashionforward.co.ke',
      first_name: 'Sarah',
      last_name: 'Johnson',
      date_joined: '2024-01-10T00:00:00Z'
    }
  }),
  createMockShop({
    shopId: '3',
    name: 'Fresh Market Groceries',
    description: 'Premium grocery store offering fresh produce, organic foods, and household essentials. Quality guaranteed.',
    business_category: 'Food & Beverages',
    location: 'Kisumu, Kenya',
    created_at: '2024-02-01T09:15:00Z',
    slug: 'fresh-market-groceries',
    phone: '+254700789012',
    email: 'info@freshmarket.co.ke',
    social_link: 'https://facebook.com/freshmarket',
    views: 567,
    total_sales: 18000,
    total_orders: 45,
    latitude: -0.1022,
    longitude: 34.7617,
    street: 'Oginga Odinga Street',
    city: 'Kisumu',
    shopowner: {
      id: 3,
      username: 'freshmarket',
      email: 'owner@freshmarket.co.ke',
      first_name: 'Michael',
      last_name: 'Ochieng',
      date_joined: '2024-01-25T00:00:00Z'
    }
  })
];
