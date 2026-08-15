import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

class ErrorBoundaryInner extends React.Component {
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

  componentDidUpdate(prevProps) {
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto my-12 p-8 bg-base-100 border border-error/30 rounded-3xl text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto text-2xl">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-base-content">Something went wrong</h2>
          <p className="text-xs text-base-content/70">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <button
            onClick={this.handleReset}
            className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundaryInner locationKey={location.pathname + location.search}>
      {children}
    </ErrorBoundaryInner>
  );
}
