import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Clock, Eye, EyeOff, Reply } from 'lucide-react';

interface Review {
  reviewId: string;
  customer: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  created_at: string;
  helpful_votes_count: number;
  shop_name: string;
  response?: {
    responseId: string;
    response_text: string;
    created_at: string;
  };
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'hidden'>('all');
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      let url = 'http://127.0.0.1:8000/api/shop-reviews/';
      
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/shop-reviews/${reviewId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchReviews(); // Refresh the list
      } else {
        alert('Error updating review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Error updating review status');
    }
  };

  const submitResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/shop-review-responses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          review: reviewId,
          response_text: responseText
        })
      });

      if (response.ok) {
        setShowResponseForm(null);
        setResponseText('');
        fetchReviews(); // Refresh to show the new response
      } else {
        const error = await response.json();
        alert(error.detail || 'Error submitting response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hidden: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status as keyof typeof badges]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Review Management
        </h1>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Reviews' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'hidden', label: 'Hidden' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews found for the selected filter.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.reviewId} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{review.customer}</span>
                      {review.is_verified_purchase && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateReviewStatus(review.reviewId, 'approved')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateReviewStatus(review.reviewId, 'rejected')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {review.status === 'approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.reviewId, 'hidden')}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      <EyeOff className="w-4 h-4 inline mr-1" />
                      Hide
                    </button>
                  )}
                  
                  {review.status === 'hidden' && (
                    <button
                      onClick={() => updateReviewStatus(review.reviewId, 'approved')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Show
                    </button>
                  )}
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.review_text}
              </p>

              {/* Shop Info */}
              <div className="text-sm text-gray-500 mb-4">
                Shop: {review.shop_name}
              </div>

              {/* Existing Response */}
              {review.response ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Your Response</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.response.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.response.response_text}
                  </p>
                </div>
              ) : (
                /* Response Form */
                <div>
                  {showResponseForm === review.reviewId ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium mb-3">Respond to this review</h5>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Write your response..."
                      />
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => submitResponse(review.reviewId)}
                          disabled={submitting}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Response'}
                        </button>
                        <button
                          onClick={() => {
                            setShowResponseForm(null);
                            setResponseText('');
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResponseForm(review.reviewId)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Respond to Review</span>
                    </button>
                  )}
                </div>
              )}

              {/* Review Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
                <span>{review.helpful_votes_count} people found this helpful</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(review.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
