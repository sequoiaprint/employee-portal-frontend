import React, { useState } from 'react';
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
  const encryptedToken = Cookies.get('authToken') || localStorage.getItem('authToken');
  if (!encryptedToken) {
    return null;
  }
  return xorDecrypt(encryptedToken);
};

const PhotoUploader = ({ onUploadSuccess, onUploadError, children, accept = "image/*" }) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please select an image file';
      onUploadError?.(error);
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      const error = 'File size must be less than 2MB';
      onUploadError?.(error);
      return;
    }

    const token = getAuthToken();
    console.log(token)
    if (!token) {
      const error = 'Authentication token not found';
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch('http://localhost:9000/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the API response structure based on your screenshot
      let fileUrl = null;
      
      if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Your API returns: { success: true, data: [{ url: "...", key: "...", ... }] }
        fileUrl = data.data[0].url;
      } else if (data.url) {
        // Fallback for direct url field
        fileUrl = data.url;
      } else if (data.fileUrl) {
        // Fallback for fileUrl field
        fileUrl = data.fileUrl;
      } else if (data.data?.url) {
        // Fallback for nested data.url
        fileUrl = data.data.url;
      }
      
      if (!fileUrl) {
        throw new Error('No file URL received from server');
      }

      onUploadSuccess?.(fileUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      onUploadError?.(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="photo-uploader">
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="photo-uploader-input"
        disabled={isUploading}
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {children ? (
          <label
            htmlFor="photo-uploader-input"
            className={`block ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
          >
            {children}
          </label>
        ) : (
          <label
            htmlFor="photo-uploader-input"
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#EA7125] transition-colors ${
              isUploading ? 'pointer-events-none' : 'cursor-pointer'
            }`}
          >
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
            </div>
          </label>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#EA7125]"></div>
              <span className="text-[#EA7125] font-medium">Uploading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploader;