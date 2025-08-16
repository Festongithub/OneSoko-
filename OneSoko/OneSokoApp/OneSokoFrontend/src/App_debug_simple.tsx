function App() {
  console.log('🚀 App component is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: '#f0f9ff', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#1e40af', fontSize: '32px', marginBottom: '20px' }}>
        🛍️ OneSoko Debug Test
      </h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <p style={{ color: '#374151', fontSize: '18px', margin: '10px 0' }}>
          ✅ React is working!
        </p>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '10px 0' }}>
          ✅ Component rendering successfully
        </p>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '10px 0' }}>
          📅 Current time: {new Date().toLocaleString()}
        </p>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;
