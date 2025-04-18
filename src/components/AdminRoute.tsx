
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default AdminRoute;
