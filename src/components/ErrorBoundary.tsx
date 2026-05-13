import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AuditAI Range Error]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
          <div className="max-w-md w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Something broke.</h1>
            <p className="text-sm text-zinc-600">
              Your saved progress is safe in your browser. Reloading usually fixes the issue.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg p-3 overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
