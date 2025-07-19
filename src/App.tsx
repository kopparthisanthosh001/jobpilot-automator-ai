function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Jobpilot.ai</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>AI-Powered Job Search</p>
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;