import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProfile } from '../../redux/profile/profile'; // Import the profile action
import Cookies from 'js-cookie';

const Header = ({ isSidebarCollapsed }) => {
  const { user } = useSelector((state) => state.auth);
  const { currentProfile, loading } = useSelector((state) => state.profile); // Get profile data
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const fullName = currentProfile ? `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim() : user?.name || '';
  // Fetch profile data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      // Only fetch if we don't have profile data or it's for a different user
      if (!currentProfile || currentProfile.uid !== user.uid) {
        dispatch(fetchProfile(user.uid));
      }
    }
  }, [dispatch, user?.uid]);

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'DASHBOARD';
      case '/news':
        return 'News';
      case '/projects':
        return 'Projects';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/routing':
        return 'Routing';
      case '/profile':
        return 'Profile';
      default:
        return 'Dashboard';
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  // Get profile picture or initials
  const getProfileDisplay = () => {
    if (currentProfile?.profilepicurl) {
      return (
        <img
          src={currentProfile.profilepicurl}
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

  return (
    <header className="bg-[#eb772b] shadow-lg border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="h-20 px-4 sm:px-6">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col justify-center h-full">
          {/* Top row with menu, logo, profile */}
          <div className="flex items-center justify-between mb-1">
            {/* Left - Hamburger menu */}
            <div className="flex items-center">
              <button className="p-2 rounded-lg border-2 border-white/20 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center - Logo only */}
            <div className="flex items-center bg-white mr-[3%] p-1.5 rounded-[20px]"  onClick={() => navigate('/')}>
              <img
                src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png"
                alt="Sequoia Print Logo"
                className="h-5 w-auto object-contain"
              />
            </div>

            {/* Right - Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-white"
              >
                {getProfileDisplay()}
              </button>
              {/* Mobile Profile Dropdown */}
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
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom row - Page Title */}
          <div className="text-center">
            <h1 className="text-[9px] text-white font-bold">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between h-full">
          {/* Left side - Logo with proper spacing */}
          <div className={`flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'ml-0 md:ml-4' : 'ml-0 md:ml-14 lg:ml-22'
            }`}>
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

          {/* Center - Page Title */}
          <h1 className="text-[8px] tracking-widest sm:text-[9px] md:text-[14px] lg:text-[18px] xl:text-[20px] 2xl:text-[24px] text-white font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>

          {/* Right side - Welcome message and Profile */}
          <div className="flex items-center space-x-6">
            {/* Welcome message */}
            <div className="hidden lg:block text-right">
              <p className="text-sm text-white">Welcome back,</p>
              <p className="text-sm font-semibold text-white">
                {fullName || 'User'}
              </p>
            </div>

            {/* Profile Picture with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-white"
              >
                {getProfileDisplay()}
              </button>
              {/* Desktop Profile Dropdown */}
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
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Settings
                  </button>
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