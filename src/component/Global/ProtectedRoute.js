import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const ProtectedRoute = () => {
  const { token, isLoading } = useSelector((state) => state.auth);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only redirect if initialization is complete and there's no token
  if (!isLoading && !token) {
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
