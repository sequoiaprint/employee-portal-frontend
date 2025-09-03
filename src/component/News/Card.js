import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteNews, updateNews } from '../../redux/news/news';
import AddEditNews from './AddNews';
import ViewNews from './ViewNews';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';

const Card = ({ news, onDeleted, onUpdated }) => {
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const role = Cookies.get('role');
  const isAdmin = role === "Admin Ops";
  
  // Safe defaults for news data
  const safeNews = news || {};
  const safeAuthor = safeNews.author || {};

  // Parse URLs if they exist
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

  // Function to decode HTML entities
  const decodeHTML = (html) => {
    if (!html) return '';
    
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Function to create plain text preview (stripped of HTML tags)
  const createTextPreview = (htmlContent, maxLength = 150) => {
    if (!htmlContent) return 'No content available';
    
    // Decode HTML entities first
    const decoded = decodeHTML(htmlContent);
    
    // Strip HTML tags
    const stripped = decoded.replace(/<[^>]*>/g, '');
    
    // Trim to max length and add ellipsis if needed
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + '...';
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      await dispatch(deleteNews(news.id)).unwrap();
      alert("News deleted successfully!");
      if (onDeleted) onDeleted(news.id);
    } catch (error) {
      console.error("Error deleting news:", error);
      alert(error.message || "Failed to delete news.");
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleView = () => {
    setShowViewModal(true);
  };

  const handleNewsUpdated = async (updatedNews) => {
    try {
      // Update Redux store
      await dispatch(updateNews({ id: news.id, newsData: updatedNews })).unwrap();
      alert("News updated successfully!");
      if (onUpdated) onUpdated(updatedNews);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating news:", error);
      alert(error.message || "Failed to update news.");
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  // Safely get full name
  const fullName = `${safeAuthor.firstname || ''} ${safeAuthor.lastname || ''}`.trim() || 'Anonymous';

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Image Section */}
        {imageUrls.length > 0 && (
          <div className="relative cursor-pointer" onClick={handleView}>
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
        <div className="p-6 flex-1 flex flex-col">
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

          {/* Title - clickable to view full news */}
          <h3 
            className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={handleView}
          >
            {safeNews.title || 'Untitled News'}
          </h3>

          {/* Body Preview - using plain text instead of HTML */}
          <div 
            className="text-gray-600 text-sm mb-4 line-clamp-3 news-preview cursor-pointer"
            onClick={handleView}
          >
            {createTextPreview(safeNews.body)}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto">
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
              <div className='flex flex-col'>
                <span className="text-sm text-gray-700 font-medium">
                  {isLoading ? "Loading..." : fullName}
                </span>
                <span className="text-[10px] text-gray-700 font-medium">
                  {isLoading ? "Loading..." : safeAuthor.designation || 'No designation'}
                </span>
              </div>
            </div>
            
            {/* Read More Button */}
            <button
              onClick={handleView}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Read More →
            </button>
            
            {isAdmin &&(
              <div className='flex space-x-2'>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  title="Delete news"
                >
                  <img width="20" height="20" src="https://img.icons8.com/plasticine/50/filled-trash.png" alt="delete" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Edit news"
                >
                  <img width="20" height="20" src="https://img.icons8.com/plasticine/50/create-new.png" alt="edit" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AddEditNews
          editingNews={safeNews}
          onNewsUpdated={handleNewsUpdated}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* View News Modal */}
      {showViewModal && (
        <ViewNews
          news={safeNews}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </>
  );
};

export default Card;