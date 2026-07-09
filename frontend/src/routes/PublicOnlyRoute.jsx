import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/chat" replace />;

  return <Outlet />;
};

export default PublicOnlyRoute;
