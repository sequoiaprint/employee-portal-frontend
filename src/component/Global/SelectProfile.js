import React, { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';
import Cookies from 'js-cookie';

// Token decryption
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
  const encryptedToken = Cookies.get('authToken');
  if (!encryptedToken) return null;
  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }
  return token;
};

const UserSelect = ({ value, onChange, disabled = false, showUsernameOnly = false }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch profiles from API
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch('https://internalApi.sequoia-print.com/api/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const response_data = await response.json();
      const profilesArray = response_data.data || [];
      setProfiles(Array.isArray(profilesArray) ? profilesArray : []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (profile) => {
    onChange(profile.uid, profile);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayName = (profile) => {
    if (showUsernameOnly) {
      return profile.username || profile.uid;
    }
    return [profile.firstname, profile.lastname].filter(Boolean).join(' ') || 
           profile.username || 
           profile.uid;
  };

  // Filter profiles based on search term
  const getFilteredProfiles = () => {
    if (!Array.isArray(profiles) || !searchTerm) {
      return Array.isArray(profiles) ? profiles : [];
    }
    
    return profiles.filter(profile => {
      const displayName = getDisplayName(profile);
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const filteredProfiles = getFilteredProfiles();
  const selectedProfile = Array.isArray(profiles) ? profiles.find(p => p.uid === value) : null;
  const selectedDisplayName = selectedProfile ? getDisplayName(selectedProfile) : '';

  // For better UX during loading
  if (loading) {
    return (
      <div className="w-full p-2 border rounded bg-gray-100 flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
        <span className="text-gray-600">Loading employees...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-2 border rounded bg-red-50 text-red-500 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={fetchProfiles}
          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected value display / trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`w-full p-2 border rounded text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-orange-300 cursor-pointer'
        } ${isOpen ? 'border-orange-500' : 'border-gray-300'}`}
      >
        <span className={selectedDisplayName ? 'text-gray-900' : 'text-gray-500'}>
          {selectedDisplayName || 'Select a user'}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredProfiles.length > 0 ? (
              <>
                {/* Clear selection option */}
                {value && (
                  <button
                    type="button"
                    onClick={() => handleSelect({ uid: '', username: '' })}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                  >
                    Clear selection
                  </button>
                )}
                
                {/* User options */}
                {filteredProfiles.map((profile) => (
                  <button
                    key={profile.uid}
                    type="button"
                    onClick={() => handleSelect(profile)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-orange-50 flex items-center ${
                      profile.uid === value ? 'bg-orange-100 text-orange-700' : 'text-gray-700'
                    }`}
                  >
                    <User size={14} className="mr-2 text-gray-400" />
                    <span>{getDisplayName(profile)}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelect;