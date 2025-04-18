
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface DoctorRouteProps {
  children: React.ReactNode;
}

const DoctorRoute: React.FC<DoctorRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'doctor' || user.approved !== true) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default DoctorRoute;
