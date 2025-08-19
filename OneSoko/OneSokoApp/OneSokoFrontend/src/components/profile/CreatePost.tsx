import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
  placeholder?: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ 
  onPostCreated, 
  placeholder = "What's happening?" 
}) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxLength = 280; // Similar to Twitter's character limit

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !imageFile) {
      toast.error('Please add some content or an image');
      return;
    }

    if (content.length > maxLength) {
      toast.error(`Post is too long. Maximum ${maxLength} characters allowed.`);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('post_type', 'text');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://127.0.0.1:8000/api/posts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setContent('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast.success('Post created successfully!');
        
        if (onPostCreated) {
          onPostCreated(newPost);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6 text-center">
        <p className="text-secondary-600 dark:text-secondary-400">
          Please log in to create posts
        </p>
      </div>
    );
  }

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex space-x-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              {user.profile?.avatar_url ? (
                <img 
                  src={user.profile.avatar_url} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full resize-none border-none focus:ring-0 text-xl placeholder-secondary-500 dark:placeholder-secondary-400 bg-transparent text-secondary-900 dark:text-white"
              style={{ outline: 'none' }}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Post Actions */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Image Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  disabled={loading}
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm">Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {/* Character Count */}
                <div className="flex items-center space-x-2">
                  <div className={`text-sm ${
                    isOverLimit 
                      ? 'text-red-500' 
                      : remainingChars <= 20 
                        ? 'text-orange-500' 
                        : 'text-secondary-500'
                  }`}>
                    {remainingChars}
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="relative w-5 h-5">
                    <svg className="w-5 h-5 transform -rotate-90">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-secondary-200 dark:text-secondary-600"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(content.length / maxLength, 1))}`}
                        className={`transition-all duration-300 ${
                          isOverLimit 
                            ? 'text-red-500' 
                            : remainingChars <= 20 
                              ? 'text-orange-500' 
                              : 'text-primary-500'
                        }`}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Post Button */}
              <button
                type="submit"
                disabled={loading || isOverLimit || (!content.trim() && !imageFile)}
                className="px-6 py-2 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
