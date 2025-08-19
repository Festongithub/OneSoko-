import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
  CameraIcon,
  PencilIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon as CheckBadgeIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EditProfileModal from '../../components/profile/EditProfileModal';
import CreatePost from '../../components/profile/CreatePost';

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    date_joined: string;
  };
  bio: string;
  avatar_url?: string;
  cover_photo_url?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  date_of_birth?: string;
  location?: string;
  is_shopowner: boolean;
  is_public: boolean;
  is_email_verified: boolean;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  verification_type: string;
  verification_badge: {
    is_verified: boolean;
    type?: string;
    color?: string;
  };
  full_name: string;
  display_name: string;
  profile_completion_percentage: number;
  is_following?: boolean;
  shop?: any;
}

interface Post {
  id: number;
  user: {
    username: string;
    profile: UserProfile;
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
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Use current user's username if no username provided
  const profileUsername = username || currentUser?.username;

  useEffect(() => {
    if (profileUsername) {
      fetchProfile();
      fetchPosts();
      fetchStats();
      setIsOwnProfile(!username || username === currentUser?.username);
    }
  }, [profileUsername, currentUser]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profileUsername}/`, {
        headers: {
          'Authorization': isAuthenticated ? `Bearer ${localStorage.getItem('accessToken')}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        toast.error('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profileUsername}/posts/`, {
        headers: {
          'Authorization': isAuthenticated ? `Bearer ${localStorage.getItem('accessToken')}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profileUsername}/stats/`, {
        headers: {
          'Authorization': isAuthenticated ? `Bearer ${localStorage.getItem('accessToken')}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profileUsername}/followers/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || []);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profileUsername}/following/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !profile) return;

    try {
      const url = profile.is_following 
        ? `http://127.0.0.1:8000/api/profile/${profileUsername}/unfollow/`
        : `http://127.0.0.1:8000/api/profile/${profileUsername}/follow/`;
      
      const method = profile.is_following ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, is_following: data.is_following } : null);
        toast.success(data.message);
        fetchProfile(); // Refresh to get updated follower count
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
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
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Profile Not Found</h1>
          <p className="text-secondary-600 dark:text-secondary-400">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-primary-500 to-primary-700">
        {profile.cover_photo_url ? (
          <img
            src={profile.cover_photo_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-700" />
        )}
        
        {/* Edit Cover Button - Only for own profile */}
        {isOwnProfile && (
          <button className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
            <CameraIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-secondary-800 overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* Edit Avatar Button - Only for own profile */}
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700">
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {profile.full_name || profile.user.username}
                </h1>
                {profile.verification_badge.is_verified && (
                  <CheckBadgeIconSolid 
                    className={`w-6 h-6 ${
                      profile.verification_badge.color === 'blue' ? 'text-blue-500' : 'text-green-500'
                    }`}
                  />
                )}
              </div>
              
              <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                @{profile.user.username}
              </p>

              {profile.bio && (
                <p className="text-secondary-700 dark:text-secondary-300 mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Profile Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined {format(new Date(profile.user.date_joined), 'MMMM yyyy')}</span>
                </div>

                {profile.is_shopowner && (
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                    Shop Owner
                  </span>
                )}
              </div>

              {/* Follower Stats */}
              <div className="flex items-center space-x-6 mb-4">
                <button
                  onClick={() => {
                    setActiveTab('following');
                    fetchFollowing();
                  }}
                  className="hover:underline"
                >
                  <span className="font-bold text-secondary-900 dark:text-white">
                    {profile.following_count}
                  </span>
                  <span className="text-secondary-600 dark:text-secondary-400 ml-1">
                    Following
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('followers');
                    fetchFollowers();
                  }}
                  className="hover:underline"
                >
                  <span className="font-bold text-secondary-900 dark:text-white">
                    {profile.followers_count}
                  </span>
                  <span className="text-secondary-600 dark:text-secondary-400 ml-1">
                    Followers
                  </span>
                </button>

                {stats.posts_count !== undefined && (
                  <div>
                    <span className="font-bold text-secondary-900 dark:text-white">
                      {stats.posts_count}
                    </span>
                    <span className="text-secondary-600 dark:text-secondary-400 ml-1">
                      Posts
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isOwnProfile ? (
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  {isAuthenticated && (
                    <button
                      onClick={handleFollow}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        profile.is_following
                          ? 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {profile.is_following ? (
                        <>
                          <UserMinusIcon className="w-4 h-4" />
                          <span>Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button className="btn-secondary">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </button>
                  
                  <button className="btn-secondary">
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-secondary-200 dark:border-secondary-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => {
                setActiveTab('followers');
                fetchFollowers();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'followers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => {
                setActiveTab('following');
                fetchFollowing();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Following
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {/* Create Post for own profile */}
              {isOwnProfile && (
                <div className="mb-6">
                  <CreatePost 
                    onPostCreated={handlePostCreated}
                    placeholder="Share what's on your mind..."
                  />
                </div>
              )}

              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-secondary-900 dark:text-white">
                            {profile.display_name}
                          </span>
                          <span className="text-secondary-500 dark:text-secondary-400">
                            @{profile.user.username}
                          </span>
                          <span className="text-secondary-500 dark:text-secondary-400">·</span>
                          <span className="text-secondary-500 dark:text-secondary-400">
                            {format(new Date(post.created_at), 'MMM d')}
                          </span>
                        </div>
                        
                        <p className="text-secondary-900 dark:text-white mb-3">
                          {post.content}
                        </p>
                        
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="w-full rounded-lg mb-3 max-h-96 object-cover"
                          />
                        )}
                        
                        <div className="flex items-center space-x-6 text-secondary-500 dark:text-secondary-400">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center space-x-2 hover:text-red-500"
                          >
                            {post.is_liked ? (
                              <HeartIconSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5" />
                            )}
                            <span>{post.likes_count}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 hover:text-primary-500">
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            <span>{post.replies_count}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 hover:text-primary-500">
                            <ShareIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.map((follower) => (
                <div key={follower.id} className="bg-white dark:bg-secondary-800 rounded-lg shadow p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {follower.profile?.avatar_url ? (
                        <img src={follower.profile.avatar_url} alt={follower.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        {follower.first_name && follower.last_name 
                          ? `${follower.first_name} ${follower.last_name}`
                          : follower.username
                        }
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                        @{follower.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.map((followedUser) => (
                <div key={followedUser.id} className="bg-white dark:bg-secondary-800 rounded-lg shadow p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {followedUser.profile?.avatar_url ? (
                        <img src={followedUser.profile.avatar_url} alt={followedUser.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        {followedUser.first_name && followedUser.last_name 
                          ? `${followedUser.first_name} ${followedUser.last_name}`
                          : followedUser.username
                        }
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                        @{followedUser.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;
