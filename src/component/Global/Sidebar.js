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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarHeight, setSidebarHeight] = useState('100vh');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const role = Cookies.get('role');
  const isAdmin = role === "Admin Ops";
   useEffect(() => {
    setIsCollapsed(true);
  }, [location.pathname]);
  // Handle responsive behavior and calculate sidebar height
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);
      setSidebarHeight(`${height}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add blur effect to main content when sidebar is open
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (!isCollapsed) {
        mainContent.style.filter = 'blur(4px)';
        mainContent.style.transition = 'filter 0.3s ease';
      } else {
        mainContent.style.filter = 'none';
      }
    }
    
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
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/'
    },
    {
      id: 'news',
      label: 'News',
      icon: (
        <img 
          src="https://img.icons8.com/fluency/48/news.png" 
          alt="news" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/news'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <img 
          src="https://img.icons8.com/avantgarde/100/combo-chart.png" 
          alt="Insights" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/insights'
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: (
        <img 
          src="https://img.icons8.com/dusk/64/administrator-male.png" 
          alt="clients" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/clients'
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: (
        <img 
          src="https://img.icons8.com/pulsar-color/48/task.png" 
          alt="assignments" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/assignment'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <img 
          src="https://img.icons8.com/pulsar-color/48/project.png" 
          alt="projects" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/projects'
    },
    {
      id: 'hr',
      label: 'HR Hub',
      icon: (
        <img 
          src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-consulting-human-resources-flaticons-lineal-color-flat-icons.png" 
          alt="hr" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/hr'
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: (
        <img 
          src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-links-live-streaming-flaticons-lineal-color-flat-icons-2.png" 
          alt="resources" 
          className="w-4 h-4 flex-shrink-0"
        />
      ),
      path: '/resources'
    },
    // Only show Root Management for admin users
    ...(isAdmin ? [{
      id: 'manage',
      label: 'Root Management',
      icon: (
        <img 
          src="https://img.icons8.com/stickers/100/admin-settings-male.png" 
          alt="management" 
          className="w-4 h-4 flex-shrink-0"
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
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const cookieCredentials = getStoredCredentials();

  const loginUrl = cookieCredentials?.name && cookieCredentials?.password 
    ? `https://form.sequoia-print.com/Login?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
    : null;

  const localLoginUrl = cookieCredentials?.name && cookieCredentials?.password 
    ? `https://clientops.sequoia-print.com/login?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
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

  // Dynamic width classes based on screen size
  const getSidebarWidth = () => {
    if (isMobile) return 'w-72 max-w-[85vw]'; // Mobile: 288px or 85% of viewport width
    return 'w-60 sm:w-64 md:w-72 lg:w-80'; // Desktop: responsive widths
  };

  const getToggleButtonPosition = () => {
    if (isCollapsed) return 'left-3 sm:left-4';
    if (isMobile) return 'left-64 max-w-[85vw]:left-[calc(85vw-3rem)]';
    return 'left-56 sm:left-60 md:left-68 lg:left-76';
  };

  return (
    <>
      {/* Toggle Button */}
      <div className={`fixed top-3 sm:top-4 z-50 transition-all duration-500 ease-in-out ${
        isCollapsed 
          ? 'left-3 sm:left-4 opacity-100' 
          : `${getToggleButtonPosition()} opacity-0 pointer-events-none`
      }`}>
        <button
          onClick={toggleSidebar}
          className="p-2 sm:p-2.5 bg-[#eb772b] rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:bg-[#eb772b] transition-all duration-300 border border-gray-200 transform hover:scale-105 backdrop-blur-sm bg-[#eb772b]/95"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex flex-col justify-center items-center space-y-0.5 sm:space-y-1">
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
            <div className="w-full h-0.5 bg-white rounded-full transition-all duration-300"></div>
          </div>
        </button>
      </div>

      {/* Sidebar Overlay - Only on mobile */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-500 ease-in-out z-40 md:hidden ${
          !isCollapsed ? 'opacity-50 bg-opacity-50 backdrop-blur-sm' : 'opacity-0 pointer-events-none bg-opacity-0'
        }`} 
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 bg-white shadow-xl sm:shadow-2xl z-50 transition-all duration-500 ease-in-out transform ${
          !isCollapsed ? 'translate-x-0' : '-translate-x-full'
        } ${getSidebarWidth()} flex flex-col`}
        style={{ height: sidebarHeight }}
      >
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between">
          <div className="flex items-center justify-center flex-1">
            <img 
              src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" 
              alt="Sequoia Print Logo" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 flex-shrink-0"
          >
            <img 
              src="https://img.icons8.com/fluency/48/delete-sign.png" 
              alt="close" 
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-left ${
                    isActiveRoute(item.path)
                      ? 'bg-gradient-to-r from-orange-100 to-orange-50 shadow-sm border-l-3 sm:border-l-4 border-orange-500'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                  }`}
                  style={{ color: '#EA7125' }}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Portal Links - Fixed */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100">
          {loginUrl ? (
            <div className="flex flex-col gap-2 sm:gap-3">
              <button
                onClick={handleAutoLogin}
                className="flex items-center justify-between w-full px-3 py-2 sm:px-4 sm:py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-xs sm:text-sm"
              >
                <span className="flex items-center min-w-0">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Forms Portal</span>
                </span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ml-2" />
              </button>
              
              {localLoginUrl && (
                <button
                  onClick={handleLocalLogin}
                  className="flex items-center justify-between w-full px-3 py-2 sm:px-4 sm:py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-xs sm:text-sm"
                >
                  <span className="flex items-center min-w-0">
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Client Portal</span>
                  </span>
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ml-2" />
                </button>
              )}
              
              <button
                onClick={handleLocalLoginAndNavigate}
                className="flex items-center justify-between w-full px-3 py-2 sm:px-4 sm:py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors text-xs sm:text-sm"
              >
                <span className="flex items-center min-w-0">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Official Landing Page</span>
                </span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ml-2" />
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-xs sm:text-sm">No login credentials available. Please log in first.</p>
          )}
        </div>

        {/* Logout - Fixed */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm text-xs sm:text-sm font-medium"
          >
            <img 
              src="https://img.icons8.com/fluency/48/exit.png" 
              alt="logout" 
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;