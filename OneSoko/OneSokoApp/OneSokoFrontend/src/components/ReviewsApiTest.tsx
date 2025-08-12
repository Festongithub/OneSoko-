import React, { useState, useCallback } from 'react';
import { 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  HandThumbUpIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { reviewsAPI } from '../services/api';
import { Review } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

const ReviewsApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test Functions
  const testGetAllReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsAPI.getAll();
      setReviews(data);
      addTestResult({
        success: true,
        message: `Successfully fetched ${data.length} reviews`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch all reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testGetMyReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsAPI.getMyReviews();
      addTestResult({
        success: true,
        message: `Successfully fetched ${data.length} of your reviews`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch your reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testGetReviewsByProduct = useCallback(async () => {
    setLoading(true);
    try {
      // Use the first product ID from reviews if available, otherwise use a test ID
      const productId = reviews.length > 0 && reviews[0].product?.productId ? reviews[0].product.productId : 'test-product-id';
      const data = await reviewsAPI.getByProduct(productId);
      addTestResult({
        success: true,
        message: `Successfully fetched ${data.length} reviews for product ${productId}`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch reviews by product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [reviews]);

  const testGetReviewsByShop = useCallback(async () => {
    setLoading(true);
    try {
      // Use the first shop ID from reviews if available, otherwise use a test ID
      const shopId = reviews.length > 0 && reviews[0].shop?.shopId ? reviews[0].shop.shopId : 'test-shop-id';
      const data = await reviewsAPI.getByShop(shopId);
      addTestResult({
        success: true,
        message: `Successfully fetched ${data.length} reviews for shop ${shopId}`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch reviews by shop',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [reviews]);

  const testGetReviewStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsAPI.getStats({});
      setStats(data);
      addTestResult({
        success: true,
        message: 'Successfully fetched review statistics',
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch review statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const testCreateReview = useCallback(async () => {
    setLoading(true);
    try {
      const reviewData = {
        product: 'test-product-id',
        rating: 5,
        comment: 'This is a test review created via API test'
      };
      const data = await reviewsAPI.create(reviewData);
      addTestResult({
        success: true,
        message: 'Successfully created test review',
        data: data
      });
      // Refresh reviews list
      testGetAllReviews();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to create test review',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [testGetAllReviews]);

  const testUpdateReview = useCallback(async () => {
    if (reviews.length === 0) {
      addTestResult({
        success: false,
        message: 'No reviews available to update',
        error: 'Please create a review first'
      });
      return;
    }

    setLoading(true);
    try {
      const reviewToUpdate = reviews[0];
      const updateData = {
        rating: 4,
        comment: 'This review was updated via API test'
      };
      const data = await reviewsAPI.update(reviewToUpdate.id, updateData);
      addTestResult({
        success: true,
        message: `Successfully updated review ${reviewToUpdate.id}`,
        data: data
      });
      // Refresh reviews list
      testGetAllReviews();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update review',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [reviews, testGetAllReviews]);

  const testMarkHelpful = useCallback(async () => {
    if (reviews.length === 0) {
      addTestResult({
        success: false,
        message: 'No reviews available to mark as helpful',
        error: 'Please create a review first'
      });
      return;
    }

    setLoading(true);
    try {
      const reviewToMark = reviews[0];
      const data = await reviewsAPI.markHelpful(reviewToMark.id);
      addTestResult({
        success: true,
        message: `Successfully marked review ${reviewToMark.id} as helpful`,
        data: data
      });
      // Refresh reviews list
      testGetAllReviews();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to mark review as helpful',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [reviews, testGetAllReviews]);

  const testDeleteReview = useCallback(async () => {
    if (reviews.length === 0) {
      addTestResult({
        success: false,
        message: 'No reviews available to delete',
        error: 'Please create a review first'
      });
      return;
    }

    setLoading(true);
    try {
      const reviewToDelete = reviews[0];
      await reviewsAPI.delete(reviewToDelete.id);
      addTestResult({
        success: true,
        message: `Successfully deleted review ${reviewToDelete.id}`
      });
      // Refresh reviews list
      testGetAllReviews();
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to delete review',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [reviews, testGetAllReviews]);

  const testPendingModeration = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsAPI.getPendingModeration();
      addTestResult({
        success: true,
        message: `Successfully fetched ${data.length} reviews pending moderation`,
        data: data
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch pending moderation reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reviews API Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all Reviews API endpoints
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testGetAllReviews}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Get All Reviews
            </button>
            <button
              onClick={testGetMyReviews}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Get My Reviews
            </button>
            <button
              onClick={testGetReviewsByProduct}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Get Reviews by Product
            </button>
            <button
              onClick={testGetReviewsByShop}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Get Reviews by Shop
            </button>
            <button
              onClick={testGetReviewStats}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              Get Review Stats
            </button>
            <button
              onClick={testCreateReview}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              Create Test Review
            </button>
            <button
              onClick={testUpdateReview}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Update Review
            </button>
            <button
              onClick={testMarkHelpful}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              Mark Helpful
            </button>
            <button
              onClick={testDeleteReview}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete Review
            </button>
            <button
              onClick={testPendingModeration}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Pending Moderation
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          )}
        </div>

        {/* Statistics Display */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_reviews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.average_rating}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(stats.rating_distribution as Record<number, number>).reduce((a: number, b: number) => a + b, 0).toString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Ratings</div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Display */}
        {reviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Reviews ({reviews.length})
            </h3>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {review.first_name} {review.last_name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</p>
                  )}
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Type: {review.review_type}</span>
                    <span>Helpful: {review.helpful_count}</span>
                    <span>Status: {review.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Results ({testResults.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.message}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.error}</p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          View Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsApiTest; 