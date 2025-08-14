import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireShopOwner?: boolean;
}

const ProtectedRoute = ({ children, requireShopOwner = false }: ProtectedRouteProps) => {
  const { isAuthenticated, userProfile } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireShopOwner && !userProfile?.is_shopowner) {
    // Redirect to home if user is not a shop owner
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
