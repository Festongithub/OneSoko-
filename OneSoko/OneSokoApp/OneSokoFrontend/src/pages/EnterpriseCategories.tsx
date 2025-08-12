import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TagIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  StarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ChartPieIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../services/api';
import { Category, Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CategoryAnalytics from '../components/CategoryAnalytics';

interface CategoryStats {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  total_revenue?: number;
  total_orders?: number;
  growth_rate?: number;
  shops_count?: number;
  avg_rating?: number;
  last_updated?: string;
}

interface CategoryFilters {
  search: string;
  sortBy: 'name' | 'products' | 'revenue' | 'orders' | 'growth' | 'rating';
  sortOrder: 'asc' | 'desc';
  productCountRange: [number, number];
  revenueRange: [number, number];
  minRating: number;
  hasProducts: boolean | null;
}

const EnterpriseCategories: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Add category modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Advanced filtering state
  const [filters, setFilters] = useState<CategoryFilters>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    productCountRange: [0, 1000],
    revenueRange: [0, 100000],
    minRating: 0,
    hasProducts: null
  });

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalCategories: 0,
    totalProducts: 0,
    totalRevenue: 0,
    avgProductsPerCategory: 0,
    topPerformingCategory: null as CategoryStats | null,
    growthRate: 0
  });

  // Fetch all categories with enhanced data
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const result = await categoriesAPI.getAll();
      setCategories(result);
      
      // Calculate performance metrics
      const totalProducts = categoryStats.reduce((sum, cat) => sum + cat.product_count, 0);
      const totalRevenue = categoryStats.reduce((sum, cat) => sum + (cat.total_revenue || 0), 0);
      const topCategory = categoryStats.reduce((top, cat) => 
        (!top || (cat.total_revenue || 0) > (top.total_revenue || 0)) ? cat : top, 
        null as CategoryStats | null
      );

      setPerformanceMetrics({
        totalCategories: result.length,
        totalProducts,
        totalRevenue,
        avgProductsPerCategory: result.length > 0 ? totalProducts / result.length : 0,
        topPerformingCategory: topCategory,
        growthRate: 12.5 // This would come from API in real implementation
      });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryStats]);

  // Fetch enhanced category statistics
  const fetchCategoryStats = useCallback(async () => {
    try {
      const result = await categoriesAPI.getStats();
      // Enhance with mock enterprise data
      const enhancedStats = result.categories.map((cat: CategoryStats) => ({
        ...cat,
        total_revenue: Math.floor(Math.random() * 50000) + 1000,
        total_orders: Math.floor(Math.random() * 500) + 10,
        growth_rate: (Math.random() - 0.5) * 30, // -15% to +15%
        shops_count: Math.floor(Math.random() * 20) + 1,
        avg_rating: Math.random() * 2 + 3, // 3.0 to 5.0
        last_updated: new Date().toISOString()
      }));
      setCategoryStats(enhancedStats);
    } catch (error) {
      console.error('Failed to fetch category statistics:', error);
    }
  }, []);

  // Advanced filtering and sorting
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category => {
      const stats = categoryStats.find(s => s.id === category.id);
      if (!stats) return false;

      // Search filter
      if (filters.search.trim() && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Product count range
      if (stats.product_count < filters.productCountRange[0] || stats.product_count > filters.productCountRange[1]) {
        return false;
      }

      // Revenue range
      const revenue = stats.total_revenue || 0;
      if (revenue < filters.revenueRange[0] || revenue > filters.revenueRange[1]) {
        return false;
      }

      // Rating filter
      if ((stats.avg_rating || 0) < filters.minRating) {
        return false;
      }

      // Has products filter
      if (filters.hasProducts !== null) {
        if (filters.hasProducts && stats.product_count === 0) return false;
        if (!filters.hasProducts && stats.product_count > 0) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const statsA = categoryStats.find(s => s.id === a.id);
      const statsB = categoryStats.find(s => s.id === b.id);
      
      if (!statsA || !statsB) return 0;

      let valueA: any, valueB: any;

      switch (filters.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'products':
          valueA = statsA.product_count;
          valueB = statsB.product_count;
          break;
        case 'revenue':
          valueA = statsA.total_revenue || 0;
          valueB = statsB.total_revenue || 0;
          break;
        case 'orders':
          valueA = statsA.total_orders || 0;
          valueB = statsB.total_orders || 0;
          break;
        case 'growth':
          valueA = statsA.growth_rate || 0;
          valueB = statsB.growth_rate || 0;
          break;
        case 'rating':
          valueA = statsA.avg_rating || 0;
          valueB = statsB.avg_rating || 0;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [categories, categoryStats, filters]);

  // Load data on component mount
  useEffect(() => {
    fetchCategoryStats();
  }, [fetchCategoryStats]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getProductCount = (categoryId: number) => {
    const stat = categoryStats.find(s => s.id === categoryId);
    return stat ? stat.product_count : 0;
  };

  const getCategoryStats = (categoryId: number) => {
    return categoryStats.find(s => s.id === categoryId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowthRate = (rate: number) => {
    const isPositive = rate >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
        {Math.abs(rate).toFixed(1)}%
      </span>
    );
  };

  // Bulk actions
  const handleBulkAction = () => {
    if (selectedCategories.length === 0) return;
    
    switch (bulkAction) {
      case 'export':
        console.log('Exporting categories:', selectedCategories);
        break;
      case 'archive':
        console.log('Archiving categories:', selectedCategories);
        break;
      case 'delete':
        console.log('Deleting categories:', selectedCategories);
        break;
    }
    
    setSelectedCategories([]);
    setBulkAction('');
  };

  // Handle add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const categoryData = {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || '',
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };
      
      const newCategory = await categoriesAPI.create(categoryData);
      setCategories(prev => [...prev, newCategory]);
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowAddModal(false);
      
      // Refresh data
      fetchCategories();
      fetchCategoryStats();
    } catch (error) {
      console.error('Error creating category:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enterprise Dashboard Metrics Component
  const DashboardMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {performanceMetrics.totalCategories}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <TagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {performanceMetrics.totalProducts.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <ShoppingBagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(performanceMetrics.totalRevenue)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatGrowthRate(performanceMetrics.growthRate)}
            </p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Category Card for Grid View
  const CategoryCard = ({ category }: { category: Category }) => {
    const stats = getCategoryStats(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 
        hover:shadow-lg transition-all duration-200 hover:scale-105 
        relative overflow-hidden group cursor-pointer
        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
      `}>
        {/* Selection Checkbox */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCategories(prev => [...prev, category.id]);
              } else {
                setSelectedCategories(prev => prev.filter(id => id !== category.id));
              }
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Category Icon */}
        <div className="flex justify-end mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <TagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Category Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            /{category.slug}
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.product_count}
              </p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.total_revenue || 0)}
              </p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.total_orders || 0}
              </p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {formatGrowthRate(stats.growth_rate || 0)}
              </div>
              <p className="text-xs text-gray-500">Growth</p>
            </div>
          </div>
        )}

        {/* Rating */}
        {stats && stats.avg_rating && (
          <div className="flex items-center justify-center mb-4">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              {stats.avg_rating.toFixed(1)} rating
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <EyeIcon className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Enhanced List View Component
  const CategoryListItem = ({ category }: { category: Category }) => {
    const stats = getCategoryStats(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div className={`
        bg-white dark:bg-gray-800 rounded-lg border p-4 
        hover:shadow-md transition-all duration-200
        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCategories(prev => [...prev, category.id]);
                } else {
                  setSelectedCategories(prev => prev.filter(id => id !== category.id));
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                /{category.slug}
              </p>
            </div>
          </div>

          {stats && (
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.product_count}
                </p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.total_revenue || 0)}
                </p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {stats.total_orders || 0}
                </p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              
              <div className="text-center">
                {formatGrowthRate(stats.growth_rate || 0)}
                <p className="text-xs text-gray-500">Growth</p>
              </div>

              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  View
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <ChartPieIcon className="w-8 h-8 mr-3 text-blue-600" />
              Enterprise Category Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive category analytics and management dashboard
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Add Category
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics />

      {/* Advanced Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4 lg:mb-0">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-80"
              />
            </div>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="products">Sort by Products</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="orders">Sort by Orders</option>
              <option value="growth">Sort by Growth</option>
              <option value="rating">Sort by Rating</option>
            </select>

            {/* Sort Order */}
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ListBulletIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'analytics' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ChartBarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Product Count Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Count Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.productCountRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      productCountRange: [parseInt(e.target.value) || 0, prev.productCountRange[1]]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.productCountRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      productCountRange: [prev.productCountRange[0], parseInt(e.target.value) || 1000]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Revenue Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Revenue Range ($)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.revenueRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      revenueRange: [parseInt(e.target.value) || 0, prev.revenueRange[1]]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.revenueRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      revenueRange: [prev.revenueRange[0], parseInt(e.target.value) || 100000]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>

              {/* Has Products Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Status
                </label>
                <select
                  value={filters.hasProducts === null ? 'all' : filters.hasProducts ? 'with-products' : 'empty'}
                  onChange={(e) => {
                    let value: boolean | null = null;
                    if (e.target.value === 'with-products') value = true;
                    if (e.target.value === 'empty') value = false;
                    setFilters(prev => ({ ...prev, hasProducts: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="with-products">With Products</option>
                  <option value="empty">Empty Categories</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary and Bulk Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-0">
            Showing {filteredAndSortedCategories.length} of {categories.length} categories
            {selectedCategories.length > 0 && (
              <span className="ml-3 text-blue-600 dark:text-blue-400">
                ({selectedCategories.length} selected)
              </span>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedCategories.length > 0 && (
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">Bulk Actions</option>
                <option value="export">Export Selected</option>
                <option value="archive">Archive Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categories Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredAndSortedCategories.map(category => (
                <CategoryListItem key={category.id} category={category} />
              ))}
            </div>
          )}

          {viewMode === 'analytics' && (
            <CategoryAnalytics 
              categoryStats={categoryStats}
              timeRange={analyticsTimeRange}
              onTimeRangeChange={setAnalyticsTimeRange}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredAndSortedCategories.length === 0 && (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Clear Filters
          </button>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Category
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category description (optional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseCategories;
