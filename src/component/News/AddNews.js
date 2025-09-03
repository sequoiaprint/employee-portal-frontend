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
  Unlink,
  Move,
  RotateCcw,
  Plus,
  Minus
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
  const [textWrapMode, setTextWrapMode] = useState('inline'); // 'inline', 'behind', 'front', 'tight'
  const isEditMode = !!editingNews;

  // Initialize form data based on mode
  const [formData, setFormData] = useState({
    title: editingNews?.title || '',
    body: editingNews?.body || '',
  });

  const [localLoading, setLocalLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
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

  // Enhanced image editing state
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imagePositionMode, setImagePositionMode] = useState('flow'); // 'flow' or 'free'

  const fullName = currentProfile ? `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim() : user?.name || 'Anonymous';

  // Predefined colors for text
  const textColors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#DDA0DD', '#98FB98', '#F0E68C', '#87CEEB'
  ];

  // Initialize image interaction functionality
  useEffect(() => {
    const handleClickOutsideImage = (e) => {
      if (selectedImage && !e.target.closest('.editor-image') && !e.target.closest('.image-controls')) {
        setSelectedImage(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
      if (e.key === 'Delete' && selectedImage) {
        selectedImage.remove();
        setSelectedImage(null);
        updateFormData();
      }
    };

    document.addEventListener('mousedown', handleClickOutsideImage);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideImage);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  // Track font size changes in editor - FIXED
  const updateCurrentFontSize = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    let element = null;
    if (selection.isCollapsed) {
      element = selection.anchorNode.nodeType === Node.TEXT_NODE
        ? selection.anchorNode.parentElement
        : selection.anchorNode;
    } else {
      const range = selection.getRangeAt(0);
      element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement
        : range.commonAncestorContainer;
    }

    // Traverse up to find an element with a font size
    while (element && element !== bodyEditorRef.current) {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize);

      if (!isNaN(fontSize) && fontSize > 0) {
        setCurrentFontSize(fontSize);
        return;
      }

      element = element.parentElement;
    }

    // Default to 16px if no font size found
    setCurrentFontSize(16);
  };

  // Rich text editor functions
  const execCommand = (command, value = null) => {
    if (bodyEditorRef.current) {
      bodyEditorRef.current.focus();

      // Handle image-specific alignment
      if (selectedImage && (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight')) {
        handleImageAlignment(command);
        return;
      }

      document.execCommand(command, false, value);
      updateFormData();
      setTimeout(updateCurrentFontSize, 10);
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

  // ENHANCED: Improved image alignment with position modes
  const handleImageAlignment = (alignment) => {
    if (!selectedImage) return;

    // Clear all positioning styles first
    selectedImage.style.position = '';
    selectedImage.style.left = '';
    selectedImage.style.top = '';
    selectedImage.style.zIndex = '';
    selectedImage.style.float = '';
    selectedImage.style.margin = '10px 0';
    selectedImage.style.display = 'block';
    selectedImage.style.shapeOutside = 'none';
    selectedImage.style.shapeMargin = '0px';

    // Remove existing alignment classes
    selectedImage.classList.remove('img-left', 'img-center', 'img-right', 'img-inline', 'img-free',
      'img-behind', 'img-front', 'img-tight');

    switch (alignment) {
      case 'justifyLeft':
        selectedImage.classList.add('img-left');
        selectedImage.style.float = 'left';
        selectedImage.style.marginRight = '15px';
        selectedImage.style.marginLeft = '0';
        selectedImage.style.display = 'block';
        break;
      case 'justifyCenter':
        selectedImage.classList.add('img-center');
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
        selectedImage.style.display = 'block';
        break;
      case 'justifyRight':
        selectedImage.classList.add('img-right');
        selectedImage.style.float = 'right';
        selectedImage.style.marginLeft = '15px';
        selectedImage.style.marginRight = '0';
        selectedImage.style.display = 'block';
        break;
    }
    setImagePositionMode('flow');
    setTextWrapMode('inline');
    updateFormData();
  };
  // NEW: Set text wrapping mode
  const setImageTextWrapMode = (mode) => {
    if (!selectedImage) return;

    // Clear previous wrap styles
    selectedImage.style.zIndex = '';
    selectedImage.style.position = '';
    selectedImage.style.float = '';
    selectedImage.style.shapeOutside = 'none';

    // Remove existing wrap classes
    selectedImage.classList.remove('img-behind', 'img-front', 'img-tight', 'img-inline');

    switch (mode) {
      case 'behind':
        // Behind text
        selectedImage.classList.add('img-behind');
        selectedImage.style.zIndex = '-1';
        selectedImage.style.position = 'relative';
        break;
      case 'front':
        // In front of text
        selectedImage.classList.add('img-front');
        selectedImage.style.zIndex = '10';
        selectedImage.style.position = 'relative';
        break;
      case 'tight':
        // Tight wrapping (text flows around image shape)
        selectedImage.classList.add('img-tight');
        selectedImage.style.float = 'left';
        selectedImage.style.shapeOutside = `url(${selectedImage.src})`;
        selectedImage.style.shapeMargin = '12px';
        break;
      case 'inline':
      default:
        // In line with text (default)
        selectedImage.classList.add('img-inline');
        selectedImage.style.display = 'inline-block';
        selectedImage.style.verticalAlign = 'middle';
        selectedImage.style.margin = '0 8px';
        break;
    }

    setTextWrapMode(mode);
    updateFormData();
  };

  const enableFreePositioning = () => {
    if (!selectedImage) return;

    const editorRect = bodyEditorRef.current.getBoundingClientRect();
    const imageRect = selectedImage.getBoundingClientRect();

    // Calculate relative position
    const relativeX = imageRect.left - editorRect.left;
    const relativeY = imageRect.top - editorRect.top;

    // Clear float and other styles
    selectedImage.style.float = '';
    selectedImage.style.margin = '0';
    selectedImage.style.shapeOutside = 'none';

    // Set absolute positioning
    selectedImage.style.position = 'absolute';
    selectedImage.style.left = relativeX + 'px';
    selectedImage.style.top = relativeY + 'px';
    selectedImage.style.zIndex = '5'; // Middle z-index for free positioning
    selectedImage.classList.add('img-free');

    setImagePositionMode('free');
    setTextWrapMode('front'); // Free positioning defaults to in front of text
    updateFormData();
  };

  // NEW: Switch back to flow positioning
  const enableFlowPositioning = () => {
    if (!selectedImage) return;

    selectedImage.style.position = '';
    selectedImage.style.left = '';
    selectedImage.style.top = '';
    selectedImage.style.zIndex = '';
    selectedImage.style.margin = '10px 0';
    selectedImage.classList.remove('img-free');

    setImagePositionMode('flow');
    updateFormData();
  };

  // ENHANCED: Make image inline for side-by-side text flow
  const makeImageInline = () => {
    if (!selectedImage) return;

    // Clear positioning
    selectedImage.style.position = '';
    selectedImage.style.left = '';
    selectedImage.style.top = '';
    selectedImage.style.zIndex = '';

    // Make inline
    selectedImage.style.display = 'inline-block';
    selectedImage.style.verticalAlign = 'top';
    selectedImage.style.margin = '0 10px 10px 0';
    selectedImage.style.float = 'left';
    selectedImage.classList.add('img-inline');
    setImagePositionMode('flow');
    updateFormData();
  };

  const handleColorChange = (color) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  // Improved font size functions - FIXED
  const applyFontSize = (size) => {
    const selection = window.getSelection();

    if (selection.rangeCount === 0 || selection.isCollapsed) {
      // If no selection or collapsed, just change the default style for new text
      document.execCommand('fontSize', false, 7); // This creates a font tag with size 7

      // Find the font tag and change its size
      setTimeout(() => {
        const fontTags = bodyEditorRef.current.querySelectorAll('font');
        if (fontTags.length > 0) {
          const lastFontTag = fontTags[fontTags.length - 1];
          lastFontTag.removeAttribute('size');
          lastFontTag.style.fontSize = size + 'px';
        }
        updateCurrentFontSize();
        updateFormData();
      }, 10);
    } else {
      // For selection, wrap in span with font size
      const span = document.createElement('span');
      span.style.fontSize = size + 'px';

      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      span.appendChild(selectedContent);
      range.insertNode(span);

      // Update selection to the new span
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);

      setCurrentFontSize(size);
      updateFormData();
    }
  };

  const handleFontSizeIncrease = () => {
    const increment = currentFontSize >= 100 ? 10 : (currentFontSize >= 50 ? 5 : (currentFontSize >= 24 ? 4 : (currentFontSize >= 18 ? 2 : 1)));
    const newSize = Math.min(200, currentFontSize + increment); // Max 200px
    applyFontSize(newSize);
  };

  const handleFontSizeDecrease = () => {
    const decrement = currentFontSize > 100 ? 10 : (currentFontSize > 50 ? 5 : (currentFontSize > 24 ? 4 : (currentFontSize > 18 ? 2 : 1)));
    const newSize = Math.max(8, currentFontSize - decrement); // Min 8px
    applyFontSize(newSize);
  };

  const handleImageInsert = async (imageUrl) => {
    if (!bodyEditorRef.current || !imageUrl) return;

    try {
      // Create image element with proper styling for text flow
      const img = document.createElement('img');
      img.src = imageUrl;
      img.className = 'editor-image';
      img.style.maxWidth = '400px';
      img.style.height = 'auto';
      img.style.margin = '10px 0';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      img.style.cursor = 'pointer';
      img.style.display = 'block';
      img.draggable = false;
      img.contentEditable = false;

      // Add interaction handlers
      setupImageInteraction(img);

      // Insert at cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a new paragraph after image for better text flow
        const p = document.createElement('p');
        p.appendChild(document.createElement('br'));

        // Insert image then paragraph
        range.insertNode(p);
        range.insertNode(img);

        // Move cursor to paragraph
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.setEnd(p, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        bodyEditorRef.current.appendChild(img);
        const p = document.createElement('p');
        p.appendChild(document.createElement('br'));
        bodyEditorRef.current.appendChild(p);
      }

      updateFormData();

    } catch (error) {
      console.error('Error inserting image:', error);
      setErrors({ submit: 'Failed to insert image' });
    }
  };

  // Enhanced image interaction setup with Word-like dragging - FIXED
  const setupImageInteraction = (img) => {
    // Click to select
    img.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Remove selection from other images
      const allImages = bodyEditorRef.current.querySelectorAll('.editor-image');
      allImages.forEach(otherImg => {
        otherImg.classList.remove('selected');
        otherImg.style.outline = '';
      });

      // Select current image
      img.classList.add('selected');
      img.style.outline = '3px solid #3B82F6';
      setSelectedImage(img);

      // Determine current position mode
      if (img.style.position === 'absolute') {
        setImagePositionMode('free');
      } else {
        setImagePositionMode('flow');
      }
    };

    // Enhanced drag functionality for free positioning - FIXED
    let isDragging = false;
    let startX, startY, initialX, initialY;

    img.onmousedown = (e) => {
      // Always allow dragging when image is selected
      if (selectedImage === img) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        setIsDraggingImage(true);

        startX = e.clientX;
        startY = e.clientY;

        const editorRect = bodyEditorRef.current.getBoundingClientRect();
        const editorScrollTop = bodyEditorRef.current.scrollTop;
        const editorScrollLeft = bodyEditorRef.current.scrollLeft;

        if (img.style.position === 'absolute') {
          // Already in free mode, just update position
          initialX = parseInt(img.style.left) || 0;
          initialY = parseInt(img.style.top) || 0;
        } else {
          // Switch to free positioning mode
          const imgRect = img.getBoundingClientRect();
          initialX = imgRect.left - editorRect.left + editorScrollLeft;
          initialY = imgRect.top - editorRect.top + editorScrollTop;

          // Enable free positioning
          img.style.position = 'absolute';
          img.style.left = initialX + 'px';
          img.style.top = initialY + 'px';
          img.style.zIndex = '10';
          img.style.float = '';
          img.style.margin = '0';
          img.classList.add('img-free');
          setImagePositionMode('free');
        }

        // Add dragging cursor
        img.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        const handleMouseMove = (moveEvent) => {
          if (!isDragging) return;

          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;

          let newX = initialX + deltaX;
          let newY = initialY + deltaY;

          // Keep image within editor bounds (more generous bounds)
          const editorRect = bodyEditorRef.current.getBoundingClientRect();
          const imgWidth = img.offsetWidth;
          const imgHeight = img.offsetHeight;

          // Allow images to go slightly outside the editor for better positioning
          newX = Math.max(-imgWidth / 2, Math.min(editorRect.width - imgWidth / 2, newX));
          newY = Math.max(-imgHeight / 2, Math.min(editorRect.height - imgHeight / 2, newY));

          img.style.left = newX + 'px';
          img.style.top = newY + 'px';
        };

        const handleMouseUp = () => {
          isDragging = false;
          setIsDraggingImage(false);
          img.style.cursor = 'pointer';
          document.body.style.userSelect = '';
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          updateFormData();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      } else {
        // If not selected, just select it
        img.onclick(e);
      }
    };

    // Hover effects
    img.onmouseenter = () => {
      if (img !== selectedImage) {
        img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        img.style.transform = 'scale(1.02)';
        img.style.transition = 'all 0.2s ease';
      }
    };

    img.onmouseleave = () => {
      if (img !== selectedImage) {
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        img.style.transform = 'scale(1)';
      }
    };
  };

  // Enhanced resize handlers
  const handleImageResize = (dimension, delta) => {
    if (!selectedImage) return;

    const currentWidth = parseInt(selectedImage.style.width) || selectedImage.offsetWidth;
    const currentHeight = parseInt(selectedImage.style.height) || selectedImage.offsetHeight;

    if (dimension === 'width') {
      const newWidth = Math.max(100, Math.min(800, currentWidth + delta));
      selectedImage.style.width = newWidth + 'px';
      selectedImage.style.maxWidth = 'none';
    } else if (dimension === 'height') {
      const newHeight = Math.max(100, Math.min(600, currentHeight + delta));
      selectedImage.style.height = newHeight + 'px';
    } else if (dimension === 'both') {
      const ratio = currentHeight / currentWidth;
      const newWidth = Math.max(100, Math.min(800, currentWidth + delta));
      const newHeight = newWidth * ratio;
      selectedImage.style.width = newWidth + 'px';
      selectedImage.style.height = newHeight + 'px';
      selectedImage.style.maxWidth = 'none';
    }

    updateFormData();
  };

  // Reset image to original aspect ratio
  const resetImageAspectRatio = () => {
    if (!selectedImage) return;

    selectedImage.style.width = '';
    selectedImage.style.height = 'auto';
    selectedImage.style.maxWidth = '400px';
    updateFormData();
  };

  const handleLinkInsert = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleLinkRemove = () => execCommand('unlink');

  // Handle paste events
  const handleBodyEditorPaste = async (e) => {
    e.preventDefault();

    // Handle text paste
    const textPaste = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (textPaste) {
      document.execCommand('insertText', false, textPaste);
      updateFormData();
      setTimeout(updateCurrentFontSize, 50);
      return;
    }

    // Handle image paste
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
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
        case '=':
        case '+':
          e.preventDefault();
          handleFontSizeIncrease();
          break;
        case '-':
          e.preventDefault();
          handleFontSizeDecrease();
          break;
      }
    }

    if (e.key === 'Enter') {
      setTimeout(() => {
        updateFormData();
        updateCurrentFontSize();
      }, 10);
    }
  };

  const handleBodyEditorInput = (e) => {
    const content = e.target.innerHTML;
    setFormData(prev => ({
      ...prev,
      body: content
    }));
    setTimeout(updateCurrentFontSize, 10);
  };

  // Click outside to close pickers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize rich text editor content when editing
  useEffect(() => {
    if (isEditMode && editingNews?.body && bodyEditorRef.current) {
      bodyEditorRef.current.innerHTML = editingNews.body;

      // Add click handlers to existing images
      setTimeout(() => {
        const images = bodyEditorRef.current.querySelectorAll('img');
        images.forEach(img => {
          img.className = 'editor-image';
          setupImageInteraction(img);
        });
        updateCurrentFontSize();
      }, 100);
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

    if (submissionState.current.isSubmitting || isUploadingImage) {
      console.log('Submission blocked - already processing');
      return;
    }

    if (!validateForm()) {
      return;
    }

    submissionState.current.isSubmitting = true;
    submissionState.current.lastSubmissionTime = Date.now();
    setLocalLoading(true);

    if (submissionState.current.abortController) {
      submissionState.current.abortController.abort();
    }

    submissionState.current.abortController = new AbortController();

    try {
      if (!currentProfile?.uid) {
        throw new Error('User profile not found - cannot create/update news');
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication found');
      }

      const bodyContent = bodyEditorRef.current ? bodyEditorRef.current.innerHTML.trim() : formData.body;

      const newsData = {
        title: formData.title.trim(),
        body: bodyContent,
        urls: '',
        createdBy: currentProfile.uid
      };

      let response;

      if (isEditMode) {
        response = await axios.put(
          `https://internalApi.sequoia-print.com/api/news/${editingNews.id}`,
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await axios.post(
          'https://internalApi.sequoia-print.com/api/news',
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      const resultNews = response.data?.data || response.data;

      if (!isEditMode) {
        setFormData({
          title: '',
          body: ''
        });
        if (bodyEditorRef.current) {
          bodyEditorRef.current.innerHTML = '';
        }
      }

      if (isEditMode && onNewsUpdated) {
        onNewsUpdated(resultNews);
      } else if (!isEditMode && onNewsAdded) {
        onNewsAdded(resultNews);
      }

      if (onClose) onClose();

    } catch (error) {
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
      submissionState.current.isSubmitting = false;
      submissionState.current.abortController = null;
      setLocalLoading(false);
    }
  };

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

  // Render image controls
  const renderImageControls = () => {
    if (!selectedImage) return null;

    return (
      <div className="image-controls fixed bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-[1001]"
        style={{
          top: '10px',
          right: '10px',
          minWidth: '280px'
        }}>
        <h4 className="text-sm font-semibold mb-3 text-gray-800">Image Controls</h4>

        <div className="space-y-3">
          {/* Size Controls */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">Resize Image</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleImageResize('width', 50)}
                  className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="Increase Width"
                >
                  <Plus size={10} className="inline mr-1" />W
                </button>
                <button
                  type="button"
                  onClick={() => handleImageResize('width', -50)}
                  className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="Decrease Width"
                >
                  <Minus size={10} className="inline mr-1" />W
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleImageResize('height', 50)}
                  className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  title="Increase Height"
                >
                  <Plus size={10} className="inline mr-1" />H
                </button>
                <button
                  type="button"
                  onClick={() => handleImageResize('height', -50)}
                  className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  title="Decrease Height"
                >
                  <Minus size={10} className="inline mr-1" />H
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={resetImageAspectRatio}
              className="w-full px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              title="Reset to Original Size"
            >
              <RotateCcw size={12} className="inline mr-1" />
              Reset Size
            </button>
          </div>

          {/* Position Mode Controls */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">Position Mode</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={enableFlowPositioning}
                className={`px-3 py-2 text-xs rounded transition-colors ${imagePositionMode === 'flow'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Flow with Text"
              >
                Flow
              </button>
              <button
                type="button"
                onClick={enableFreePositioning}
                className={`px-3 py-2 text-xs rounded transition-colors ${imagePositionMode === 'free'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Free Positioning"
              >
                Free
              </button>
            </div>
          </div>

          {/* Text Wrapping Controls */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">Text Wrapping</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImageTextWrapMode('inline')}
                className={`px-3 py-2 text-xs rounded transition-colors ${textWrapMode === 'inline'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Inline with Text"
              >
                Inline
              </button>
              <button
                type="button"
                onClick={() => setImageTextWrapMode('tight')}
                className={`px-3 py-2 text-xs rounded transition-colors ${textWrapMode === 'tight'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Tight Wrapping"
              >
                Tight
              </button>
              <button
                type="button"
                onClick={() => setImageTextWrapMode('behind')}
                className={`px-3 py-2 text-xs rounded transition-colors ${textWrapMode === 'behind'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="Behind Text"
              >
                Behind
              </button>
              <button
                type="button"
                onClick={() => setImageTextWrapMode('front')}
                className={`px-3 py-2 text-xs rounded transition-colors ${textWrapMode === 'front'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title="In Front of Text"
              >
                Front
              </button>
            </div>
          </div>

          {/* Alignment Controls */}
          {imagePositionMode === 'flow' && (
            <div>
              <label className="block text-xs text-gray-600 mb-2">Alignment</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleImageAlignment('justifyLeft')}
                  className="flex-1 p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="Align Left"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleImageAlignment('justifyCenter')}
                  className="flex-1 p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="Align Center"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleImageAlignment('justifyRight')}
                  className="flex-1 p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="Align Right"
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => {
              selectedImage.remove();
              setSelectedImage(null);
              updateFormData();
            }}
            className="w-full px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            title="Delete Image"
          >
            Delete Image
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-yellow-400">
          <h2 className="text-xl mx-auto font-semibold text-white">
            {isEditMode ? 'Edit News' : 'Create News'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>


        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter news title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
          </div>

          {/* Rich Text Editor Toolbar */}
          <div className="border-b bg-gray-50 p-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Font Size Controls */}
              <div className="flex items-center border rounded-md bg-white">
                <button
                  type="button"
                  onClick={handleFontSizeDecrease}
                  className="p-1 hover:bg-gray-100 rounded-l"
                  title="Decrease Font Size"
                >
                  <Minus size={16} />
                </button>
                <div className="px-2 py-1 text-sm min-w-[40px] text-center border-x">
                  {currentFontSize}px
                </div>
                <button
                  type="button"
                  onClick={handleFontSizeIncrease}
                  className="p-1 hover:bg-gray-100 rounded-r"
                  title="Increase Font Size"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Text Formatting */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBold}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleItalic}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleUnderline}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAlignLeft}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleAlignCenter}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleAlignRight}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBulletList}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNumberedList}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
              </div>

              {/* Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                  title="Text Color"
                >
                  <Type size={16} />
                  <Palette size={14} />
                </button>
                {showColorPicker && (
                  <div
                    ref={colorPickerRef}
                    className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10"
                    style={{ width: '200px' }}
                  >
                    <div className="grid grid-cols-8 gap-1">
                      {textColors.map((color) => (
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
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleLinkInsert}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Insert Link"
                >
                  <Link size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleLinkRemove}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Remove Link"
                >
                  <Unlink size={16} />
                </button>
              </div>

              {/* Image Upload */}
              {/* <div className="flex items-center gap-1">
                <PhotoUploader
                  onUploadComplete={handleImageInsert}
                  onUploadStart={() => setIsUploadingImage(true)}
                  onUploadEnd={() => setIsUploadingImage(false)}
                  buttonText="Insert Image"
                  buttonIcon={<Image size={16} />}
                  buttonClassName="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                />
              </div> */}
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body *
              </label>
              <div
                ref={bodyEditorRef}
                className={`min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto ${errors.body ? 'border-red-500' : 'border-gray-300'
                  }`}
                contentEditable
                onPaste={handleBodyEditorPaste}
                onKeyDown={handleBodyEditorKeyDown}
                onInput={handleBodyEditorInput}
                onMouseUp={updateCurrentFontSize}
                onKeyUp={updateCurrentFontSize}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ position: 'relative' }}
              />
              {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Created by: {fullName}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={localLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={localLoading || isUploadingImage}
              >
                {localLoading ? 'Processing...' : isEditMode ? 'Update News' : 'Create News'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Controls Panel */}
      {renderImageControls()}

      {/* Loading Overlay */}
      {(localLoading || isUploadingImage) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1002]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">
              {isUploadingImage ? 'Uploading image...' : 'Processing...'}
            </span>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-[1002]">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errors.submit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEditNews;