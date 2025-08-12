import React, { useState, useEffect } from 'react';
import { config } from '../config/environment';
import { productsAPI, shopsAPI, categoriesAPI } from '../services/api';

const BackendConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [apiData, setApiData] = useState<{
    products: number;
    shops: number;
    categories: number;
  } | null>(null);

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        setConnectionStatus('loading');
        
        // Test multiple API endpoints
        const [productsResponse, shopsResponse, categoriesResponse] = await Promise.all([
          productsAPI.getAll(),
          shopsAPI.getAll(),
          categoriesAPI.getAll()
        ]);

        setApiData({
          products: productsResponse.count || (Array.isArray(productsResponse.results) ? productsResponse.results.length : 0),
          shops: Array.isArray(shopsResponse) ? shopsResponse.length : 0,
          categories: categoriesResponse.length
        });

        setConnectionStatus('success');
      } catch (error) {
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    testBackendConnection();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Backend Connection Test</h2>
      
      <div className="space-y-4">
        {/* API URL Display */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">API Base URL:</p>
          <p className="text-sm font-mono text-gray-800 break-all">{config.API_BASE_URL}</p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'loading' ? 'bg-yellow-400 animate-pulse' :
            connectionStatus === 'success' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium">
            {connectionStatus === 'loading' && 'Testing connection...'}
            {connectionStatus === 'success' && 'Connected successfully!'}
            {connectionStatus === 'error' && 'Connection failed'}
          </span>
        </div>

        {/* Error Message */}
        {connectionStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* API Data */}
        {connectionStatus === 'success' && apiData && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Available Data:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-blue-50 rounded text-center">
                <p className="font-semibold text-blue-600">{apiData.products}</p>
                <p className="text-blue-500">Products</p>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <p className="font-semibold text-green-600">{apiData.shops}</p>
                <p className="text-green-500">Shops</p>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <p className="font-semibold text-purple-600">{apiData.categories}</p>
                <p className="text-purple-500">Categories</p>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        {connectionStatus === 'error' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure your Django backend is running on port 8000</li>
              <li>• Check if CORS is properly configured in Django</li>
              <li>• Verify the API endpoints are accessible</li>
              <li>• Check browser console for detailed error messages</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendConnectionTest; 