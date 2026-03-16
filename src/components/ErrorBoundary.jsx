import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>😞 Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page or go back to <Link to="/">home</Link>.</p>
          <p style={{ color: '#555', marginTop: '20px' }}>{this.state.error?.message || ''}</p>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;