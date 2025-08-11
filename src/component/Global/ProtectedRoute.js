import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
  const { token, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  
  // Check both cookie and Redux state
  const encryptedToken = Cookies.get('authToken');
  const hasToken = !!token || !!encryptedToken;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoading && !hasToken && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />
      <Sidebar />
      <main className="pt-16 min-h-screen overflow-auto transition-all duration-300 ease-in-out">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute;