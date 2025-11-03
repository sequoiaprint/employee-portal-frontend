import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

const ViewNews = ({ news, onClose }) => {
  // Safe defaults for news data
  const safeNews = news || {};
  const safeAuthor = safeNews.author || {};
  
  // Ref for the content display area
  const contentDisplayRef = useRef(null);

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
    return DOMPurify.sanitize(decoded, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'font', 'blockquote', 'pre', 'code',
        'table', 'tbody', 'thead', 'tr', 'td', 'th', 'hr', 'sub', 'sup', 'mark', 'del', 'ins'
      ],
      ALLOWED_ATTR: [
        'src', 'alt', 'href', 'target', 'style', 'class', 'id', 'title', 
        'width', 'height', 'align', 'color', 'size', 'face', 'colspan', 'rowspan'
      ],
      ALLOWED_STYLES: [
        'color', 'background-color', 'font-size', 'font-weight', 'font-style', 'text-decoration',
        'text-align', 'margin', 'padding', 'border', 'border-radius', 'display', 'float',
        'position', 'top', 'left', 'right', 'bottom', 'z-index', 'width', 'height', 
        'max-width', 'max-height', 'min-width', 'min-height', 'box-shadow', 'transform',
        'vertical-align', 'line-height', 'letter-spacing', 'word-spacing', 'shape-outside',
        'shape-margin'
      ]
    });
  };

  // Setup image interaction for viewing (no editing, just proper display)
  const setupImageDisplay = () => {
    if (!contentDisplayRef.current) return;

    const images = contentDisplayRef.current.querySelectorAll('img');
    images.forEach(img => {
      // Ensure proper styling for display
      img.className = 'news-image';
      img.style.cursor = 'default';
      img.draggable = false;
      img.contentEditable = false;

      // Ensure images don't break layout
      if (!img.style.maxWidth && !img.style.width) {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }

      // Add hover effect for images
      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.02)';
        img.style.transition = 'transform 0.2s ease';
        img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      });

      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      });

      // Handle image load errors
      img.addEventListener('error', (e) => {
        e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
        e.target.alt = "Image not found";
      });
    });
  };

  // Initialize content display when component mounts or content changes
  useEffect(() => {
    if (safeNews.body && contentDisplayRef.current) {
      const sanitizedContent = createSanitizedHTML(safeNews.body);
      contentDisplayRef.current.innerHTML = sanitizedContent;
      
      // Setup images after content is loaded
      setTimeout(() => {
        setupImageDisplay();
      }, 100);
    }
  }, [safeNews.body]);

  // Safely get full name
  const fullName = `${safeAuthor.firstname || ''} ${safeAuthor.lastname || ''}`.trim() || 'Anonymous';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-yellow-400">
          <h2 className="text-xl mx-auto font-semibold text-white">View News Article</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Title and Meta Information */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {safeNews.title || 'Untitled News'}
            </h1>
            
            {/* Meta information */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
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
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">{fullName}</span>
                    <span className="text-xs text-gray-500">
                      {safeAuthor.designation || 'No designation'}
                    </span>
                  </div>
                </div>
                <span className="text-gray-300">|</span>
                <span>Published on {formatDate(safeNews.created_at)}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  📰 Company News
                </span>
              </div>
            </div>

            {/* Images from URLs */}
            {imageUrls.length > 0 && (
              <div className="mb-6">
                {imageUrls.length === 1 ? (
                  <img
                    src={imageUrls[0]}
                    alt={safeNews.title || 'News image'}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {imageUrls.slice(0, 4).map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`${safeNews.title || 'News'} - ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                          }}
                        />
                        {index === 3 && imageUrls.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
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
          </div>

          {/* News Content with Rich Text Display */}
          <div className="p-6">
            <div 
              ref={contentDisplayRef}
              className="news-content-display"
              style={{ 
                minHeight: '200px',
                lineHeight: '1.7',
                fontSize: '16px',
                position: 'relative'
              }}
            />
          </div>
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

      {/* Enhanced CSS for rich content display */}
      <style jsx>{`
        .news-content-display {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          color: #374151;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .news-content-display h1, 
        .news-content-display h2, 
        .news-content-display h3,
        .news-content-display h4,
        .news-content-display h5,
        .news-content-display h6 {
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          line-height: 1.2;
        }
        
        .news-content-display h1 { font-size: 2rem; }
        .news-content-display h2 { font-size: 1.75rem; }
        .news-content-display h3 { font-size: 1.5rem; }
        .news-content-display h4 { font-size: 1.25rem; }
        .news-content-display h5 { font-size: 1.125rem; }
        .news-content-display h6 { font-size: 1rem; }
        
        .news-content-display p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        
        .news-content-display ul, 
        .news-content-display ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .news-content-display li {
          margin-bottom: 0.5rem;
        }
        
        .news-content-display strong, 
        .news-content-display b {
          font-weight: 600;
        }
        
        .news-content-display em, 
        .news-content-display i {
          font-style: italic;
        }
        
        .news-content-display u {
          text-decoration: underline;
        }
        
        .news-content-display a {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        
        .news-content-display a:hover {
          color: #1d4ed8;
        }
        
        .news-content-display img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          display: block;
        }
        
        .news-content-display img.img-left {
          float: left;
          margin: 0 15px 10px 0;
        }
        
        .news-content-display img.img-right {
          float: right;
          margin: 0 0 10px 15px;
        }
        
        .news-content-display img.img-center {
          margin: 10px auto;
          display: block;
        }
        
        .news-content-display img.img-inline {
          display: inline-block;
          vertical-align: middle;
          margin: 0 8px;
        }
        
        .news-content-display img.img-free {
          position: absolute;
        }
        
        .news-content-display img.img-behind {
          z-index: -1;
          position: relative;
        }
        
        .news-content-display img.img-front {
          z-index: 10;
          position: relative;
        }
        
        .news-content-display img.img-tight {
          float: left;
          shape-outside: attr(src);
          shape-margin: 12px;
        }
        
        .news-content-display blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0 4px 4px 0;
          padding: 1rem;
        }
        
        .news-content-display pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .news-content-display code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
        }
        
        .news-content-display table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .news-content-display th, 
        .news-content-display td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }
        
        .news-content-display th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .news-content-display tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .news-content-display hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        
        .news-content-display mark {
          background-color: #fef3cd;
          padding: 2px 4px;
          border-radius: 2px;
        }
        
        .news-content-display del {
          text-decoration: line-through;
          color: #6b7280;
        }
        
        .news-content-display ins {
          text-decoration: underline;
          background-color: #dcfce7;
          padding: 1px 2px;
        }
        
        .news-content-display sub,
        .news-content-display sup {
          font-size: 0.75rem;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
        }
        
        .news-content-display sup {
          top: -0.5em;
        }
        
        .news-content-display sub {
          bottom: -0.25em;
        }
        
        /* Font size classes that might be applied */
        .news-content-display [style*="font-size"] {
          line-height: 1.4;
        }
        
        /* Color styling preservation */
        .news-content-display [style*="color"] {
          /* Colors will be preserved from inline styles */
        }
        
        /* Text alignment */
        .news-content-display [style*="text-align: center"] {
          text-align: center;
        }
        
        .news-content-display [style*="text-align: right"] {
          text-align: right;
        }
        
        .news-content-display [style*="text-align: left"] {
          text-align: left;
        }
        
        /* Ensure proper spacing for nested elements */
        .news-content-display > *:first-child {
          margin-top: 0;
        }
        
        .news-content-display > *:last-child {
          margin-bottom: 0;
        }
        
        /* Handle font tags from legacy HTML */
        .news-content-display font {
          /* Font tags will preserve their styling through inline styles */
        }
        
        /* Responsive image handling */
        @media (max-width: 768px) {
          .news-content-display img {
            max-width: 100% !important;
            width: auto !important;
            height: auto !important;
            float: none !important;
            display: block !important;
            margin: 10px auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewNews;