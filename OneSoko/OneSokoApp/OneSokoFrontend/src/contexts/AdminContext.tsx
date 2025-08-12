import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  isAdminLoading: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const checkAdminStatus = async () => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }

    try {
      // Check if user has admin privileges
      // This could be a simple check for admin username or a more complex role-based system
      const adminUsernames = ['admin', 'superuser', 'developer'];
      const isUserAdmin = adminUsernames.includes(user.username.toLowerCase()) || 
                         (user.is_staff === true) || 
                         (user.is_superuser === true);
      
      setIsAdmin(Boolean(isUserAdmin));
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      // For now, we'll use a simple check
      // In production, this should be a proper API call to verify admin credentials
      const adminCredentials = {
        'admin': 'admin123',
        'superuser': 'super123',
        'developer': 'dev123'
      };

      if (adminCredentials[username as keyof typeof adminCredentials] === password) {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  useEffect(() => {
    checkAdminStatus();
  }, [isAuthenticated, user]);

  // Check localStorage on mount
  useEffect(() => {
    const storedAdminStatus = localStorage.getItem('isAdmin');
    if (storedAdminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const value: AdminContextType = {
    isAdmin,
    isAdminLoading,
    adminLogin,
    adminLogout,
    checkAdminStatus,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 