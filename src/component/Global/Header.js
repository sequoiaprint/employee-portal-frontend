import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProfile, initializeProfileFromStorage } from '../../redux/profile/profile';
import Cookies from 'js-cookie';
import {ClipboardList } from 'lucide-react';
import TodoList from './TodoList';

// Move these helper functions outside the component to avoid recreation
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
  if (!encryptedToken) {
    return null;
  }

  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }

  return token;
};

const getUserUid = () => {
  const encryptedUserUid = Cookies.get('userUid');
  if (!encryptedUserUid) {
    return null;
  }

  const userUid = encryptedUserUid;
  if (!userUid) {
    console.warn('Failed to decrypt user UID');
    return null;
  }

  return userUid;
};

const Header = ({ isSidebarCollapsed }) => {
  const { user } = useSelector((state) => state.auth);
  const { currentProfile, loading } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showTodoDropdown, setShowTodoDropdown] = useState(false);
  const [remainingCount, setRemainingCount] = useState(0);

  // Initialize profile from storage on first render
  useEffect(() => {
    const initializeProfile = async () => {
      // First try to load from storage
      await dispatch(initializeProfileFromStorage());
      
      // If we have a user but no profile, fetch fresh data
      if (user?.uid && !currentProfile?.uid) {
        console.log('User exists but profile missing, fetching...');
        try {
          const result = await dispatch(fetchProfile(user.uid));
          if (fetchProfile.rejected.match(result)) {
            console.error('Profile fetch failed:', result.error);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      }
    };

    initializeProfile();
  }, [dispatch, user?.uid]);

  // Fetch remaining tasks count independently
  useEffect(() => {
    const fetchRemainingCount = async () => {
      try {
        const userUid = getUserUid();
        if (!userUid) return;
        
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch(`https://internalApi.sequoia-print.com/api/assignment/assigned-person/${userUid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch tasks for count');
          return;
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Count incomplete tasks
          const remaining = data.filter(item => item.isCompleted !== 1).length;
          setRemainingCount(remaining);
        }
        
      } catch (err) {
        console.error("Error fetching remaining count:", err);
      }
    };

    // Fetch count on component mount
    fetchRemainingCount();

    // Optionally refresh count every 5 minutes
    const interval = setInterval(fetchRemainingCount, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/': return 'DASHBOARD';
      case '/news': return 'News';
      case '/insights': return 'Insights';
      case '/hr': return 'Hr Hub';
      case '/manage': return 'Manage';
      case '/routing': return 'Routing';
      case '/profile': return 'Profile';
      case '/clients': return 'Clients';
      case '/projects': return 'Projects';
      case '/assignment': return 'Assignment';
      default: return 'Dashboard';
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  const userDisplayData = currentProfile || user || {};
  const fullName = currentProfile 
    ? `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim() 
    : user?.name || '';
  const email = currentProfile?.email || user?.email || 'user@example.com';

  const getProfileDisplay = () => {
    if (userDisplayData?.profilepicurl) {
      return (
        <img
          src={userDisplayData.profilepicurl}
          alt="Profile"
          className="h-full w-full rounded-full object-cover"
        />
      );
    }
    return (
      <span className="text-sm font-bold text-white">
        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
      </span>
    );
  };

  // Handle todo dropdown with count refresh
  const handleTodoClick = () => {
    setShowTodoDropdown(!showTodoDropdown);
  };

  // Handle count updates from TodoList when it's open
  const handleRemainingChange = (count) => {
    setRemainingCount(count);
  };

  return (
    <header className="bg-[#eb772b] shadow-lg border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm">
      <div className="h-20 px-4 sm:px-6">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col justify-center h-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <button className="p-2 rounded-lg border-2 border-white/20 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center bg-white mr-[3%] p-1.5 rounded-[20px]" onClick={() => navigate('/')}>
              <img
                src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png"
                alt="Sequoia Print Logo"
                className="h-5 w-auto object-contain"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-white"
              >
                {getProfileDisplay()}
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{fullName || 'User'}</p>
                    <p className="text-xs text-gray-500">{currentProfile?.email || user?.email || 'user@example.com'}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    View Profile
                  </button>
                  {/* <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Settings
                  </button> */}
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-[9px] text-white font-bold">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between h-full">
          <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'ml-0 md:ml-4' : 'ml-0 md:ml-14 lg:ml-22'}`}>
            <div
              className="flex items-center bg-white p-2 rounded-[25px] cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img
                src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png"
                alt="Sequoia Print Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>

          <h1 className="text-[8px] tracking-widest sm:text-[9px] md:text-[14px] lg:text-[18px] xl:text-[20px] 2xl:text-[24px] text-white font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <button
                className="text-white flex flex-row items-center relative"
                onClick={handleTodoClick}
              >
                <ClipboardList size={30} />
                
                {/* Badge for remaining count - now always shows if there are remaining tasks */}
                {remainingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {remainingCount}
                  </span>
                )}
              </button>

              {showTodoDropdown && (
                <div className="absolute right-0 mt-2 z-50">
                  <TodoList onRemainingChange={handleRemainingChange} />
                </div>
              )}
            </div>
            
            <div className="hidden lg:block text-right">
              <p className="text-sm text-white">Welcome back,</p>
              <p className="text-sm font-semibold text-white">
                {fullName || 'User'}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-white"
              >
                {getProfileDisplay()}
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentProfile?.email || user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    View Profile
                  </button>
                  {/* <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Settings
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;