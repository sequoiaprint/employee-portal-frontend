import { useSelector, useDispatch } from 'react-redux';
import { getStoredCredentials } from '../../redux/auth/auth';


const Resources = () => {
  const { user, credentials } = useSelector((state) => state.auth);




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
     
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
         
            


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

export default Resources;