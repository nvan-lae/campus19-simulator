import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth();

  console.log('[ProtectedRoute] Check:', { token: !!token });

  // Only check if we have a token. User data loads in background, doesn't block rendering
  if (!token) {
    console.log('[ProtectedRoute] Redirecting to login (no token)');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Has token, rendering children');
  return <>{children}</>;
};
