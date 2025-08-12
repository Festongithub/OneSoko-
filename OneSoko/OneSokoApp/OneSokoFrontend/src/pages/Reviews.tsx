import React, { useState, useEffect, useCallback } from 'react';
import { 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  HandThumbUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { reviewsAPI } from '../services/api';
import { Review } from '../types';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my-reviews'>('all');
  const [filters, setFilters] = useState({
    review_type: '' as 'product' | 'shop' | '',
    rating: 0,
    sort_by: 'created_at' as 'created_at' | 'rating' | 'helpful_count',
    sort_order: 'desc' as 'asc' | 'desc'
  });

  // Form state
  const [formData, setFormData] = useState({
    product: '',
    shop: '',
    rating: 5,
    comment: ''
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.review_type) params.review_type = filters.review_type;
      if (filters.rating > 0) params.rating = filters.rating;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const data = await reviewsAPI.getAll(params);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewsAPI.getMyReviews();
      setMyReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchReviews();
    } else {
      fetchMyReviews();
    }
  }, [activeTab, fetchReviews, fetchMyReviews]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reviewData: any = {
        rating: formData.rating,
        comment: formData.comment
      };

      if (formData.product) {
        reviewData.product = formData.product;
      } else if (formData.shop) {
        reviewData.shop = formData.shop;
      }

      await reviewsAPI.create(reviewData);
      
      // Reset form and refresh
      setFormData({ product: '', shop: '', rating: 5, comment: '' });
      setShowCreateForm(false);
      fetchReviews();
      fetchMyReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setLoading(true);
    setError(null);

    try {
      await reviewsAPI.update(editingReview.id, {
        rating: formData.rating,
        comment: formData.comment
      });
      
      // Reset form and refresh
      setFormData({ product: '', shop: '', rating: 5, comment: '' });
      setEditingReview(null);
      fetchReviews();
      fetchMyReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setLoading(true);
    setError(null);

    try {
      await reviewsAPI.delete(reviewId);
      fetchReviews();
      fetchMyReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      fetchReviews();
      fetchMyReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark review as helpful');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderReviewCard = (review: Review) => (
    <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {review.first_name} {review.last_name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
            {review.status !== 'approved' && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {review.status}
              </span>
            )}
          </div>
          
          <div className="flex items-center mb-2">
            {renderStars(review.rating)}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {review.rating}/5
            </span>
          </div>

          <div className="mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Review for: {review.reviewed_item_name}
            </span>
          </div>

          {review.comment && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <HandThumbUpIcon className="h-4 w-4" />
                <span>Helpful ({review.helpful_count})</span>
              </button>
            </div>

            {activeTab === 'my-reviews' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingReview(review);
                    setFormData({
                      product: review.product?.productId || '',
                      shop: review.shop?.shopId || '',
                      rating: review.rating,
                      comment: review.comment
                    });
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Read and write reviews for products and shops
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                All Reviews
              </button>
              <button
                onClick={() => setActiveTab('my-reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-reviews'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Reviews
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            
            <select
              value={filters.review_type}
              onChange={(e) => setFilters(prev => ({ ...prev, review_type: e.target.value as 'product' | 'shop' | '' }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="product">Product Reviews</option>
              <option value="shop">Shop Reviews</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={2}>2+ Stars</option>
              <option value={1}>1+ Stars</option>
            </select>

            <select
              value={filters.sort_by}
              onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as 'created_at' | 'rating' | 'helpful_count' }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="created_at">Date</option>
              <option value="rating">Rating</option>
              <option value="helpful_count">Helpful</option>
            </select>

            <button
              onClick={() => setFilters(prev => ({ ...prev, sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc' }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {filters.sort_order === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Create Review Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Write a Review
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Reviews List */}
        {!loading && (
          <div className="space-y-4">
            {(activeTab === 'all' ? reviews : myReviews).length > 0 ? (
              (activeTab === 'all' ? reviews : myReviews).map(renderReviewCard)
            ) : (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reviews</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === 'all' ? 'No reviews found for the selected criteria.' : 'You haven\'t written any reviews yet.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Review Modal */}
        {(showCreateForm || editingReview) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingReview ? 'Edit Review' : 'Write a Review'}
                </h3>
                
                <form onSubmit={editingReview ? handleUpdateReview : handleCreateReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Review Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reviewType"
                          value="product"
                          checked={!!formData.product}
                          onChange={() => setFormData(prev => ({ ...prev, product: '', shop: '' }))}
                          className="mr-2"
                        />
                        Product
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reviewType"
                          value="shop"
                          checked={!!formData.shop}
                          onChange={() => setFormData(prev => ({ ...prev, product: '', shop: '' }))}
                          className="mr-2"
                        />
                        Shop
                      </label>
                    </div>
                  </div>

                  {formData.product ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product ID
                      </label>
                      <input
                        type="text"
                        value={formData.product}
                        onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter product ID"
                        required
                      />
                    </div>
                  ) : formData.shop ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shop ID
                      </label>
                      <input
                        type="text"
                        value={formData.shop}
                        onChange={(e) => setFormData(prev => ({ ...prev, shop: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter shop ID"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Review Type
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please select whether you want to review a product or shop
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <StarIcon
                            className={`h-6 w-6 ${
                              star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comment
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Share your experience..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingReview(null);
                        setFormData({ product: '', shop: '', rating: 5, comment: '' });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || (!formData.product && !formData.shop)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : editingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 