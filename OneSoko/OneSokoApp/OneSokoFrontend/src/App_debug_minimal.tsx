import React from 'react';

function App() {
  console.log('App component rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>OneSoko Debug</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0',
        border: '1px solid #ccc'
      }}>
        <h3>Debug Info:</h3>
        <p>React: {React.version}</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;
