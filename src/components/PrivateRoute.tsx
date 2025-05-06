import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
