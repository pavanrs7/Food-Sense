"use client";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary p-4 bg-light rounded mb-4">
          <h2 className="text-danger">Something went wrong</h2>
          <p>
            The application encountered an error. Please try refreshing the
            page.
          </p>
          <details className="mt-3">
            <summary>Error Details</summary>
            <p className="text-danger">
              {this.state.error && this.state.error.toString()}
            </p>
            <div className="mt-2">
              <pre className="bg-dark text-light p-3 rounded">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          <button
            className="btn btn-primary mt-3"
            onClick={() => (window.location.href = "/")}
          >
            Go to Home Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
