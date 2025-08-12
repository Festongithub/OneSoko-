import React, { ReactNode } from 'react';
import { useAdmin } from '../contexts/AdminContext';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { isAdmin, isAdminLoading } = useAdmin();

  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AdminOnly; 