function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'lightblue', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div>🎉 OneSoko is Working! 🎉</div>
      <div style={{ fontSize: '16px', marginTop: '20px' }}>
        If you see this, React is running correctly.
      </div>
      <div style={{ fontSize: '14px', marginTop: '10px', color: '#333' }}>
        Timestamp: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default App;
