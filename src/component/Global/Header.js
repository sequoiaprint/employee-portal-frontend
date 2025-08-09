import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ isSidebarCollapsed }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/employees':
        return 'Employees';
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

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side - Page Title with proper spacing */}
        <div className={`flex items-center transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-0 md:ml-4' : 'ml-0 md:ml-64 lg:ml-72'
        }`}>
          {/* Page Title */}
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Welcome message and Profile */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Welcome message */}
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
            </div>
          </div>

          {/* Profile Picture with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-white"
            >
              <span className="text-sm font-bold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
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
    </header>
  );
};

export default Header;