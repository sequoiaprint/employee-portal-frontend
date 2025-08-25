import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PhotoUploader from '../Global/uploader';
import axios from 'axios';
import Cookies from 'js-cookie';

// XOR decryption function
const xorDecrypt = (encrypted, secretKey = '28032002') => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

const getAuthToken = () => {
  try {
    const encryptedToken = Cookies.get('authToken');
    if (!encryptedToken) {
      console.warn('No auth token found in cookies');
      return null;
    }

    const token = xorDecrypt(encryptedToken);
    if (!token) {
      console.warn('Failed to decrypt auth token');
      Cookies.remove('authToken', { path: '/' });
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const AddEditNews = ({ 
  editingNews = null, // Pass existing news data for editing
  onNewsAdded, 
  onNewsUpdated,
  onClose 
}) => {
  const { user } = useSelector((state) => state.auth);
  const { currentProfile } = useSelector((state) => state.profile);
  
  const isEditMode = !!editingNews;
  
  // Initialize form data based on mode
  const [formData, setFormData] = useState({
    title: editingNews?.title || '',
    body: editingNews?.body || '',
    imageUrls: editingNews?.urls ? editingNews.urls.split(',').filter(url => url.trim()) : [],
  });
  
  const [localLoading, setLocalLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Use a single ref to track submission state
  const submissionState = useRef({
    isSubmitting: false,
    lastSubmissionTime: 0,
    abortController: null
  });

  const fullName = currentProfile ? `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim() : user?.name || 'Anonymous';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUploadSuccess = (url) => {
    if (!formData.imageUrls.includes(url)) {
      if (formData.imageUrls.length < 4) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, url]
        }));
      } else {
        setErrors({ submit: 'Maximum of 4 images allowed' });
      }
    }
  };

  const removeImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Body is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions
    if (submissionState.current.isSubmitting) {
      console.log('Submission blocked - already processing');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set submission state
    submissionState.current.isSubmitting = true;
    submissionState.current.lastSubmissionTime = Date.now();
    setLocalLoading(true);

    // Cancel any existing request
    if (submissionState.current.abortController) {
      submissionState.current.abortController.abort();
    }
    
    // Create new abort controller
    submissionState.current.abortController = new AbortController();
    
    try {
      if (!currentProfile?.uid) {
        throw new Error('User profile not found - cannot create/update news');
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication found');
      }

      const newsData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        urls: formData.imageUrls.join(','),
        createdBy: currentProfile.uid
      };

      let response;
      
      if (isEditMode) {
        // Update existing news
        response = await axios.put(
          `https://internalApi.sequoia-print.com/api/news/${editingNews.id}`,
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new news
        response = await axios.post(
          'https://internalApi.sequoia-print.com/api/news',
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      const resultNews = response.data?.data || response.data;
      
      // Reset form only for add mode
      if (!isEditMode) {
        setFormData({
          title: '',
          body: '',
          imageUrls: []
        });
      }
      
      // Call appropriate callbacks
      if (isEditMode && onNewsUpdated) {
        onNewsUpdated(resultNews);
      } else if (!isEditMode && onNewsAdded) {
        onNewsAdded(resultNews);
      }
      
      if (onClose) onClose();
      
    } catch (error) {
      // Ignore aborted requests
      if (axios.isCancel(error)) {
        return;
      }
      
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} news:`, error);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} news. Please try again.`;
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid'];
          cookiesToClear.forEach(cookie => {
            Cookies.remove(cookie, { path: '/' });
          });
          localStorage.removeItem('authToken');
          errorMessage = 'Session expired, please login again';
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message === 'No authentication found') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      // Reset submission state
      submissionState.current.isSubmitting = false;
      submissionState.current.abortController = null;
      setLocalLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (submissionState.current.abortController) {
        submissionState.current.abortController.abort();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit News' : 'Add News'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={localLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            {isEditMode 
              ? 'Update your company news and announcements' 
              : 'Share the latest company updates and announcements'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Author Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {fullName.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {isEditMode ? 'Updating as' : 'Publishing as'}
                </p>
                <p className="text-sm text-gray-600">{fullName}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter news title..."
              maxLength={255}
              disabled={localLoading}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${
                errors.body ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Write your news content here..."
              disabled={localLoading}
            />
            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional - Max 4)
            </label>
            
            {/* Photo Uploader */}
            {formData.imageUrls.length < 4 && (
              <PhotoUploader
                onUploadSuccess={handleImageUploadSuccess}
                onUploadError={(error) => setErrors({ submit: error })}
                accept="image/*"
                disabled={localLoading}
              >
                <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                  localLoading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-blue-500'
                }`}>
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm">Click to upload or drag and drop</p>
                  <p className="text-xs">PNG, JPG, GIF up to 2MB</p>
                </div>
              </PhotoUploader>
            )}

            {/* Preview uploaded images */}
            {formData.imageUrls.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {isEditMode ? 'Current Images:' : 'Uploaded Images:'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`${isEditMode ? 'Current' : 'Uploaded'} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => !localLoading && removeImageUrl(index)}
                        className={`absolute top-2 right-2 rounded-full p-1 ${
                          localLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                        disabled={localLoading}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={localLoading}
              className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-colors ${
                localLoading ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={localLoading}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all ${
                localLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              {localLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Publishing...'}
                </div>
              ) : (
                isEditMode ? 'Update News' : 'Publish News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditNews;