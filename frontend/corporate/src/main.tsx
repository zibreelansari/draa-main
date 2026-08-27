import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './components/corporate/DraaCorporateHome.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#b91c1c', background: '#fef2f2', minHeight: '100vh', zIndex: 99999, position: 'relative' }}>
          <h2 style={{ margin: '0 0 16px' }}>Application Rendering Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 20, border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
            {this.state.error?.toString()}
            {'\n\nComponent Stack:'}
            {this.state.errorInfo?.componentStack || 'No component stack available'}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);
