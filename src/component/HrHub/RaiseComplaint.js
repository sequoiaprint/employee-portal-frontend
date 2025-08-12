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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadSuccess = (url) => {
    setUploadedUrls(prev => [...prev, url]);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    // You might want to show this error to the user
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

      const response = await fetch('http://localhost:9000/api/complaint', {
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
      console.error('Submission failed:', error);
      // You might want to show this error to the user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          required
        >
          <option value="">Select category</option>
          <option value="Workplace">Workplace Issue</option>
          <option value="Harassment">Harassment</option>
          <option value="Discrimination">Discrimination</option>
          <option value="Other">Other</option>
        </select>
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
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          required
        />
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Submit Complaint
        </button>
      </div>
    </form>
  );
};

export default RaiseComplaint;