import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 min-h-screen text-red-900 font-sans">
          <h1 className="text-3xl font-black mb-4">Something went wrong!</h1>
          <pre className="bg-white p-4 rounded-xl border border-red-200 overflow-auto text-sm">
            {this.state.error?.toString()}
            <br/><br/>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-red-500 text-white px-6 py-2 rounded-xl font-bold"
          >
            Reload Page
          </button>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}
