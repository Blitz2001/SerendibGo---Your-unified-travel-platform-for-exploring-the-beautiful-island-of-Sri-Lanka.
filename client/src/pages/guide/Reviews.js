import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  Filter,
  Search,
  ThumbsUp,
  Reply,
  Flag
} from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    search: ''
  });
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    loadReviews();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {
        rating: filters.rating,
        search: filters.search,
        page: 1,
        limit: 10
      };
      const response = await guideService.getMyReviews(params);
      
      if (response.success) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleReply = async (reviewId) => {
    try {
      const replyText = prompt('Enter your reply to this review:');
      if (replyText && replyText.trim()) {
        const response = await guideService.replyToReview(reviewId, { reply: replyText });
        if (response.success) {
          toast.success('Reply posted successfully!');
          // Reload reviews to show the reply
          loadReviews();
        } else {
          toast.error('Failed to post reply');
        }
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const handleReport = async (reviewId) => {
    try {
      const reason = prompt('Please provide a reason for reporting this review:');
      if (reason && reason.trim()) {
        const response = await guideService.reportReview(reviewId, { reason: reason });
        if (response.success) {
          toast.success('Review reported successfully!');
        } else {
          toast.error('Failed to report review');
        }
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const response = await guideService.markReviewHelpful(reviewId);
      if (response.success) {
        toast.success('Thank you for your feedback!');
        // Reload reviews to update helpful count
        loadReviews();
      } else {
        toast.error('Failed to mark review as helpful');
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Failed to mark review as helpful');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
        <p className="text-gray-600">Manage and respond to customer reviews</p>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">{stats.averageRating}</span>
                <div className="flex">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">95%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Reply className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {Object.entries(stats.ratingDistribution).reverse().map(([rating, count]) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-8">{rating} star</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${(count / stats.totalReviews) * 100}%`
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">You don't have any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {review.tourTitle} • {formatDate(review.date)}
                  </p>
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  
                  {/* Review Actions */}
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                    <button
                      onClick={() => handleReply(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    <button
                      onClick={() => handleReport(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </div>

                  {/* Replies */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="ml-4 space-y-3">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {reply.isGuide ? 'You' : reply.user?.name}
                            </span>
                            <span className="text-sm text-gray-600">{formatDate(reply.date)}</span>
                            {reply.isGuide && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                Guide
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
