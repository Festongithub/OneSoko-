import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  BookmarkIcon,
  UserIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  SparklesIcon,
  FireIcon,
  ShoppingBagIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ShareIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';
import XProductCard from '../../components/product/XProductCard';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  iconSolid: any;
  count?: number;
  active?: boolean;
}

interface TrendingItem {
  category: string;
  topic: string;
  posts: string;
}

interface FeedPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  image?: string;
  type?: 'product' | 'shop' | 'promotion';
}

const XInspiredHomePage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid, active: activeNav === 'home' },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, iconSolid: BellIconSolid, count: 3 },
    { name: 'Messages', href: '/messages', icon: EnvelopeIcon, iconSolid: EnvelopeIconSolid, count: 1 },
    { name: 'Bookmarks', href: '/bookmarks', icon: BookmarkIcon, iconSolid: BookmarkIconSolid },
    { name: 'Profile', href: '/profile', icon: UserIcon, iconSolid: UserIconSolid },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIcon },
  ];

  const trendingTopics: TrendingItem[] = [
    { category: 'Shopping', topic: 'Black Friday Deals', posts: '127K' },
    { category: 'Technology', topic: 'iPhone 15', posts: '89K' },
    { category: 'Business', topic: 'OneSoko Marketplace', posts: '45K' },
    { category: 'Fashion', topic: 'Summer Collection', posts: '32K' },
    { category: 'Electronics', topic: 'Gaming Laptops', posts: '28K' },
  ];

  const feedPosts: FeedPost[] = [
    {
      id: '1',
      user: {
        name: 'OneSoko Official',
        username: 'onesoko',
        avatar: '/api/placeholder/40/40',
        verified: true
      },
      content: 'Exciting news! We just launched our new AI-powered product recommendation engine. Experience shopping like never before! 🚀 #Innovation #Shopping',
      timestamp: '2h',
      likes: 1234,
      retweets: 567,
      replies: 89,
      type: 'promotion'
    },
    {
      id: '2',
      user: {
        name: 'TechStore Kenya',
        username: 'techstore_ke',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Just restocked! Latest MacBook Pro models now available. Free delivery within Nairobi. Limited time offer - 10% off for first 50 customers! 💻✨',
      timestamp: '4h',
      likes: 892,
      retweets: 234,
      replies: 45,
      image: '/api/placeholder/500/300',
      type: 'product'
    },
    {
      id: '3',
      user: {
        name: 'Fashion Hub',
        username: 'fashionhub',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Summer collection drop! 🌞 From casual wear to formal attire, we have everything for the modern Kenyan. Shop now and get free styling consultation!',
      timestamp: '6h',
      likes: 567,
      retweets: 123,
      replies: 67,
      type: 'shop'
    },
    {
      id: '4',
      user: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Just had the best shopping experience on @onesoko! Found exactly what I was looking for at an amazing price. The delivery was super fast too! 👏',
      timestamp: '8h',
      likes: 234,
      retweets: 45,
      replies: 23
    },
    {
      id: '5',
      user: {
        name: 'Electronics World',
        username: 'electronicsworld',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Gaming setup of the week! 🎮 Complete setup available in our store. RTX 4080, 32GB RAM, 4K monitor. DM for pricing and availability.',
      timestamp: '12h',
      likes: 789,
      retweets: 156,
      replies: 34,
      image: '/api/placeholder/500/300',
      type: 'product'
    }
  ];

  const whoToFollow = [
    { name: 'Apple Store Kenya', username: 'apple_ke', followers: '2.4M' },
    { name: 'Safaricom', username: 'safaricom', followers: '1.8M' },
    { name: 'Jumia Kenya', username: 'jumia_ke', followers: '890K' },
  ];

  const featuredProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max - 256GB',
      price: 180000,
      originalPrice: 200000,
      image: '/api/placeholder/400/300',
      shop: {
        name: 'Apple Store Kenya',
        username: 'apple_ke',
        verified: true
      },
      rating: 4.8,
      reviewCount: 1240,
      category: 'Electronics',
      description: 'Latest iPhone with A17 Pro chip and titanium design. Perfect for photography and gaming.',
      discount: 10
    },
    {
      id: '2',
      name: 'Nike Air Max 270 - Black/White',
      price: 15000,
      originalPrice: 18000,
      image: '/api/placeholder/400/300',
      shop: {
        name: 'Nike Store',
        username: 'nike_ke',
        verified: true
      },
      rating: 4.6,
      reviewCount: 890,
      category: 'Fashion',
      description: 'Comfortable running shoes with Air Max technology. Perfect for daily wear and exercise.',
      discount: 17
    },
    {
      id: '3',
      name: 'MacBook Air M2 - 13 inch',
      price: 145000,
      image: '/api/placeholder/400/300',
      shop: {
        name: 'TechWorld Kenya',
        username: 'techworld_ke',
        verified: false
      },
      rating: 4.9,
      reviewCount: 567,
      category: 'Electronics',
      description: 'Ultra-thin laptop with M2 chip. Perfect for work, study, and creative projects.'
    },
    {
      id: '4',
      name: 'Samsung Galaxy S24 Ultra',
      price: 165000,
      originalPrice: 175000,
      image: '/api/placeholder/400/300',
      shop: {
        name: 'Samsung Store',
        username: 'samsung_ke',
        verified: true
      },
      rating: 4.7,
      reviewCount: 2100,
      category: 'Electronics',
      description: 'Flagship Android phone with S Pen and incredible camera system.',
      discount: 6
    }
  ];

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const IconComponent = item.active ? item.iconSolid : item.icon;
    
    return (
      <Link
        to={item.href}
        className={`x-nav-item ${item.active ? 'active' : ''}`}
        onClick={() => setActiveNav(item.name.toLowerCase())}
      >
        <IconComponent className="x-nav-icon" />
        <span className="text-xl">{item.name}</span>
        {item.count && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
            {item.count}
          </span>
        )}
      </Link>
    );
  };

  const FeedPostComponent: React.FC<{ post: FeedPost }> = ({ post }) => {
    return (
      <div className="x-feed-item">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="x-avatar"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <span className="font-bold text-white">{post.user.name}</span>
              {post.user.verified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="x-text-secondary">@{post.user.username}</span>
              <span className="x-text-secondary">·</span>
              <span className="x-text-secondary">{post.timestamp}</span>
            </div>
            
            <div className="mb-3">
              <p className="text-white whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {post.image && (
              <div className="mb-3">
                <img
                  src={post.image}
                  alt="Post content"
                  className="rounded-lg max-w-full h-auto border border-gray-700"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between max-w-md">
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span className="text-sm">{post.replies}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                <ArrowPathIcon className="w-5 h-5" />
                <span className="text-sm">{post.retweets}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                <HeartIcon className="w-5 h-5" />
                <span className="text-sm">{post.likes}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="x-theme min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`x-sidebar x-scrollbar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">OneSoko</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Post Button */}
        <button className="x-btn x-btn-primary x-btn-lg w-full mb-8">
          <ShoppingBagIcon className="w-5 h-5 mr-2" />
          Shop Now
        </button>

        {/* User Profile */}
        <div className="mt-auto">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 transition-colors cursor-pointer">
            <img
              src="/api/placeholder/40/40"
              alt="User"
              className="x-avatar"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">John Doe</p>
              <p className="text-gray-500 text-sm truncate">@johndoe</p>
            </div>
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="x-main-content">
        {/* Header */}
        <div className="x-header">
          <div className="x-header-content">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-white"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-white">Home</h1>
            </div>
            <SparklesIcon className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Compose Section */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex space-x-3">
            <img
              src="/api/placeholder/40/40"
              alt="User"
              className="x-avatar"
            />
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent text-xl placeholder-gray-500 resize-none outline-none text-white"
                placeholder="What's happening in your shop?"
                rows={3}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <button className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors">
                    <ShoppingBagIcon className="w-5 h-5" />
                  </button>
                </div>
                <button className="x-btn x-btn-primary">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="x-feed-container">
          {/* Featured Products */}
          <div className="border-b border-gray-700 p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FireIcon className="w-5 h-5 mr-2 text-red-500" />
              Trending Products
            </h3>
            <div className="space-y-0">
              {featuredProducts.map((product) => (
                <XProductCard
                  key={product.id}
                  product={product}
                  variant="feed"
                  showShopInfo={true}
                />
              ))}
            </div>
          </div>

          {/* Regular Feed Posts */}
          {feedPosts.map((post) => (
            <FeedPostComponent key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="x-right-panel x-scrollbar hidden xl:block">
        {/* Search */}
        <div className="x-search-container mb-6">
          <MagnifyingGlassIcon className="x-search-icon" />
          <input
            type="text"
            placeholder="Search OneSoko"
            className="x-search-input"
          />
        </div>

        {/* Trending */}
        <div className="x-trending-container mb-6">
          <div className="x-trending-header">
            <h2 className="text-xl font-bold text-white">What's happening</h2>
          </div>
          {trendingTopics.map((item, index) => (
            <div key={index} className="x-trending-item cursor-pointer">
              <p className="text-sm text-gray-500">{item.category} · Trending</p>
              <p className="font-bold text-white">{item.topic}</p>
              <p className="text-sm text-gray-500">{item.posts} posts</p>
            </div>
          ))}
        </div>

        {/* Who to Follow */}
        <div className="x-trending-container">
          <div className="x-trending-header">
            <h2 className="text-xl font-bold text-white">Who to follow</h2>
          </div>
          {whoToFollow.map((user, index) => (
            <div key={index} className="x-trending-item flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/api/placeholder/40/40"
                  alt={user.name}
                  className="x-avatar-sm"
                />
                <div>
                  <p className="font-bold text-white text-sm">{user.name}</p>
                  <p className="text-gray-500 text-sm">@{user.username}</p>
                </div>
              </div>
              <button className="x-btn x-btn-secondary text-sm px-4 py-1">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default XInspiredHomePage;
