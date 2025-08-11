import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

// XOR decryption function
const xorDecrypt = (encrypted, secretKey = '28032002') => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode =
        decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

const Card = ({ news,onDeleted  }) => {
  // Safe defaults for news data
  const safeNews = news || {};
  const safeAuthor = safeNews.author || {};
  
  // Parse URLs if they exist (assuming comma-separated URLs)
  const imageUrls = safeNews.urls ? safeNews.urls.split(',').filter(url => url.trim()) : [];
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };
 const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      await axios.delete(`http://localhost:9000/api/news/${news.id}`);
      alert("News deleted successfully!");
      if (onDeleted) onDeleted(news.id);
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Failed to delete news.");
    }
  };

  const [createdBy, setCreatedBy] = useState(safeNews.createdBy || 'N/A');
  const [isLoading, setIsLoading] = useState(false);
  
  // Safely get full name
  const fullName = `${safeAuthor.firstname || ''} ${safeAuthor.lastname || ''}`.trim() || 'Anonymous';

  useEffect(() => {
    const fetchCreatedByData = async () => {
      if (!safeNews?.createdBy || typeof safeNews.createdBy !== 'string') return;

      setIsLoading(true);
      const encryptedToken = Cookies.get('authToken');
      const token = xorDecrypt(encryptedToken);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:9000/api/profiles/${safeNews.createdBy}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );

        const createdBy = response.data.data;
        const fullName = `${createdBy.firstname || ''} ${createdBy.lastname || ''}`.trim();
        setCreatedBy(fullName || createdBy.username || 'N/A');
      } catch (error) {
        console.error('Failed to fetch createdBy data:', error);
        setCreatedBy('N/A');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatedByData();
  }, [safeNews.createdBy]);


  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Section */}
      {imageUrls.length > 0 && (
        <div className="relative">
          {imageUrls.length === 1 ? (
            <img
              src={imageUrls[0]}
              alt={safeNews.title || 'News image'}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-1 h-48">
              {imageUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`${safeNews.title || 'News'} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/200x100?text=Image+Not+Found";
                    }}
                  />
                  {index === 3 && imageUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{imageUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Header with date and author */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              📰 Company News
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(safeNews.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          {safeNews.title || 'Untitled News'}
        </h3>

        {/* Body */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {safeNews.body || 'No content available'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
              {safeAuthor?.profilepicurl ? (
                <img
                  src={safeAuthor.profilepicurl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/100?text=User";
                  }}
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {fullName.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className='flex flex-col '>
              <span className="text-sm text-gray-700 font-medium">
                {isLoading ? "Loading..." : fullName}
              </span>
              <span className="text-[10px] text-gray-700 font-medium">
                {isLoading ? "Loading..." : safeAuthor.designation || 'No designation'}
              </span>
            </div>
          </div>
          <div className='absolute bottom-0 right-0'>
             <button  className="inline-flex items-center p-2   text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
            <img width="30" height="30" src="https://img.icons8.com/plasticine/50/filled-trash.png" alt="filled-trash"/>
          </button>
            <button className="inline-flex items-center p-2   text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
            <img width="30" height="30" src="https://img.icons8.com/plasticine/50/create-new.png" alt="filled-trash"/>
          </button>
          </div>

         
          
        </div>
      </div>
    </div>
  );
};

export default Card;