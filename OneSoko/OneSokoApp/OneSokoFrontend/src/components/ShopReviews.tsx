import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

interface Review {
  reviewId: string;
  customer: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  status: string;
  created_at: string;
  helpful_votes_count: number;
  response?: {
    response_text: string;
    created_at: string;
  };
}

interface RatingSummary {
  total_reviews: number;
  average_rating: number;
  five_star_percentage: number;
  four_star_percentage: number;
  three_star_percentage: number;
  two_star_percentage: number;
  one_star_percentage: number;
}

interface ShopReviewsProps {
  shopId: string;
  shopName: string;
  isAuthenticated: boolean;
}

const ShopReviews: React.FC<ShopReviewsProps> = ({ 
  shopId, 
  shopName, 
  isAuthenticated
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    review_text: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchRatingSummary();
  }, [shopId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/shop-reviews/by_shop/?shop_id=${shopId}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRatingSummary = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/shop-rating-summaries/by_shop/?shop_id=${shopId}`);
      const data = await response.json();
      setRatingSummary(data);
    } catch (error) {
      console.error('Error fetching rating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please log in to submit a review');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8001/api/shop-reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shop: shopId,
          ...newReview
        })
      });

      if (response.ok) {
        setNewReview({ rating: 5, title: '', review_text: '' });
        setShowReviewForm(false);
        fetchReviews();
        fetchRatingSummary();
      } else {
        const error = await response.json();
        alert(error.message || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const toggleHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      alert('Please log in to vote on reviews');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8001/api/shop-reviews/${reviewId}/toggle_helpful/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_helpful: isHelpful })
      });

      if (response.ok) {
        fetchReviews(); // Refresh reviews to update helpful counts
      }
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Reviews for {shopName}</h2>
        
        {/* Rating Summary */}
        {ratingSummary && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold mr-2">{ratingSummary.average_rating?.toFixed(1)}</div>
              {renderStars(Math.round(ratingSummary.average_rating))}
              <span className="ml-2 text-gray-600">({ratingSummary.total_reviews} reviews)</span>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center">
                  <span className="w-12 text-sm">{stars} star</span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ 
                        width: `${ratingSummary[`${stars === 1 ? 'one' : stars === 2 ? 'two' : stars === 3 ? 'three' : stars === 4 ? 'four' : 'five'}_star_percentage` as keyof RatingSummary]}%` 
                      }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-gray-600">
                    {ratingSummary[`${stars === 1 ? 'one' : stars === 2 ? 'two' : stars === 3 ? 'three' : stars === 4 ? 'four' : 'five'}_star_percentage` as keyof RatingSummary]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write Review Button */}
        {isAuthenticated && (
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={submitReview} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Summarize your experience"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review</label>
              <textarea
                value={newReview.review_text}
                onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                rows={4}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell others about your experience with this shop"
                required
              ></textarea>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Submit Review
              </button>
              <button 
                type="button" 
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review this shop!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.reviewId} className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center mb-1">
                      {renderStars(review.rating)}
                      {review.is_verified_purchase && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold">{review.title}</h4>
                    <p className="text-sm text-gray-600">
                      By {review.customer} • {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>

                <p className="text-gray-800 mb-3">{review.review_text}</p>

                {/* Shop Owner Response */}
                {review.response && (
                  <div className="bg-blue-50 border-l-4 border-blue-200 p-3 mb-3">
                    <div className="flex items-center mb-1">
                      <MessageCircle className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-sm font-semibold text-blue-800">Shop Owner Response</span>
                    </div>
                    <p className="text-sm text-blue-700">{review.response.response_text}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formatDate(review.response.created_at)}
                    </p>
                  </div>
                )}

                {/* Helpful Votes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Was this helpful?</span>
                    <button
                      onClick={() => toggleHelpful(review.reviewId, true)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => toggleHelpful(review.reviewId, false)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                      disabled={!isAuthenticated}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>No</span>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {review.helpful_votes_count} people found this helpful
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopReviews;
