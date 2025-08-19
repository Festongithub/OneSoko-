import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Reply, Eye, Filter, Search } from 'lucide-react';
import { useShopSession } from '../../hooks/useShopSession';

interface Review {
  reviewId: string;
  customer: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  created_at: string;
  helpful_votes_count: number;
  status: string;
  response?: {
    id: string;
    response_text: string;
    created_at: string;
    updated_at: string;
  };
}

interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  pending_responses: number;
  recent_reviews: number;
}

const ReviewManagementPage: React.FC = () => {
  const { userShop } = useShopSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, responded
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    if (userShop?.shopId) {
      fetchReviews();
      fetchSummary();
    }
  }, [userShop?.shopId, filter]);

  const fetchReviews = async () => {
    if (!userShop?.shopId) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/shop-reviews/by_shop/?shop_id=${userShop.shopId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let filteredReviews = data.results || data;
        
        // Apply filter
        if (filter === 'pending') {
          filteredReviews = filteredReviews.filter((review: Review) => !review.response);
        } else if (filter === 'responded') {
          filteredReviews = filteredReviews.filter((review: Review) => review.response);
        }
        
        setReviews(filteredReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!userShop?.shopId) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/shops-with-reviews/${userShop.shopId}/rating_breakdown/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Calculate additional summary stats
        const reviewsResponse = await fetch(`http://127.0.0.1:8000/api/shop-reviews/by_shop/?shop_id=${userShop.shopId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          const allReviews = reviewsData.results || reviewsData;
          const pendingResponses = allReviews.filter((review: Review) => !review.response).length;
          const recentReviews = allReviews.filter((review: Review) => {
            const reviewDate = new Date(review.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return reviewDate >= thirtyDaysAgo;
          }).length;
          
          setSummary({
            total_reviews: data.total_reviews,
            average_rating: data.average_rating,
            pending_responses: pendingResponses,
            recent_reviews: recentReviews
          });
        }
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    setSubmittingResponse(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/shop-review-responses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          review: selectedReview.reviewId,
          response_text: responseText
        })
      });

      if (response.ok) {
        setSelectedReview(null);
        setResponseText('');
        fetchReviews();
        fetchSummary();
        alert('Response submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Error submitting response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response');
    } finally {
      setSubmittingResponse(false);
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

  const filteredReviews = reviews.filter(review =>
    review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
          <p className="text-gray-600">Manage customer reviews for {userShop?.name}</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-blue-600">{summary.total_reviews}</div>
                <Star className="w-6 h-6 text-yellow-400 ml-2" />
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">{summary.average_rating.toFixed(1)}</div>
                <div className="ml-2">{renderStars(Math.round(summary.average_rating))}</div>
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-orange-600">{summary.pending_responses}</div>
                <MessageCircle className="w-6 h-6 text-orange-400 ml-2" />
              </div>
              <div className="text-sm text-gray-600">Pending Responses</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-purple-600">{summary.recent_reviews}</div>
                <Eye className="w-6 h-6 text-purple-400 ml-2" />
              </div>
              <div className="text-sm text-gray-600">Recent (30 days)</div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending Response</option>
                <option value="responded">Already Responded</option>
              </select>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {filter === 'pending' ? 'All reviews have been responded to!' : 'No reviews match your current filter.'}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.reviewId} className="bg-white rounded-lg p-6 shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900">{review.customer}</span>
                      {review.is_verified_purchase && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        review.response 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {review.response ? 'Responded' : 'Pending Response'}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {review.helpful_votes_count} helpful votes
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                )}
                
                <p className="text-gray-700 mb-4">{review.review_text}</p>

                {/* Existing Response */}
                {review.response && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Your Response</span>
                      <span className="text-sm text-blue-600">
                        {new Date(review.response.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-blue-800">{review.response.response_text}</p>
                  </div>
                )}

                {/* Response Button */}
                {!review.response && (
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Respond to Review</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Respond to Review</h3>
              
              {/* Review Being Responded To */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{selectedReview.customer}</span>
                    {renderStars(selectedReview.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedReview.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedReview.title && (
                  <h4 className="font-medium mb-2">{selectedReview.title}</h4>
                )}
                <p className="text-gray-700">{selectedReview.review_text}</p>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Thank you for your review. We appreciate your feedback..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedReview(null);
                      setResponseText('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitResponse}
                    disabled={!responseText.trim() || submittingResponse}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingResponse ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagementPage;
