import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminProtectedRoute = () => {
  const { token, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  
  // Check both cookie and Redux state
  const encryptedToken = Cookies.get('authToken');
  const hasToken = !!token || !!encryptedToken;
  
  // Get user role from cookies
  const role = Cookies.get('role');
  const isAdmin = role === "Admin Ops";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoading && (!hasToken || !isAuthenticated)) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect non-admin users to home page or show access denied
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;