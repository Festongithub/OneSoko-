import React, { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { userProfileAPI } from '../services/api';
import { UserProfile } from '../types';

interface ProfileCompletionStatus {
  completion_percentage: number;
  completed_fields: number;
  total_fields: number;
  missing_fields: string[];
}

interface UserStats {
  order_count: number;
  review_count: number;
  wishlist_count: number;
  shop_count: number;
  is_shopowner: boolean;
  profile_created: string;
  last_login: string;
}

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    address: ''
  });
  
  // Stats and completion
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userProfileAPI.getMyProfile();
      setProfile(data);
      setEditForm({
        bio: data.bio || '',
        address: data.address || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompletionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/userprofiles/completion_status/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCompletionStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch completion status:', err);
    }
  }, []);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('/api/userprofiles/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchCompletionStatus();
    fetchUserStats();
  }, [fetchProfile, fetchCompletionStatus, fetchUserStats]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      const updatedProfile = await userProfileAPI.updateProfile(editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      setError(null);
      const updatedProfile = await userProfileAPI.uploadAvatar(avatarFile);
      setProfile(updatedProfile);
      setAvatarFile(null);
      setSuccess('Avatar uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setError(null);
      const response = await fetch('/api/userprofiles/remove_avatar/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setSuccess('Avatar removed successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to remove avatar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowPathIcon className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>

              {profile && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile Avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <UserIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Avatar Upload */}
                      <div className="mt-3 space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer text-sm"
                        >
                          <CameraIcon className="w-4 h-4 mr-2" />
                          Upload
                        </label>
                        
                        {avatarFile && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleAvatarUpload}
                              disabled={uploadingAvatar}
                              className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setAvatarFile(null)}
                              className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              <XMarkIcon className="w-3 h-3 mr-1" />
                              Cancel
                            </button>
                          </div>
                        )}
                        
                        {profile.avatar && (
                          <button
                            onClick={handleRemoveAvatar}
                            className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            <TrashIcon className="w-3 h-3 mr-1" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {profile.first_name || 'User'} {profile.last_name || ''}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">@{profile.username || 'username'}</p>
                      <p className="text-gray-600 dark:text-gray-400">{profile.email || 'email@example.com'}</p>
                      {profile.is_shopowner && (
                        <span className="inline-flex items-center px-2 py-1 mt-2 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
                          Shop Owner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile.bio || 'No bio added yet.'}
                      </p>
                    )}
                  </div>

                  {/* Address Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your address..."
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile.address || 'No address added yet.'}
                      </p>
                    )}
                  </div>

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex items-center space-x-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            bio: profile.bio || '',
                            address: profile.address || ''
                          });
                        }}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Statistics */}
            {userStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  <ChartBarIcon className="w-5 h-5 inline mr-2" />
                  Activity Statistics
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <ShoppingBagIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userStats.order_count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Orders</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <StarIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {userStats.review_count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <HeartIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {userStats.wishlist_count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Wishlist</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <BuildingStorefrontIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {userStats.shop_count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shops</p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Profile Created</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(userStats.profile_created).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Last Login</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(userStats.last_login).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            {completionStatus && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <InformationCircleIcon className="w-5 h-5 inline mr-2" />
                  Profile Completion
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {completionStatus.completion_percentage}% Complete
                    </span>
                    <span className="text-sm text-gray-500">
                      {completionStatus.completed_fields}/{completionStatus.total_fields}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionStatus.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {completionStatus.missing_fields.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Missing Fields:
                    </p>
                    <ul className="space-y-1">
                      {completionStatus.missing_fields.map((field) => (
                        <li key={field} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <XMarkIcon className="w-3 h-3 text-red-500 mr-2" />
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                
                <label
                  htmlFor="avatar-upload-sidebar"
                  className="w-full flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Upload Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-upload-sidebar"
                />
                
                <button
                  onClick={fetchProfile}
                  className="w-full flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 