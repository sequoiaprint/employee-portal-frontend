import React from 'react';
import DOMPurify from 'dompurify';

// Component to safely render HTML content with proper formatting
const HtmlContentDisplay = ({ content, className = '' }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizeHtml = (html) => {
    // Configure DOMPurify to allow certain tags and attributes
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'
      ],
      ALLOWED_ATTR: ['style', 'class', 'align']
    };
    
    return DOMPurify.sanitize(html, config);
  };

  // Format the HTML to ensure proper structure
  const formatHtml = (html) => {
    if (!html) return '';
    
    // Ensure proper list structure
    let formattedHtml = html
      .replace(/<li>(.*?)<\/li>/g, '<li>$1</li>')
      .replace(/<ul>(.*?)<\/ul>/g, '<ul>$1</ul>')
      .replace(/<ol>(.*?)<\/ol>/g, '<ol>$1</ol>');
    
    return formattedHtml;
  };

  const processedHtml = formatHtml(sanitizeHtml(content));

  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

// Utility function to extract plain text from HTML (if needed)
export const getPlainTextFromHtml = (html) => {
  if (!html) return '';
  
  // Create a temporary element to parse HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Return text content without HTML tags
  return tempElement.textContent || tempElement.innerText || '';
};

// Utility function to check if HTML content is empty
export const isHtmlContentEmpty = (html) => {
  if (!html) return true;
  
  const plainText = getPlainTextFromHtml(html);
  return plainText.trim() === '';
};

export default HtmlContentDisplay;