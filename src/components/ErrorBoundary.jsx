import { Component } from 'react';

/**
 * Error Boundary component for catching and displaying runtime errors.
 * Prevents the entire app from crashing when a component fails.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="cesium-error">
          <div className="loading-orbital" style={{ marginBottom: '2rem' }}>
            <div className="loading-ring" style={{ borderColor: '#ef4444', opacity: 0.5 }} />
            <div className="loading-ring" style={{ borderColor: '#ef4444', opacity: 0.7 }} />
            <div className="loading-core" style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#ef4444',
            marginBottom: '0.5rem'
          }}>
            Application Error
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            maxWidth: '400px',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#22d3ee',
              background: 'var(--space-panel, #0f1419)',
              border: '1px solid #164e63',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#22d3ee';
              e.target.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#164e63';
              e.target.style.boxShadow = 'none';
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
