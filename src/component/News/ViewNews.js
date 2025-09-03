import React from 'react';
import DOMPurify from 'dompurify';

const ViewNews = ({ news, onClose }) => {
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to decode HTML entities
  const decodeHTML = (html) => {
    if (!html) return '';
    
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Function to sanitize and create HTML content
  const createSanitizedHTML = (content) => {
    if (!content) return '';
    const decoded = decodeHTML(content);
    return DOMPurify.sanitize(decoded);
  };

  // Safely get full name
  const fullName = `${safeAuthor.firstname || ''} ${safeAuthor.lastname || ''}`.trim() || 'Anonymous';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">News Article</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Images */}
          {imageUrls.length > 0 && (
            <div className="mb-6">
              {imageUrls.length === 1 ? (
                <img
                  src={imageUrls[0]}
                  alt={safeNews.title || 'News image'}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`${safeNews.title || 'News'} - ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {safeNews.title || 'Untitled News'}
          </h1>

          {/* Meta information */}
          <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Published on {formatDate(safeNews.created_at)}</span>
              <span>•</span>
              <span>By {fullName}</span>
              {safeAuthor.designation && (
                <>
                  <span>•</span>
                  <span>{safeAuthor.designation}</span>
                </>
              )}
            </div>
          </div>

          {/* News Content */}
          <div 
            className="prose prose-lg max-w-none news-content"
            dangerouslySetInnerHTML={{ __html: createSanitizedHTML(safeNews.body) }}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* CSS for news content styling */}
      <style jsx>{`
        .news-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.7;
          color: #374151;
        }
        
        .news-content h1, .news-content h2, .news-content h3 {
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .news-content h1 {
          font-size: 1.875rem;
        }
        
        .news-content h2 {
          font-size: 1.5rem;
        }
        
        .news-content h3 {
          font-size: 1.25rem;
        }
        
        .news-content p {
          margin-bottom: 1rem;
        }
        
        .news-content ul, .news-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .news-content li {
          margin-bottom: 0.5rem;
        }
        
        .news-content strong, .news-content b {
          font-weight: 600;
        }
        
        .news-content em, .news-content i {
          font-style: italic;
        }
        
        .news-content u {
          text-decoration: underline;
        }
        
        .news-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .news-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .news-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .news-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .news-content th, .news-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        
        .news-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ViewNews;