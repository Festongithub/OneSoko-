#!/usr/bin/env python3
"""
Script to remove development features from frontend components
Makes debug features admin-only
"""

import os
import re
from pathlib import Path

def remove_development_features():
    """Remove development features from frontend components"""
    
    # Components to remove entirely (test components)
    test_components = [
        'src/components/SimpleApiTest.tsx',
        'src/components/ApiTest.tsx',
        'src/components/BackendConnectionTest.tsx',
        'src/components/ProductVariantsApiTest.tsx',
        'src/components/MessagesApiTest.tsx',
        'src/components/CategoriesApiTest.tsx',
        'src/components/OrderApiTest.tsx',
        'src/components/PaymentsApiTest.tsx',
        'src/components/ReviewsApiTest.tsx',
        'src/components/UserProfileApiTest.tsx',
        'src/components/WishlistApiTest.tsx',
        'src/components/ShopSearchDemo.tsx',
    ]
    
    # Remove test components
    for component in test_components:
        if os.path.exists(component):
            os.remove(component)
            print(f"✅ Removed: {component}")
    
    # Files to modify to remove debug features
    files_to_modify = [
        'src/pages/ShopsList.tsx',
        'src/components/products/ProductCard.tsx',
        'src/components/NotificationCenter.tsx',
        'src/pages/ProductVariants.tsx',
        'src/pages/Categories.tsx',
        'src/components/MessagesCenter.tsx',
        'src/components/ProductInquiryModal.tsx',
        'src/pages/ShopOwnerDashboard.tsx',
        'src/pages/UserProfile.tsx',
        'src/pages/ProductDetails.tsx',
        'src/components/InquiryManagement.tsx',
        'src/pages/Products.tsx',
        'src/components/AddProductModal.tsx',
        'src/components/ShopOrderManagement.tsx',
        'src/components/EditProductModal.tsx',
    ]
    
    for file_path in files_to_modify:
        if os.path.exists(file_path):
            modify_file_remove_debug(file_path)
            print(f"✅ Modified: {file_path}")

def modify_file_remove_debug(file_path):
    """Remove debug features from a file"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove console.log statements (except errors)
    content = re.sub(r'console\.log\([^)]*\);?\s*', '', content)
    
    # Remove debug info sections
    content = re.sub(r'// Debug information.*?};?\s*', '', content, flags=re.DOTALL)
    
    # Remove development-only sections
    content = re.sub(r'\{process\.env\.NODE_ENV === \'development\' && \(.*?\)\}', '', content, flags=re.DOTALL)
    
    # Remove debug buttons and controls
    content = re.sub(r'<button[^>]*onClick=\{.*?debug.*?\}[^>]*>.*?</button>', '', content, flags=re.DOTALL)
    
    # Remove debug divs
    content = re.sub(r'<div[^>]*className="[^"]*debug[^"]*"[^>]*>.*?</div>', '', content, flags=re.DOTALL)
    
    # Remove debug variables
    content = re.sub(r'const debugInfo = \{.*?\};', '', content, flags=re.DOTALL)
    
    # Remove test functions
    content = re.sub(r'const testBackendConnection = async \(\) => \{.*?\};', '', content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def create_admin_wrapper():
    """Create admin wrapper for remaining debug features"""
    
    admin_wrapper = '''import React, { ReactNode } from 'react';
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
'''
    
    with open('src/components/AdminOnly.tsx', 'w', encoding='utf-8') as f:
        f.write(admin_wrapper)
    
    print("✅ Created: src/components/AdminOnly.tsx")

def update_app_tsx():
    """Update App.tsx to include AdminProvider"""
    
    app_tsx_path = 'src/App.tsx'
    if not os.path.exists(app_tsx_path):
        return
    
    with open(app_tsx_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add AdminProvider import
    if 'AdminProvider' not in content:
        content = content.replace(
            'import { AuthProvider } from \'./contexts/AuthContext\';',
            'import { AuthProvider } from \'./contexts/AuthContext\';\nimport { AdminProvider } from \'./contexts/AdminContext\';'
        )
        
        # Wrap with AdminProvider
        content = content.replace(
            '<AuthProvider>',
            '<AuthProvider>\n    <AdminProvider>'
        )
        
        content = content.replace(
            '</AuthProvider>',
      '    </AdminProvider>\n  </AuthProvider>'
        )
    
    with open(app_tsx_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Updated: src/App.tsx")

def create_admin_debug_component():
    """Create admin-only debug component"""
    
    admin_debug = '''import React, { useState } from 'react';
import AdminOnly from './AdminOnly';
import { config } from '../config/environment';

const AdminDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testBackendConnection = async () => {
    try {
      const endpoints = [
        { name: 'API Base', url: config.API_BASE_URL },
        { name: 'Shops Endpoint', url: `${config.API_BASE_URL}/shops/` },
        { name: 'Backend Health', url: `${config.BACKEND_URL}/api/health/` },
      ];
      
      const results = [];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          results.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            status: response.status,
            ok: response.ok
          });
        } catch (error) {
          results.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            status: 'ERROR',
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      setDebugInfo(results);
    } catch (error) {
      console.error('Backend connection test failed:', error);
    }
  };

  return (
    <AdminOnly>
      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 border-b border-yellow-200 dark:border-yellow-700">
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Admin Debug Panel
        </h3>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={testBackendConnection}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Backend
          </button>
          <button
            onClick={() => setDebugInfo(null)}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        
        {debugInfo && (
          <pre className="text-xs text-yellow-700 dark:text-yellow-300 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>
    </AdminOnly>
  );
};

export default AdminDebugPanel;
'''
    
    with open('src/components/AdminDebugPanel.tsx', 'w', encoding='utf-8') as f:
        f.write(admin_debug)
    
    print("✅ Created: src/components/AdminDebugPanel.tsx")

def main():
    """Main function"""
    print("🚀 Removing development features from frontend...")
    print("=" * 50)
    
    # Remove test components
    remove_development_features()
    
    # Create admin components
    create_admin_wrapper()
    create_admin_debug_component()
    
    # Update App.tsx
    update_app_tsx()
    
    print("=" * 50)
    print("✅ Development features removed successfully!")
    print("\n📋 Changes made:")
    print("1. Removed all test components (*ApiTest.tsx)")
    print("2. Removed debug features from production components")
    print("3. Created AdminOnly wrapper component")
    print("4. Created AdminDebugPanel for admin-only debugging")
    print("5. Updated App.tsx to include AdminProvider")
    print("\n🔧 Next steps:")
    print("1. Import AdminDebugPanel in pages where needed")
    print("2. Use AdminOnly wrapper for admin-only features")
    print("3. Test admin authentication")

if __name__ == "__main__":
    main() 