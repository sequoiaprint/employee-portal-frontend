import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/auth/auth';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // md breakpoint
      
      // Auto-collapse on mobile and tablet
      if (width < 1024) { // lg breakpoint
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/dashboard-layout.png" 
          alt="dashboard" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/group.png" 
          alt="employees" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/employees'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/project-management.png" 
          alt="projects" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/projects'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/bar-chart.png" 
          alt="reports" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/settings.png" 
          alt="settings" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/settings'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Toggle Button - Positioned to avoid header collision */}
      <div className={`fixed top-4 z-50 transition-all duration-500 ease-in-out ${
        isCollapsed ? 'left-4 opacity-100' : 'left-64 md:left-72 opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={toggleSidebar}
          className="p-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 transform hover:scale-105 backdrop-blur-sm bg-white/95"
        >
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <div className="w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300"></div>
          </div>
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-500 ease-in-out z-40 ${
          !isCollapsed ? 'opacity-50 bg-opacity-50' : 'opacity-0 pointer-events-none bg-opacity-0'
        } lg:opacity-0 lg:pointer-events-none`} 
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-50 transition-all duration-500 ease-in-out transform ${
        !isCollapsed ? 'translate-x-0' : '-translate-x-full'
      } w-64 md:w-72`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" 
              alt="Sequoia Print Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            <img 
              src="https://img.icons8.com/fluency/48/delete-sign.png" 
              alt="close" 
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActiveRoute(item.path)
                      ? 'bg-gradient-to-r from-orange-100 to-orange-50 shadow-md border-l-4 border-orange-500'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                  }`}
                  style={{ color: '#EA7125' }}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-md text-sm font-medium"
          >
            <img 
              src="https://img.icons8.com/fluency/48/exit.png" 
              alt="logout" 
              className="w-5 h-5"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;