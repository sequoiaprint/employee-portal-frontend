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

const LeaveForm = ({ onSubmit, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    urls: []
  });
  const userid=Cookies.get('userUid')
  //console.log(userid)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (fileUrl) => {
    // Since PhotoUploader only gives us the URL, we'll maintain both URL and preview separately
    setFormData(prev => ({ 
      ...prev, 
      urls: [...prev.urls, fileUrl] 
    }));
    
    // Create a preview object to display
    setFilePreviews(prev => [
      ...prev,
      {
        url: fileUrl,
        name: fileUrl.split('/').pop(), // Extract filename from URL
        isImage: fileUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null
      }
    ]);
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const payload = {
        type: `${formData.leaveType} Leave`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        urls: formData.urls,
        createdBy:  userid
      };

      const response = await fetch('https://internalApi.sequoia-print.com/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave request');
      }

      const data = await response.json();
      onSubmit(data); 
    } catch (err) {
      setError(err.message);
      console.error('Error submitting leave request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Leave Type</label>
        <select
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          required
        >
          <option value="">Select leave type</option>
          <option value="Sick">Sick Leave</option>
          <option value="Vacation">Vacation</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reason</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Supporting Documents</label>
        <PhotoUploader 
          onUploadSuccess={handleFileUpload}
          onUploadError={(error) => setError(error)}
        />
      </div>

      {filePreviews.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Documents</label>
          <div className="flex flex-wrap gap-4">
            {filePreviews.map((file, index) => (
              <div key={index} className="relative border rounded-md p-2 w-32 h-32 flex items-center justify-center group">
                {file.isImage ? (
                  <img 
                    src={file.url} 
                    alt={`Uploaded ${index}`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs mt-1 truncate">{file.name}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </div>
    </form>
  );
};

export default LeaveForm;