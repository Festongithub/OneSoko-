import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  ShareIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import CreatePost from '../../components/profile/CreatePost';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    profile: {
      avatar_url?: string;
      is_verified: boolean;
      verification_badge: {
        is_verified: boolean;
        color?: string;
      };
      display_name: string;
    };
  };
  content: string;
  image_url?: string;
  post_type: string;
  likes_count: number;
  reposts_count: number;
  replies_count: number;
  created_at: string;
  is_liked: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const FeedPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFeed();
    }
  }, [isAuthenticated]);

  const fetchFeed = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/feed/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        toast.error('Failed to load feed');
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!isAuthenticated) return;

    try {
      const post = posts.find(p => p.id === postId);
      const url = post?.is_liked
        ? `http://127.0.0.1:8000/api/posts/${postId}/unlike/`
        : `http://127.0.0.1:8000/api/posts/${postId}/like/`;
      
      const method = post?.is_liked ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to update like');
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted successfully');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Welcome to OneSoko Feed
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            Please log in to see your personalized feed and connect with others.
          </p>
          <Link 
            to="/login" 
            className="btn-primary"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Your Feed
            </h1>
            <button
              onClick={() => fetchFeed(true)}
              disabled={refreshing}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-secondary-600 dark:text-secondary-400">
            See what's happening with people you follow
          </p>
        </div>

        {/* Create Post */}
        <div className="mb-6">
          <CreatePost onPostCreated={handlePostCreated} />
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-secondary-800 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <Link to={`/profile/${post.user.username}`} className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {post.user.profile?.avatar_url ? (
                          <img 
                            src={post.user.profile.avatar_url} 
                            alt={post.user.profile.display_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/profile/${post.user.username}`}
                            className="font-semibold text-secondary-900 dark:text-white hover:underline"
                          >
                            {post.user.profile.display_name || post.user.username}
                          </Link>
                          
                          {post.user.profile.verification_badge.is_verified && (
                            <CheckBadgeIcon 
                              className={`w-5 h-5 ${
                                post.user.profile.verification_badge.color === 'blue' 
                                  ? 'text-blue-500' 
                                  : 'text-green-500'
                              }`}
                            />
                          )}
                          
                          <span className="text-secondary-500 dark:text-secondary-400">
                            @{post.user.username}
                          </span>
                          <span className="text-secondary-500 dark:text-secondary-400">·</span>
                          <span className="text-secondary-500 dark:text-secondary-400">
                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {/* Post Actions Menu */}
                        {(post.can_edit || post.can_delete) && (
                          <div className="relative">
                            <button className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 p-1">
                              <EllipsisHorizontalIcon className="w-5 h-5" />
                            </button>
                            {/* Add dropdown menu here if needed */}
                          </div>
                        )}
                      </div>

                      {/* Post Text */}
                      <div className="mb-3">
                        <p className="text-secondary-900 dark:text-white whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Image */}
                      {post.image_url && (
                        <div className="mb-3">
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="w-full rounded-lg max-h-96 object-cover"
                          />
                        </div>
                      )}

                      {/* Post Interactions */}
                      <div className="flex items-center justify-between pt-3 border-t border-secondary-100 dark:border-secondary-700">
                        <div className="flex items-center space-x-6">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center space-x-2 text-secondary-500 hover:text-red-500 dark:text-secondary-400 dark:hover:text-red-400 transition-colors group"
                          >
                            {post.is_liked ? (
                              <HeartIconSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5 group-hover:text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {post.likes_count}
                            </span>
                          </button>

                          {/* Reply Button */}
                          <button className="flex items-center space-x-2 text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors">
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              {post.replies_count}
                            </span>
                          </button>

                          {/* Share Button */}
                          <button className="flex items-center space-x-2 text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors">
                            <ShareIcon className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Delete Button (for own posts) */}
                        {post.can_delete && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-12 text-center">
              <div className="max-w-md mx-auto">
                <UserIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                  Your feed is empty
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                  Follow some users to see their posts in your feed, or create your first post to get started!
                </p>
                <div className="space-y-3">
                  <Link 
                    to="/discover" 
                    className="block w-full btn-primary text-center"
                  >
                    Discover People
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block w-full btn-secondary text-center"
                  >
                    Go to Profile
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
