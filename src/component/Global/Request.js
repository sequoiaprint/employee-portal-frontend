import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, Upload, Send } from 'lucide-react';
import Cookies from 'js-cookie';
import PhotoUploader from './uploader';

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
  const encryptedToken = Cookies.get('authToken');
  if (!encryptedToken) {
    return null;
  }

  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }

  return token;
};

const getUserUid = () => {
  const encryptedUserUid = Cookies.get('userUid');
  if (!encryptedUserUid) {
    return null;
  }

  const userUid = encryptedUserUid;
  if (!userUid) {
    console.warn('Failed to decrypt user UID');
    return null;
  }

  return userUid;
};

const Request = ({ task, onClose, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    
    try {
      const options = { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Date formatting error:', err);
      return "Invalid date";
    }
  };

  // Get status color and label
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      'urgent': { color: 'bg-red-100 text-red-800', label: 'Urgent' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
    };
    return statusMap[status] || statusMap['pending'];
  };

  const statusDisplay = getStatusDisplay(task.status);

  // Handle image upload success
  const handleUploadSuccess = (imageUrl) => {
    setUploadedImages(prev => [...prev, imageUrl]);
    setError(null);
  };

  // Handle image upload error
  const handleUploadError = (errorMessage) => {
    setError(`Image upload failed: ${errorMessage}`);
  };

  // Remove uploaded image
  const removeImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle request submission
  const handleRequestComplete = async () => {
    if (!comment.trim()) {
      setError('Please add a comment describing your work');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userUid = getUserUid();
      const token = getAuthToken();

      if (!userUid || !token) {
        throw new Error('Authentication credentials not found');
      }

      // Prepare the update data
      const updateData = {
        status: 'pending', // Change from in-progress to pending
        comment: comment.trim(),
        urls: uploadedImages.length > 0 ? uploadedImages : undefined,
        // requestedAt: new Date().toISOString()
      };

      console.log('Submitting request:', updateData);

      const response = await fetch(`http://localhost:9000/api/assignment/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Request submitted successfully:', result);

      setSuccess('Request to complete submitted successfully!');
      
      // Notify parent component of the update
      if (onUpdate) {
        onUpdate({
          ...task,
          status: 'pending',
          comment: comment.trim()
        });
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error submitting request:', err);
      setError(`Failed to submit request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center  z-[60] p-4 pt-[25%]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-6rem)] border-orange-600 border-2 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Task Request</h2>
            <p className="text-gray-600">Submit your completion request</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Task Details */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{task.text}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                  {statusDisplay.label}
                </span>
              </div>

              {/* Project Info */}
              {task.projectName && (
                <div className="mb-3">
                  <p className="text-sm text-blue-600 font-medium">
                    📁 {task.projectName}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2 text-green-500" />
                  <div>
                    <span className="font-medium">Start:</span>
                    <br />
                    {formatDate(task.startDate)}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2 text-red-500" />
                  <div>
                    <span className="font-medium">Due:</span>
                    <br />
                    {formatDate(task.endDate)}
                  </div>
                </div>
              </div>

              {/* Existing Comments */}
              {task.comment && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Original Instructions:</p>
                  <p className="text-sm text-gray-600 italic bg-white p-3 rounded border-l-4 border-blue-400">
                    "{task.comment}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-pulse mr-3">✅</div>
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Comment Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText size={16} className="inline mr-2" />
                  Work Description *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the work you've completed, any challenges faced, and any additional notes..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  rows={4}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be specific about what you accomplished and any important details.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Upload size={16} className="inline mr-2" />
                  Attachments (Optional)
                </label>
                
                <PhotoUploader
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  accept="image/*"
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-1">Click to upload images</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    </div>
                  </div>
                </PhotoUploader>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Images ({uploadedImages.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestComplete}
                disabled={isSubmitting || !comment.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${
                  isSubmitting || !comment.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Request to Complete
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;