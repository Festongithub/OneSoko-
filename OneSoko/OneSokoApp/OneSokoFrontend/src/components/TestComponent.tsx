import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          OneSoko Test Component
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the React app is working correctly.
        </p>
        <div className="space-y-2">
          <p><strong>Frontend:</strong> Running on localhost:5173</p>
          <p><strong>Backend:</strong> Should be on localhost:8000</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
