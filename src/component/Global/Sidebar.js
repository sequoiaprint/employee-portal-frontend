import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/auth/auth';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // md breakpoint
      
      // Keep collapsed on all screen sizes initially
      // Remove auto-open behavior for desktop
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

const handleLogout = async () => {
  try {
    await dispatch(logout()).unwrap();
    navigate('/login');
    window.location.reload();
  } catch (error) {
    console.error('Logout failed:', error);
  }
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
      id: '',
      label: 'News',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/news.png" 
          alt="news" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/news'
    },
    {
      id: 'Insights',
      label: 'Insights',
      icon: (
        <img 
          src="https://img.icons8.com/avantgarde/100/combo-chart.png" 
          alt="Insights" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/insights'
    },
    {
      id: 'Clients',
      label: 'Clients',
      icon: (
        <img 
          src="https://img.icons8.com/dusk/64/administrator-male.png" 
          alt="reports" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/clients'
    },
    {
      id: 'Projects',
      label: 'Projects',
      icon: (
        <img 
          src="https://img.icons8.com/pulsar-color/48/project.png" 
          alt="reports" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/projects'
    },
    {
      id: 'HR',
      label: 'HR Hub',
      icon: (
        <img 
          src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-consulting-human-resources-flaticons-lineal-color-flat-icons.png" 
          alt="reports" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/hr'
    },
    {
      id: 'All Resources',
      label: 'Resources',
      icon: (
        <img 
          src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-links-live-streaming-flaticons-lineal-color-flat-icons-2.png" 
          alt="settings" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/resources'
    },
    {
      id: 'Manage',
      label: 'Root Managment',
      icon: (
        <img 
          src="https://img.icons8.com/stickers/100/admin-settings-male.png" 
          alt="settings" 
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      ),
      path: '/manage'
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
          className="p-2.5 bg-[#eb772b] rounded-xl shadow-lg hover:shadow-xl hover:bg-[#eb772b] transition-all duration-300 border border-gray-200 transform hover:scale-105 backdrop-blur-sm bg-[#eb772b]/95"
        >
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
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
        <div className="p-4 border-b pl-[22%] border-gray-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" 
              alt="Sequoia Print Logo" 
              className="h-12 w-auto object-contain"
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
            className="w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-md text-sm font-medium"
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