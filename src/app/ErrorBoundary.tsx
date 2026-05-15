import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Lexora runtime error:', error, info);
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell full-shell">
          <section className="screen-panel error-screen">
            <p className="eyebrow">LEXORA</p>
            <h2>Something went wrong</h2>
            <p className="subtitle">The game hit an unexpected error. Reloading usually restores the session.</p>
            <button className="primary-button" onClick={this.reload}>Reload</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
