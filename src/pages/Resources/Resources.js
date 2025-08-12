import { useSelector, useDispatch } from 'react-redux';
import { getStoredCredentials } from '../../redux/auth/auth';
import { 
  Github, 
  Download, 
  LogIn,
  ExternalLink,
  Lock,
  AlertTriangle
} from 'lucide-react';

const Resources = () => {
  const { user, credentials } = useSelector((state) => state.auth);
  const cookieCredentials = getStoredCredentials();

  // Login URLs
  const loginUrl = cookieCredentials?.name && cookieCredentials?.password 
    ? `https://form.sequoia-print.com/Login?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
    : null;

  const localLoginUrl = cookieCredentials?.name && cookieCredentials?.password 
    ? `https://cof.sequoia-print.com/?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
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

  // GitHub Links
  const githubLinks = [
    {
      name: 'Frontend Repository',
      url: 'https://github.com/yourorg/frontend-repo',
      description: 'Main application frontend code'
    },
    {
      name: 'Backend Repository',
      url: 'https://github.com/yourorg/backend-repo',
      description: 'API and server-side code'
    },
    {
      name: 'Documentation',
      url: 'https://github.com/yourorg/docs',
      description: 'Project documentation and guides'
    }
  ];

  // Download Links
  const downloadLinks = [
    {
      name: 'User Manual',
      url: '#',
      description: 'PDF guide for using the application'
    },
    {
      name: 'API Documentation',
      url: '#',
      description: 'Complete API reference'
    },
    {
      name: 'Desktop Client',
      url: '#',
      description: 'Windows/Mac/Linux application'
    }
  ];
const handleLocalLoginAndNavigate = () => {

  window.location.href = "https://sequoia-print.com";
};
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-8">Resources Center</h1>
        
        {/* Auto Login Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-orange-100">
          <div className="bg-orange-600 px-4 py-3 flex items-center">
            <LogIn className="h-5 w-5 text-white mr-2" />
            <h2 className="text-lg font-semibold text-white">Application Auto Login</h2>
          </div>
          <div className="p-6">
            {loginUrl ? (
              <>
                <p className="text-gray-600 mb-4">Quick access to your applications with stored credentials.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAutoLogin}
                    className="flex items-center justify-between w-full md:w-1/2 px-4 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                  >
                    <span className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Forms Portal
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  
                  {localLoginUrl && (
                    <button
                      onClick={handleLocalLogin}
                      className="flex items-center justify-between w-full md:w-1/2 px-4 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                    >
                      <span className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Client Portal
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                  <div>
                   
                  </div>
                   <button
                      onClick={handleLocalLoginAndNavigate}
                      className="flex items-center justify-between w-full md:w-1/2 px-4 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                    >
                      <span className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                       Official Landing Page
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                </div>
               
              </>
            ) : (
              <p className="text-gray-500">No login credentials available. Please log in first.</p>
            )}
          </div>
        </div>

        {/* GitHub Links Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-orange-100">
          <div className="bg-orange-600 px-4 py-3 flex items-center">
            <Github className="h-5 w-5 text-white mr-2" />
            <h2 className="text-lg font-semibold text-white">GitHub Repositories</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {githubLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-2">
                    <Github className="h-5 w-5 text-gray-700 mr-2" />
                    <h3 className="font-medium text-gray-900 group-hover:text-orange-600">{link.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{link.description}</p>
                  <div className="mt-2 flex items-center text-sm text-orange-600">
                    <span>View repository</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Downloads Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-orange-100">
          <div className="bg-orange-600 px-4 py-3 flex items-center">
            <Download className="h-5 w-5 text-white mr-2" />
            <h2 className="text-lg font-semibold text-white">Downloads</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloadLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="group block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-2">
                    <Download className="h-5 w-5 text-gray-700 mr-2" />
                    <h3 className="font-medium text-gray-900 group-hover:text-orange-600">{link.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{link.description}</p>
                  <div className="mt-2 flex items-center text-sm text-orange-600">
                    <span>Download file</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;