function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>🚀 OneSoko Minimal Test</h1>
      <p style={{ color: '#666' }}>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
        <p>✅ App component loaded</p>
        <p>✅ Styling applied</p>
        <p>📅 Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default App;
