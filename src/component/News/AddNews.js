import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PhotoUploader from '../Global/uploader';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Image, 
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Unlink
} from 'lucide-react';

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
  try {
    const encryptedToken = Cookies.get('authToken');
    if (!encryptedToken) {
      console.warn('No auth token found in cookies');
      return null;
    }

    const token = xorDecrypt(encryptedToken);
    if (!token) {
      console.warn('Failed to decrypt auth token');
      Cookies.remove('authToken', { path: '/' });
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const AddEditNews = ({ 
  editingNews = null,
  onNewsAdded, 
  onNewsUpdated,
  onClose 
}) => {
  const { user } = useSelector((state) => state.auth);
  const { currentProfile } = useSelector((state) => state.profile);
  
  const isEditMode = !!editingNews;
  
  // Initialize form data based on mode
  const [formData, setFormData] = useState({
    title: editingNews?.title || '',
    body: editingNews?.body || '',
  });
  
  const [localLoading, setLocalLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Use a single ref to track submission state
  const submissionState = useRef({
    isSubmitting: false,
    lastSubmissionTime: 0,
    abortController: null
  });

  // Rich text editor ref
  const bodyEditorRef = useRef(null);
  const colorPickerRef = useRef(null);
  const fontSizePickerRef = useRef(null);

  const fullName = currentProfile ? `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim() : user?.name || 'Anonymous';

  // Predefined colors for text
  const textColors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#DDA0DD', '#98FB98', '#F0E68C', '#87CEEB'
  ];

  // Font sizes
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  // Rich text editor functions
  const execCommand = (command, value = null) => {
    if (bodyEditorRef.current) {
      bodyEditorRef.current.focus();
      document.execCommand(command, false, value);
      updateFormData();
    }
  };

  const updateFormData = () => {
    setTimeout(() => {
      if (bodyEditorRef.current) {
        const content = bodyEditorRef.current.innerHTML;
        setFormData(prev => ({
          ...prev,
          body: content
        }));
      }
    }, 10);
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleBulletList = () => {
    execCommand('insertUnorderedList');
    updateFormData();
  };
  const handleNumberedList = () => {
    execCommand('insertOrderedList');
    updateFormData();
  };
  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');

  const handleColorChange = (color) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleFontSizeChange = (size) => {
    // Use fontSize command with pixel values
    execCommand('fontSize', '1'); // Reset first
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement('span');
          span.style.fontSize = size;
          try {
            range.surroundContents(span);
            updateFormData();
          } catch (e) {
            // Fallback for complex selections
            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);
            updateFormData();
          }
        }
      }
    }, 10);
    setShowFontSizePicker(false);
  };

  const handleImageInsert = async (imageUrl) => {
    if (!bodyEditorRef.current || !imageUrl) return;
    
    try {
      // Insert image at cursor position
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.margin = '10px 0';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      img.draggable = true;
      img.contentEditable = false;
      
      // Add hover effect
      img.onmouseenter = () => {
        img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        img.style.cursor = 'pointer';
      };
      img.onmouseleave = () => {
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      };

      // Insert at cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
      } else {
        bodyEditorRef.current.appendChild(img);
      }
      
      // Move cursor after image
      const newRange = document.createRange();
      newRange.setStartAfter(img);
      newRange.setEndAfter(img);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      updateFormData();
      
    } catch (error) {
      console.error('Error inserting image:', error);
      setErrors({ submit: 'Failed to insert image' });
    }
  };

  const handleLinkInsert = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleLinkRemove = () => execCommand('unlink');

  // Handle paste events to maintain formatting and process images
  const handleBodyEditorPaste = async (e) => {
    e.preventDefault();
    
    // Handle text paste
    const textPaste = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (textPaste) {
      document.execCommand('insertText', false, textPaste);
      updateFormData();
      return;
    }

    // Handle image paste
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // For pasted images, we need to upload them first
          setIsUploadingImage(true);
          try {
            const token = getAuthToken();
            if (!token) {
              throw new Error('Authentication required for image upload');
            }
            
            const formData = new FormData();
            formData.append('files', file);
            
            const response = await axios.post(
              'https://internalApi.sequoia-print.com/api/files/upload',
              formData,
              {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                },
              }
            );
            
            const imageUrl = response.data.data?.[0]?.url || response.data.url;
            if (imageUrl) {
              await handleImageInsert(imageUrl);
            }
          } catch (error) {
            console.error('Error uploading pasted image:', error);
            setErrors({ submit: 'Failed to upload pasted image' });
          } finally {
            setIsUploadingImage(false);
          }
        }
      }
    }
  };

  const handleBodyEditorKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'i':
          e.preventDefault();
          handleItalic();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
        case 'k':
          e.preventDefault();
          handleLinkInsert();
          break;
      }
    }
    
    // Handle Enter key for better list formatting
    if (e.key === 'Enter') {
      setTimeout(updateFormData, 10);
    }
  };

  const handleBodyEditorInput = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      body: content
    }));
  };

  // Click outside to close pickers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
      if (fontSizePickerRef.current && !fontSizePickerRef.current.contains(event.target)) {
        setShowFontSizePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize rich text editor content when editing
  useEffect(() => {
    if (isEditMode && editingNews?.body && bodyEditorRef.current) {
      bodyEditorRef.current.innerHTML = editingNews.body;
    }
  }, [isEditMode, editingNews?.body]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Get the content from the rich text editor for validation
    const bodyContent = bodyEditorRef.current ? bodyEditorRef.current.innerHTML.trim() : formData.body;
    if (!bodyContent || bodyContent === '<br>' || bodyContent === '') {
      newErrors.body = 'Body is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions
    if (submissionState.current.isSubmitting || isUploadingImage) {
      console.log('Submission blocked - already processing');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set submission state
    submissionState.current.isSubmitting = true;
    submissionState.current.lastSubmissionTime = Date.now();
    setLocalLoading(true);

    // Cancel any existing request
    if (submissionState.current.abortController) {
      submissionState.current.abortController.abort();
    }
    
    // Create new abort controller
    submissionState.current.abortController = new AbortController();
    
    try {
      if (!currentProfile?.uid) {
        throw new Error('User profile not found - cannot create/update news');
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication found');
      }

      // Get the HTML content from the rich text editor
      const bodyContent = bodyEditorRef.current ? bodyEditorRef.current.innerHTML.trim() : formData.body;

      const newsData = {
        title: formData.title.trim(),
        body: bodyContent,
        urls: '', // No separate URLs since images are embedded in content
        createdBy: currentProfile.uid
      };

      let response;
      
      if (isEditMode) {
        // Update existing news
        response = await axios.put(
          `https://internalApi.sequoia-print.com/api/news/${editingNews.id}`,
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new news
        response = await axios.post(
          'https://internalApi.sequoia-print.com/api/news',
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      const resultNews = response.data?.data || response.data;
      
      // Reset form only for add mode
      if (!isEditMode) {
        setFormData({
          title: '',
          body: ''
        });
        // Clear the rich text editor
        if (bodyEditorRef.current) {
          bodyEditorRef.current.innerHTML = '';
        }
      }
      
      // Call appropriate callbacks
      if (isEditMode && onNewsUpdated) {
        onNewsUpdated(resultNews);
      } else if (!isEditMode && onNewsAdded) {
        onNewsAdded(resultNews);
      }
      
      if (onClose) onClose();
      
    } catch (error) {
      // Ignore aborted requests
      if (axios.isCancel(error)) {
        return;
      }
      
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} news:`, error);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} news. Please try again.`;
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid'];
          cookiesToClear.forEach(cookie => {
            Cookies.remove(cookie, { path: '/' });
          });
          localStorage.removeItem('authToken');
          errorMessage = 'Session expired, please login again';
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message === 'No authentication found') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      // Reset submission state
      submissionState.current.isSubmitting = false;
      submissionState.current.abortController = null;
      setLocalLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (submissionState.current.abortController) {
        submissionState.current.abortController.abort();
      }
    };
  }, []);

  // Handle drag and drop for images
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        setIsUploadingImage(true);
        try {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Authentication required for image upload');
          }
          
          const formData = new FormData();
          formData.append('files', file);
          
          const response = await axios.post(
            'https://internalApi.sequoia-print.com/api/files/upload',
            formData,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              },
            }
          );
          
          const imageUrl = response.data.data?.[0]?.url || response.data.url;
          if (imageUrl) {
            await handleImageInsert(imageUrl);
          }
        } catch (error) {
          console.error('Error uploading dropped image:', error);
          setErrors({ submit: 'Failed to upload dropped image' });
        } finally {
          setIsUploadingImage(false);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit News' : 'Add News'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={localLoading || isUploadingImage}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            {isEditMode 
              ? 'Update your company news and announcements' 
              : 'Create rich content with images, formatting, and styling'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Author Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {fullName.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {isEditMode ? 'Updating as' : 'Publishing as'}
                </p>
                <p className="text-sm text-gray-600">{fullName}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter news title..."
              maxLength={255}
              disabled={localLoading || isUploadingImage}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Enhanced Rich Text Editor */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            
            {/* Enhanced Rich Text Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-3 border border-b-0 rounded-t bg-gray-50 relative">
              {/* Text Formatting */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBold}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Bold (Ctrl+B)"
                  disabled={localLoading || isUploadingImage}
                >
                  <Bold size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={handleItalic}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Italic (Ctrl+I)"
                  disabled={localLoading || isUploadingImage}
                >
                  <Italic size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={handleUnderline}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Underline (Ctrl+U)"
                  disabled={localLoading || isUploadingImage}
                >
                  <Underline size={16} />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Font Size */}
              <div className="relative" ref={fontSizePickerRef}>
                <button
                  type="button"
                  onClick={() => setShowFontSizePicker(!showFontSizePicker)}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                  title="Font Size"
                  disabled={localLoading || isUploadingImage}
                >
                  <Type size={16} />
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showFontSizePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 grid grid-cols-5 gap-2 min-w-[200px]">
                    {fontSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleFontSizeChange(size)}
                        className="p-2 hover:bg-blue-50 rounded text-center text-sm border hover:border-blue-300 transition-colors"
                        style={{ fontSize: size }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Text Color */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                  title="Text Color"
                  disabled={localLoading || isUploadingImage}
                >
                  <Palette size={16} />
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 grid grid-cols-7 gap-2 min-w-[200px]">
                    {textColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Lists */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBulletList}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Bullet List"
                  disabled={localLoading || isUploadingImage}
                >
                  <List size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={handleNumberedList}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Numbered List"
                  disabled={localLoading || isUploadingImage}
                >
                  <ListOrdered size={16} />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Alignment */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAlignLeft}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Align Left"
                  disabled={localLoading || isUploadingImage}
                >
                  <AlignLeft size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={handleAlignCenter}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Align Center"
                  disabled={localLoading || isUploadingImage}
                >
                  <AlignCenter size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={handleAlignRight}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Align Right"
                  disabled={localLoading || isUploadingImage}
                >
                  <AlignRight size={16} />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Links */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleLinkInsert}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Insert Link (Ctrl+K)"
                  disabled={localLoading || isUploadingImage}
                >
                  <Link size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={handleLinkRemove}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Remove Link"
                  disabled={localLoading || isUploadingImage}
                >
                  <Unlink size={16} />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Image Insert */}
              <PhotoUploader
                onUploadSuccess={handleImageInsert}
                onUploadError={(error) => setErrors({ submit: error })}
                accept="image/*"
                disabled={localLoading || isUploadingImage}
              >
                <button
                  type="button"
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                  title="Insert Image"
                  disabled={localLoading || isUploadingImage}
                >
                  <Image size={16} />
                </button>
              </PhotoUploader>
            </div>

            {/* Rich Text Editor */}
            <div
              ref={bodyEditorRef}
              contentEditable={!localLoading && !isUploadingImage}
              onInput={handleBodyEditorInput}
              onKeyDown={handleBodyEditorKeyDown}
              onPaste={handleBodyEditorPaste}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full p-4 border border-t-0 rounded-b min-h-[300px] max-h-[400px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.body ? 'border-red-500' : 'border-gray-300'
              } ${localLoading || isUploadingImage ? 'bg-gray-100' : 'bg-white'}`}
              style={{
                minHeight: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                lineHeight: '1.6'
              }}
              data-placeholder="Write your news content here... Use the toolbar for formatting, drag & drop images, or paste content directly."
              suppressContentEditableWarning={true}
            />
            
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p>• Use toolbar buttons or keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Ctrl+B</kbd> (Bold), <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Ctrl+I</kbd> (Italic), <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Ctrl+U</kbd> (Underline), <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Ctrl+K</kbd> (Link)</p>
              <p>• Drag & drop images directly into the editor or use the image button</p>
              <p>• Images can be resized by dragging corners and moved around within the content</p>
            </div>

            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}

            {/* Add comprehensive CSS for rich text editor styling */}
            <style jsx>{`
              div[contenteditable]:empty:before {
                content: attr(data-placeholder);
                color: #9CA3AF;
                pointer-events: none;
                position: absolute;
              }
              
              div[contenteditable] {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
              }
              
              div[contenteditable] ul {
                list-style-type: disc;
                padding-left: 25px;
                margin: 10px 0;
              }
              
              div[contenteditable] ol {
                list-style-type: decimal;
                padding-left: 25px;
                margin: 10px 0;
              }
              
              div[contenteditable] li {
                margin: 5px 0;
                padding-left: 5px;
              }
              
              div[contenteditable] strong, 
              div[contenteditable] b {
                font-weight: bold;
              }
              
              div[contenteditable] em, 
              div[contenteditable] i {
                font-style: italic;
              }
              
              div[contenteditable] u {
                text-decoration: underline;
              }
              
              div[contenteditable] a {
                color: #3B82F6;
                text-decoration: underline;
              }
              
              div[contenteditable] a:hover {
                color: #1D4ED8;
              }
              
              div[contenteditable] img {
                max-width: 100%;
                height: auto;
                margin: 10px 0;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: all 0.2s ease;
              }
              
              div[contenteditable] img:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: scale(1.02);
              }
              
              div[contenteditable] img.selected {
                border: 2px solid #3B82F6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
              }
              
              div[contenteditable] p {
                margin: 8px 0;
              }
              
              div[contenteditable] h1 {
                font-size: 1.8em;
                font-weight: bold;
                margin: 16px 0 8px 0;
              }
              
              div[contenteditable] h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 14px 0 7px 0;
              }
              
              div[contenteditable] h3 {
                font-size: 1.2em;
                font-weight: bold;
                margin: 12px 0 6px 0;
              }
              
              div[contenteditable] blockquote {
                border-left: 4px solid #E5E7EB;
                margin: 16px 0;
                padding-left: 16px;
                color: #6B7280;
                font-style: italic;
              }
              
              div[contenteditable]:focus {
                outline: none;
              }
            `}</style>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={localLoading || isUploadingImage}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              disabled={localLoading || isUploadingImage}
            >
              {localLoading || isUploadingImage ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isUploadingImage ? 'Uploading...' : 'Processing...'}
                </div>
              ) : (
                isEditMode ? 'Update News' : 'Publish News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditNews;