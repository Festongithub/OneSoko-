import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface UserSearchResult {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  profile: {
    avatar_url?: string;
    bio?: string;
    followers_count: number;
    following_count: number;
    is_verified: boolean;
    verification_badge: {
      is_verified: boolean;
      color?: string;
    };
    display_name: string;
    is_following?: boolean;
  };
}

const DiscoverPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserSearchResult[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggested' | 'trending' | 'search'>('suggested');

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuggestedUsers();
      fetchTrendingUsers();
    }
  }, [isAuthenticated]);

  const fetchSuggestedUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/suggested/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const fetchTrendingUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/trending/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrendingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching trending users:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setActiveTab('suggested');
      return;
    }

    setLoading(true);
    setActiveTab('search');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/search/?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': isAuthenticated ? `Bearer ${localStorage.getItem('accessToken')}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (username: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }

    try {
      const user = [...suggestedUsers, ...trendingUsers, ...searchResults].find(u => u.username === username);
      const url = user?.profile.is_following 
        ? `http://127.0.0.1:8000/api/profile/${username}/unfollow/`
        : `http://127.0.0.1:8000/api/profile/${username}/follow/`;
      
      const method = user?.profile.is_following ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update follow status in all arrays
        const updateFollowStatus = (users: UserSearchResult[]) => 
          users.map(u => u.username === username 
            ? { ...u, profile: { ...u.profile, is_following: data.is_following } }
            : u
          );

        setSuggestedUsers(updateFollowStatus);
        setTrendingUsers(updateFollowStatus);
        setSearchResults(updateFollowStatus);
        
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast.error('Failed to update follow status');
    }
  };

  const UserCard: React.FC<{ user: UserSearchResult; showFollowButton?: boolean }> = ({ 
    user, 
    showFollowButton = true 
  }) => (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Link to={`/profile/${user.username}`} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              {user.profile.avatar_url ? (
                <img 
                  src={user.profile.avatar_url} 
                  alt={user.profile.display_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                to={`/profile/${user.username}`}
                className="font-semibold text-secondary-900 dark:text-white hover:underline"
              >
                {user.profile.display_name || user.username}
              </Link>
              
              {user.profile.verification_badge.is_verified && (
                <CheckBadgeIconSolid 
                  className={`w-5 h-5 ${
                    user.profile.verification_badge.color === 'blue' 
                      ? 'text-blue-500' 
                      : 'text-green-500'
                  }`}
                />
              )}
            </div>
            
            <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-2">
              @{user.username}
            </p>
            
            {user.profile.bio && (
              <p className="text-secondary-700 dark:text-secondary-300 text-sm mb-3 line-clamp-2">
                {user.profile.bio}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
              <span>
                <span className="font-medium text-secondary-900 dark:text-white">
                  {user.profile.followers_count}
                </span> followers
              </span>
              <span>
                <span className="font-medium text-secondary-900 dark:text-white">
                  {user.profile.following_count}
                </span> following
              </span>
            </div>
          </div>
        </div>

        {showFollowButton && isAuthenticated && (
          <button
            onClick={() => handleFollow(user.username)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              user.profile.is_following
                ? 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>{user.profile.is_following ? 'Following' : 'Follow'}</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
            Discover People
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Find and connect with interesting people on OneSoko
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search for people..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-800 dark:border-secondary-600 dark:text-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-secondary-200 dark:border-secondary-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('suggested')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggested'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Suggested for You
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Trending
            </button>
            {searchQuery && (
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Search Results
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'suggested' && (
                <div className="space-y-4">
                  {suggestedUsers.length > 0 ? (
                    suggestedUsers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <UserIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                        No suggestions yet
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        {isAuthenticated 
                          ? "We'll suggest people for you to follow based on your activity."
                          : "Log in to see personalized suggestions."
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'trending' && (
                <div className="space-y-4">
                  {trendingUsers.length > 0 ? (
                    trendingUsers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <UserIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                        No trending users
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        Check back later to see who's trending on OneSoko.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'search' && (
                <div className="space-y-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))
                  ) : searchQuery ? (
                    <div className="text-center py-12">
                      <MagnifyingGlassIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                        No results found
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        Try searching for different keywords or usernames.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              Join OneSoko to Connect
            </h3>
            <p className="text-primary-700 dark:text-primary-300 mb-4">
              Create an account to follow people, share posts, and build your network.
            </p>
            <div className="space-x-4">
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
              <Link to="/login" className="btn-secondary">
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
