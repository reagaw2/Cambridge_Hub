import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0d0d1a', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.875rem' }}>{String(this.state.error)}</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ background: '#22c55e', color: 'black', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)