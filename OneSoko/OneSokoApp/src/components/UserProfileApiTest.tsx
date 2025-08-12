import React, { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { userProfileAPI } from '../services/api';
import { UserProfile } from '../types';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface CompletionStatus {
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

const UserProfileApiTest: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    bio: '',
    address: ''
  });
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Test 1: Get My Profile
  const testGetMyProfile = useCallback(async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.getMyProfile();
      setProfile(result);
      setEditForm({
        bio: result.bio || '',
        address: result.address || ''
      });
      addTestResult({
        success: true,
        message: 'Successfully fetched user profile',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Test 2: Update Profile
  const testUpdateProfile = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.updateProfile(editForm);
      setProfile(result);
      addTestResult({
        success: true,
        message: 'Successfully updated user profile',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Update Bio Only
  const testUpdateBio = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.updateBio(editForm.bio);
      setProfile(result);
      addTestResult({
        success: true,
        message: 'Successfully updated bio',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update bio',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Update Address Only
  const testUpdateAddress = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.updateAddress(editForm.address);
      setProfile(result);
      addTestResult({
        success: true,
        message: 'Successfully updated address',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to update address',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Upload Avatar
  const testUploadAvatar = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (!avatarFile) {
      addTestResult({
        success: false,
        message: 'No file selected',
        error: 'Please select an image file to upload'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.uploadAvatar(avatarFile);
      setProfile(result);
      setAvatarFile(null);
      addTestResult({
        success: true,
        message: 'Successfully uploaded avatar',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to upload avatar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 6: Remove Avatar
  const testRemoveAvatar = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.removeAvatar();
      setProfile(result);
      addTestResult({
        success: true,
        message: 'Successfully removed avatar',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to remove avatar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 7: Get Completion Status
  const testGetCompletionStatus = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.getCompletionStatus();
      setCompletionStatus(result);
      addTestResult({
        success: true,
        message: 'Successfully fetched completion status',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch completion status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 8: Get User Stats
  const testGetUserStats = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.getUserStats();
      setUserStats(result);
      addTestResult({
        success: true,
        message: 'Successfully fetched user stats',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to fetch user stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 9: Search Users
  const testSearchUsers = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    if (!searchUsername.trim()) {
      addTestResult({
        success: false,
        message: 'Username required',
        error: 'Please enter a username to search'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.searchUsers(searchUsername);
      setSearchResults(result);
      addTestResult({
        success: true,
        message: `Successfully searched for users with "${searchUsername}"`,
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 10: Toggle Shopowner Status
  const testToggleShopownerStatus = async () => {
    if (!isAuthenticated) {
      addTestResult({
        success: false,
        message: 'Authentication required',
        error: 'Please log in to access the API'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await userProfileAPI.toggleShopownerStatus();
      setProfile(result.profile);
      addTestResult({
        success: true,
        message: result.message || 'Successfully toggled shopowner status',
        data: result
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to toggle shopowner status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      testGetMyProfile();
    }
  }, [isAuthenticated, testGetMyProfile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Authentication Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please log in to access the UserProfile API testing features.
                </p>
                <div className="mt-3">
                  <a
                    href="/login"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            UserProfile API Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all UserProfile-related API endpoints and monitor results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            {/* Basic Profile Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Profile Tests
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={testGetMyProfile}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Get My Profile
                </button>

                <button
                  onClick={testGetCompletionStatus}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Get Completion Status
                </button>

                <button
                  onClick={testGetUserStats}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Get User Stats
                </button>
              </div>
            </div>

            {/* Profile Update Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profile Update Tests
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isAuthenticated}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    placeholder="Enter bio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isAuthenticated}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    placeholder="Enter address..."
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={testUpdateProfile}
                    disabled={loading || !isAuthenticated}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Update Profile
                  </button>

                  <button
                    onClick={testUpdateBio}
                    disabled={loading || !isAuthenticated}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Update Bio Only
                  </button>

                  <button
                    onClick={testUpdateAddress}
                    disabled={loading || !isAuthenticated}
                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Update Address Only
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Avatar Tests
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isAuthenticated}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={testUploadAvatar}
                    disabled={loading || !isAuthenticated || !avatarFile}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CameraIcon className="w-4 h-4 mr-2" />
                    Upload Avatar
                  </button>

                  <button
                    onClick={testRemoveAvatar}
                    disabled={loading || !isAuthenticated}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Remove Avatar
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Advanced Tests
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Username
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      disabled={!isAuthenticated}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="Enter username..."
                    />
                    <button
                      onClick={testSearchUsers}
                      disabled={loading || !isAuthenticated}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={testToggleShopownerStatus}
                  disabled={loading || !isAuthenticated}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                  Toggle Shopowner Status
                </button>
              </div>
            </div>
          </div>

          {/* Test Results and Data Display */}
          <div className="space-y-6">
            {/* Test Results */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test Results
                </h2>
                <button
                  onClick={clearTestResults}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No test results yet. Run some tests to see results here.
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start">
                        {result.success ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {result.message}
                          </p>
                          {result.error && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Error: {result.error}
                            </p>
                          )}
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                View Response Data
                              </summary>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Profile Data */}
            {profile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current Profile
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{profile.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Bio:</strong> {profile.bio || 'No bio'}</p>
                    <p><strong>Address:</strong> {profile.address || 'No address'}</p>
                    <p><strong>Shop Owner:</strong> {profile.is_shopowner ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Status */}
            {completionStatus && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Completion Status
                </h2>
                
                <div className="space-y-3">
                  <div>
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
              </div>
            )}

            {/* User Stats */}
            {userStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  User Statistics
                </h2>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Orders</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userStats.order_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Reviews</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userStats.review_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Wishlist Items</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userStats.wishlist_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Shops</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userStats.shop_count}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">Profile Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(userStats.profile_created).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Last Login</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(userStats.last_login).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Search Results
                </h2>
                
                <div className="space-y-3">
                  {searchResults.map((user, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileApiTest; 