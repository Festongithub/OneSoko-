import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard - Redirects authenticated users away from auth pages
 * Used for login, register, and other auth-only pages
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If user is already authenticated, redirect them away from auth pages
  if (isAuthenticated && user) {
    // Check if user came from a specific page
    const from = (location.state as any)?.from?.pathname || redirectTo;
    
    // Smart redirect based on user type
    if (user.profile?.is_shopowner) {
      // Shop owners go to their dashboard or shops list
      return <Navigate to="/shop-dashboard" replace />;
    } else {
      // Regular users go to main page or where they came from
      return <Navigate to={from} replace />;
    }
  }

  // Render auth pages for unauthenticated users
  return <>{children}</>;
};

export default AuthGuard;
