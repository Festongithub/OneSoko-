import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SmartRedirectProps {
  children: React.ReactNode;
}

const SmartRedirect: React.FC<SmartRedirectProps> = ({ children }) => {
  const { isAuthenticated, isShopOwner, userShops, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is authenticated and not loading
    if (!isLoading && isAuthenticated && isShopOwner && userShops.length > 0) {
      // Redirect shop owners with shops to their dashboard
      navigate('/shop-dashboard', { replace: true });
    }
  }, [isAuthenticated, isShopOwner, userShops, isLoading, navigate]);

  return <>{children}</>;
};

export default SmartRedirect;
