import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/auth/auth';
import Cookies from 'js-cookie';
import { getStoredCredentials } from '../../redux/auth/auth';
import { 
  Github, 
  Download, 
  LogIn,
  ExternalLink,
  Lock,
  AlertTriangle
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const role = Cookies.get('role');
  const isAdmin = role === "Admin Ops";
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // md breakpoint
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add blur effect to main content when sidebar is open
  useEffect(() => {
  const mainContent = document.getElementById('main-content'); // or whatever ID your main content has
    if (mainContent) {
      if (!isCollapsed) {
        mainContent.style.filter = 'blur(4px)';
        mainContent.style.transition = 'filter 0.3s ease';
      } else {
        mainContent.style.filter = 'none';
      }
    }
    
    // Cleanup function to remove blur when component unmounts
    return () => {
      if (mainContent) {
        mainContent.style.filter = 'none';
      }
    };
  }, [isCollapsed]);

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
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
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
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
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
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
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
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
        />
      ),
      path: '/clients'
    },
    {
      id: 'Assigments',
      label: 'Assigments',
      icon: (
        <img 
          src="https://img.icons8.com/pulsar-color/48/task.png" 
          alt="reports" 
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
        />
      ),
      path: '/assignment'
    },
    {
      id: 'Projects',
      label: 'Projects',
      icon: (
        <img 
          src="https://img.icons8.com/pulsar-color/48/project.png" 
          alt="reports" 
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
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
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
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
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
        />
      ),
      path: '/resources'
    },
    // Only show Root Management for admin users
    ...(isAdmin ? [{
      id: 'Manage',
      label: 'Root Managment',
      icon: (
        <img 
          src="https://img.icons8.com/stickers/100/admin-settings-male.png" 
          alt="settings" 
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5"
        />
      ),
      path: '/manage'
    }] : [])
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

  const cookieCredentials = getStoredCredentials();

  // Login URLs
  const loginUrl = cookieCredentials?.name && cookieCredentials?.password 
    ? `https://form.sequoia-print.com/Login?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
    : null;

  const localLoginUrl = cookieCredentials?.name && cookieCredentials?.password 
    ? `https://clientops.sequoia-print.com/?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
    : null;

  const handleAutoLogin = () => {
    if (loginUrl) {
      window.open(loginUrl, '_blank');
    }
  };

  const handleLocalLogin = () => {
    if (localLoginUrl) {
      window.open(localLoginUrl, '_blank');
    }
  };

  const handleLocalLoginAndNavigate = () => {
    window.open("https://sequoia-print.com", "_blank");
  };

  return (
    <>
      {/* Toggle Button - Positioned to avoid header collision */}
      <div className={`fixed top-3 z-50 transition-all duration-500 ease-in-out sm:top-4 md:top-4 lg:top-4 xl:top-4 2xl:top-4 ${
        isCollapsed ? 'left-3 opacity-100 sm:left-4 md:left-4 lg:left-4 xl:left-4 2xl:left-4' : 'left-60 opacity-0 pointer-events-none sm:left-64 md:left-72 lg:left-72 xl:left-72 2xl:left-72'
      }`}>
        <button
          onClick={toggleSidebar}
          className="p-2 bg-[#eb772b] rounded-lg shadow-lg hover:shadow-xl hover:bg-[#eb772b] transition-all duration-300 border border-gray-200 transform hover:scale-105 backdrop-blur-sm bg-[#eb772b]/95 sm:p-2.5 sm:rounded-xl md:p-2.5 md:rounded-xl lg:p-2.5 lg:rounded-xl xl:p-2.5 xl:rounded-xl 2xl:p-2.5 2xl:rounded-xl"
        >
          <div className="w-4 h-4 flex flex-col justify-center items-center space-y-0.5 sm:w-5 sm:h-5 sm:space-y-1 md:w-5 md:h-5 md:space-y-1 lg:w-5 lg:h-5 lg:space-y-1 xl:w-5 xl:h-5 xl:space-y-1 2xl:w-5 2xl:h-5 2xl:space-y-1">
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
          </div>
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-500 ease-in-out z-40 ${
          !isCollapsed ? 'opacity-50 bg-opacity-50 backdrop-blur-sm' : 'opacity-0 pointer-events-none bg-opacity-0'
        } md:opacity-0 md:pointer-events-none lg:opacity-0 lg:pointer-events-none xl:opacity-0 xl:pointer-events-none 2xl:opacity-0 2xl:pointer-events-none`} 
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-500 ease-in-out transform ${
        !isCollapsed ? 'translate-x-0' : '-translate-x-full'
      } w-60 sm:w-64 md:w-72 lg:w-72 xl:w-72 2xl:w-72 sm:shadow-2xl md:shadow-2xl lg:shadow-2xl xl:shadow-2xl 2xl:shadow-2xl`}>
        
        {/* Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between sm:p-4 md:p-4 lg:p-4 xl:p-4 2xl:p-4">
          <div className="flex items-center pl-[20%] sm:pl-[22%] md:pl-[22%] lg:pl-[22%] xl:pl-[22%] 2xl:pl-[22%]">
            <img 
              src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" 
              alt="Sequoia Print Logo" 
              className="h-10 w-auto object-contain sm:h-12 md:h-12 lg:h-12 xl:h-12 2xl:h-12"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300 sm:p-1.5 md:p-1.5 lg:p-1.5 xl:p-1.5 2xl:p-1.5"
          >
            <img 
              src="https://img.icons8.com/fluency/48/delete-sign.png" 
              alt="close" 
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5"
            />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 overflow-y-auto sm:p-4 md:p-4 lg:p-4 xl:p-4 2xl:p-4">
          <ul className="space-y-1.5 sm:space-y-2 md:space-y-2 lg:space-y-2 xl:space-y-2 2xl:space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 sm:space-x-3 sm:px-4 sm:py-3 sm:rounded-xl md:space-x-3 md:px-4 md:py-3 md:rounded-xl lg:space-x-3 lg:px-4 lg:py-3 lg:rounded-xl xl:space-x-3 xl:px-4 xl:py-3 xl:rounded-xl 2xl:space-x-3 2xl:px-4 2xl:py-3 2xl:rounded-xl ${
                    isActiveRoute(item.path)
                      ? 'bg-gradient-to-r from-orange-100 to-orange-50 shadow-sm border-l-3 border-orange-500 sm:shadow-md sm:border-l-4 md:shadow-md md:border-l-4 lg:shadow-md lg:border-l-4 xl:shadow-md xl:border-l-4 2xl:shadow-md 2xl:border-l-4'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                  }`}
                  style={{ color: '#EA7125' }}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 sm:p-6 md:p-6 lg:p-6 xl:p-6 2xl:p-6">
          {loginUrl ? (
            <>
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-3 lg:gap-3 xl:gap-3 2xl:gap-3">
                <button
                  onClick={handleAutoLogin}
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-xs sm:px-4 sm:py-3 sm:text-sm md:px-4 md:py-3 md:text-sm lg:px-4 lg:py-3 lg:text-sm xl:px-4 xl:py-3 xl:text-sm 2xl:px-4 2xl:py-3 2xl:text-sm"
                >
                  <span className="flex items-center">
                    <Lock className="h-3.5 w-3.5 mr-2 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4" />
                    Forms Portal
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4" />
                </button>
                
                {localLoginUrl && (
                  <button
                    onClick={handleLocalLogin}
                    className="flex items-center justify-between w-full px-3 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-xs sm:px-4 sm:py-3 sm:text-sm md:px-4 md:py-3 md:text-sm lg:px-4 lg:py-3 lg:text-sm xl:px-4 xl:py-3 xl:text-sm 2xl:px-4 2xl:py-3 2xl:text-sm"
                  >
                    <span className="flex items-center">
                      <Lock className="h-3.5 w-3.5 mr-2 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4" />
                      Client Portal
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4" />
                  </button>
                )}
                
                <button
                  onClick={handleLocalLoginAndNavigate}
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-xs sm:px-4 sm:py-3 sm:text-sm md:px-4 md:py-3 md:text-sm lg:px-4 lg:py-3 lg:text-sm xl:px-4 xl:py-3 xl:text-sm 2xl:px-4 2xl:py-3 2xl:text-sm"
                >
                  <span className="flex items-center">
                    <Lock className="h-3.5 w-3.5 mr-2 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4" />
                    Official Landing Page
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-sm">No login credentials available. Please log in first.</p>
          )}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:p-4 md:p-4 lg:p-4 xl:p-4 2xl:p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start space-x-2.5 px-3 py-2.5 rounded-lg text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm text-xs font-medium sm:space-x-3 sm:px-4 sm:py-3 sm:rounded-xl sm:hover:shadow-md sm:text-sm md:space-x-3 md:px-4 md:py-3 md:rounded-xl md:hover:shadow-md md:text-sm lg:space-x-3 lg:px-4 lg:py-3 lg:rounded-xl lg:hover:shadow-md lg:text-sm xl:space-x-3 xl:px-4 xl:py-3 xl:rounded-xl xl:hover:shadow-md xl:text-sm 2xl:space-x-3 2xl:px-4 2xl:py-3 2xl:rounded-xl 2xl:hover:shadow-md 2xl:text-sm"
          >
            <img 
              src="https://img.icons8.com/fluency/48/exit.png" 
              alt="logout" 
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;