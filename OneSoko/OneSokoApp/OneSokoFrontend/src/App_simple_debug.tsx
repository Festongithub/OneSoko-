import React from 'react';

function App() {
  console.log('🔍 App_simple_debug rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 OneSoko Debug Mode
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ React is working!</h2>
        <p>If you can see this, React is rendering properly.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Next steps to debug:</h3>
          <ul>
            <li>Check browser console for JavaScript errors</li>
            <li>Check if Tailwind CSS is loading</li>
            <li>Verify all component imports</li>
            <li>Test the complex app step by step</li>
          </ul>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#e8f5e8',
          borderRadius: '4px'
        }}>
          <strong>Current time:</strong> {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default App;
