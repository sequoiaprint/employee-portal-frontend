import React, { useState } from 'react';
import PhotoUploader from '../Global/uploader';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';

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

const RaiseComplaint = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    isAnonymous: '0'
  });
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const userid = Cookies.get('userUid'); // as created at
  const [touchedFields, setTouchedFields] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark the field as touched when user changes it
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const isFieldValid = (fieldName) => {
    if (!showValidation && !touchedFields[fieldName]) return true;
    
    switch (fieldName) {
      case 'title':
        return formData.title.trim() !== '';
      case 'category':
        return formData.category !== '';
      case 'description':
        return formData.description.trim() !== '';
      default:
        return true;
    }
  };

  const handleUploadSuccess = (url) => {
    setUploadedUrls(prev => [...prev, url]);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    setError('File upload failed. Please try again.');
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.category !== '' &&
      formData.description.trim() !== ''
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const complaintData = {
      title: formData.title,
      category: formData.category,
      priority: formData.urgency,
      description: formData.description,
      urls: uploadedUrls.join(','), // Combine multiple URLs with comma
      createdBy: userid,
      isAnonymous: formData.isAnonymous
    };

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://internalApi.sequoia-print.com/api/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit complaint');
      }

      const data = await response.json();
      onSubmit(data);
      onClose();
    } catch (error) {
      setError(error.message || 'Submission failed. Please try again.');
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
            isFieldValid('title') ? 'border-gray-300' : 'border-red-500'
          }`}
          required
        />
        {!isFieldValid('title') && (
          <p className="mt-1 text-xs text-red-500">Title is required</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
            isFieldValid('category') ? 'border-gray-300' : 'border-red-500'
          }`}
          required
        >
          <option value="">Select category</option>
          <option value="Workplace">Workplace Issue</option>
          <option value="Harassment">Harassment</option>
          <option value="Discrimination">Discrimination</option>
          <option value="Other">Other</option>
        </select>
        {!isFieldValid('category') && (
          <p className="mt-1 text-xs text-red-500">Category is required</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Urgency</label>
        <div className="mt-2 flex space-x-4">
          {['low', 'medium', 'high'].map(level => (
            <label key={level} className="flex items-center">
              <input
                type="radio"
                name="urgency"
                checked={formData.urgency === level}
                onChange={() => setFormData(prev => ({ ...prev, urgency: level }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={4}
          className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
            isFieldValid('description') ? 'border-gray-300' : 'border-red-500'
          }`}
          required
        />
        {!isFieldValid('description') && (
          <p className="mt-1 text-xs text-red-500">Description is required</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Upload Evidence (Optional)</label>
        <PhotoUploader 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        {uploadedUrls.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Uploaded files:</p>
            <ul className="text-sm text-gray-500">
              {uploadedUrls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                    File {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isAnonymous === '1'}
            onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked ? '1' : '0' }))}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
          />
          <span className="ml-2 text-sm text-gray-700">Submit anonymously</span>
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </div>
    </form>
  );
};

export default RaiseComplaint;