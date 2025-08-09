import { useSelector, useDispatch } from 'react-redux';
import { logout, getStoredCredentials } from '../../redux/auth/auth';
import { Route } from 'react-router-dom';

const Routing = () => {
  const { user, credentials } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  // Get credentials from cookies
  const cookieCredentials = getStoredCredentials();

  // Create login URL for the Next.js app (3001)
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Welcome</h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">User Information</h2>
            <div className="mt-4">
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            <h2 className="text-lg font-medium text-gray-900 mt-6">Stored Credentials</h2>
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From Redux State:</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {credentials?.name || 'Not available'}</p>
                    <p><span className="font-medium">Password:</span> {credentials?.password ? '••••••••' : 'Not available'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Direct from Cookies:</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {cookieCredentials?.name || 'Not available'}</p>
                    <p><span className="font-medium">Password:</span> {cookieCredentials?.password ? '••••••••' : 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>

            {loginUrl && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Auto Login Options</h3>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleAutoLogin}
                    className="w-fit px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Auto Login (Production) in New Tab
                  </button>
                  {localLoginUrl && (
                    <button
                      onClick={handleLocalLogin}
                      className="w-fit px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Auto Login (Localhost:3001) in New Tab
                    </button>
                  )}
                </div>
                <p className="text-xs text-red-500 mt-2">
                  Warning: These links contain sensitive credentials. Share with caution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routing;