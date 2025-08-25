import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteInsight } from '../../redux/Insights/Insights';
import AddEditInsight from './AddEditInsight';
import Cookies from 'js-cookie';
const InsightCard = ({ insight, onDeleted, onUpdated }) => {
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
     const role = Cookies.get('role');
      const isAdmin = role === "Admin Ops"
  if (!insight || typeof insight !== 'object') {
    return <div>Loading insight...</div>;
  }

  // Safe defaults for insight data
  const safeInsight = insight || {};
  const safeAuthor = safeInsight.author || {};
  
  // Parse URLs if they exist (assuming comma-separated URLs)
  const urls = safeInsight.urls ? safeInsight.urls.split(',').filter(url => url.trim()) : [];
  const fullName = `${safeAuthor.firstname || ''} ${safeAuthor.lastname || ''}`.trim() || 'Anonymous';
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this insight?")) return;

    try {
      const result = await dispatch(deleteInsight(insight.id)).unwrap();
      // Make sure we're not trying to render the result object
      if (result.success) {
        alert(result.message || "Insight deleted successfully!");
        if (onDeleted) onDeleted(insight.id);
      }
    } catch (error) {
      console.error("Error deleting insight:", error);
      alert(error.message || "Failed to delete insight.");
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleInsightUpdated = (updatedInsight) => {
    if (onUpdated) onUpdated(updatedInsight);
    setShowEditModal(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === urls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? urls.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Image Section */}
        {urls.length > 0 && (
          <div className="relative">
            <img
              src={urls[currentImageIndex]}
              alt={safeInsight.title || 'Insight image'}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
              }}
            />
            
            {/* Image navigation buttons if multiple images */}
            {urls.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Image counter */}
            {urls.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1}/{urls.length}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 flex-grow flex flex-col">
          {/* Header with date and tags */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {safeInsight.tags?.split(',').map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tag.trim()}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(safeInsight.createdAt || safeInsight.created_at)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
            {safeInsight.title || 'Untitled Insight'}
          </h3>

          {/* Body */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
            {safeInsight.body || 'No content available'}
          </p>

          {/* Author info */}
          {safeInsight.author && (
            <div className="flex items-center mb-4">
              {safeAuthor.profilepicurl && (
                <img 
                  src={safeAuthor.profilepicurl} 
                  alt={`${safeAuthor.firstname || ''} ${safeAuthor.lastname || ''}`}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40?text=User";
                  }}
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {safeAuthor.firstname || ''} {safeAuthor.lastname || ''}
                </p>
                <p className="text-xs text-gray-500">
                  {safeAuthor.designation || ''}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto">
             {isAdmin &&(
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleDelete}
                className="inline-flex items-center p-2 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-300"
                title="Delete insight"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button 
                onClick={handleEdit}
                className="inline-flex items-center p-2 text-blue-500 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all duration-300"
                title="Edit insight"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
             )}
            <div className="text-sm text-gray-500">
              {urls.length > 0 && `${urls.length} image${urls.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AddEditInsight
          editingInsight={safeInsight}
          onInsightUpdated={handleInsightUpdated}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default InsightCard;