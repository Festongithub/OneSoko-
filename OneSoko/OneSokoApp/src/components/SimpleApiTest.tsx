import React, { useState } from 'react';

const SimpleApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testCors = async () => {
    setIsLoading(true);
    setResult('Testing CORS...');
    
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpass'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Success! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ CORS Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleGet = async () => {
    setIsLoading(true);
    setResult('Testing simple GET...');
    
    try {
      const response = await fetch('http://localhost:8000/api/');
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ GET Success! Available endpoints: ${Object.keys(data).join(', ')}`);
      } else {
        setResult(`❌ GET Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ GET Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">CORS Test</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testSimpleGet}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Simple GET Request
        </button>
        
        <button
          onClick={testCors}
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Test CORS (POST Request)
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Result:</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">CORS Fix Required:</h3>
        <p className="text-sm text-yellow-700 mb-2">
          If you see "CORS Error", you need to configure CORS in your Django backend:
        </p>
        <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
          <li>Install: <code className="bg-yellow-100 px-1 rounded">pip install django-cors-headers</code></li>
          <li>Add to INSTALLED_APPS: <code className="bg-yellow-100 px-1 rounded">'corsheaders'</code></li>
          <li>Add to MIDDLEWARE (first): <code className="bg-yellow-100 px-1 rounded">'corsheaders.middleware.CorsMiddleware'</code></li>
          <li>Add CORS settings (see DJANGO_CORS_SETUP.md)</li>
          <li>Restart Django server</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleApiTest; 