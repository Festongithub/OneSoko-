import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

interface Review {
  id: string;
  customer: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  created_at: string;
  helpful_votes_count: number;
  response?: {
    response_text: string;
    created_at: string;
  };
}

interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    '5_stars': number;
    '4_stars': number;
    '3_stars': number;
    '2_stars': number;
    '1_star': number;
  };
}

interface ShopReviewsProps {
  shopId: string;
}

const ShopReviews: React.FC<ShopReviewsProps> = ({ shopId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    review_text: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [shopId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/shop-reviews/by_shop/?shop_id=${shopId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/shops-with-reviews/${shopId}/rating_breakdown/`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/shop-reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newReview,
          shop: shopId
        })
      });

      if (response.ok) {
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', review_text: '' });
        fetchReviews();
        fetchSummary();
      } else {
        const error = await response.json();
        alert(error.detail || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const toggleHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/shop-reviews/${reviewId}/toggle_helpful/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_helpful: isHelpful })
      });

      if (response.ok) {
        fetchReviews(); // Refresh to get updated helpful counts
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number, percentage: number) => (
    <div className="flex items-center space-x-2 text-sm">
      <span className="w-12">{stars} star</span>
      <div className="flex-1 h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-yellow-400 rounded"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right">{percentage}%</span>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{summary.average_rating.toFixed(1)}</div>
              {renderStars(Math.round(summary.average_rating))}
              <div className="text-sm text-gray-600 mt-1">
                Based on {summary.total_reviews} reviews
              </div>
            </div>
            <div className="space-y-2">
              {renderRatingBar(5, summary.rating_distribution['5_stars'])}
              {renderRatingBar(4, summary.rating_distribution['4_stars'])}
              {renderRatingBar(3, summary.rating_distribution['3_stars'])}
              {renderRatingBar(2, summary.rating_distribution['2_stars'])}
              {renderRatingBar(1, summary.rating_distribution['1_star'])}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      <div className="text-center">
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Summary of your experience"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review</label>
              <textarea
                value={newReview.review_text}
                onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell others about your experience with this shop"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to write a review!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.customer}</span>
                    {review.is_verified_purchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {review.title && (
                <h5 className="font-medium mb-2">{review.title}</h5>
              )}
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.review_text}
              </p>

              {/* Shop Owner Response */}
              {review.response && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Shop Owner Response</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.response.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.response.response_text}
                  </p>
                </div>
              )}

              {/* Helpful Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleHelpful(review.id, true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful_votes_count})</span>
                </button>
                <button
                  onClick={() => toggleHelpful(review.id, false)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Not Helpful</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopReviews;
