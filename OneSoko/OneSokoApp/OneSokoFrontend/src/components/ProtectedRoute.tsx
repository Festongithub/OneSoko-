import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = true,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if profile setup is needed
  if (requireProfile && user && !user.first_name && !user.last_name) {
    // If user has no profile info, redirect to profile setup
    return <Navigate to="/profile-setup" state={{ from: location }} replace />;
  }

  // Render protected content if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute; 