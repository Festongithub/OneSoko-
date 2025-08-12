import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ApiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testBackendConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test basic API connection
      const response = await fetch('http://localhost:8000/api/');
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Backend is accessible! Available endpoints: ${Object.keys(data).join(', ')}`);
      } else {
        setTestResult(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRegistration = async () => {
    setIsLoading(true);
    setTestResult('Testing registration...');
    
    try {
      const testData = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123',
        confirmPassword: 'TestPass123',
        first_name: 'Test',
        last_name: 'User'
      };

      const result = await authAPI.register(testData);
      setTestResult(`✅ Registration successful! User: ${result.username}`);
    } catch (error) {
      setTestResult(`❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing login...');
    
    try {
      const result = await authAPI.login({
        username: 'testuser',
        password: 'TestPass123'
      });
      setTestResult(`✅ Login successful! Token received.`);
    } catch (error) {
      setTestResult(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testBackendConnection}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Backend Connection
          </button>
        </div>
        
        <div>
          <button
            onClick={testRegistration}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Registration
          </button>
        </div>
        
        <div>
          <button
            onClick={testLogin}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Login
          </button>
        </div>
      </div>

      {testResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Test Result:</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Make sure Django backend is running on port 8000</li>
          <li>• Check if CORS is properly configured in Django</li>
          <li>• Verify the API endpoints are accessible</li>
          <li>• Check browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest; 