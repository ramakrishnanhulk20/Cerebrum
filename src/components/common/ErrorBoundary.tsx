import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReport = () => {
    const subject = encodeURIComponent('Cerebrum Error Report');
    const body = encodeURIComponent(
      `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}`
    );
    window.open(`mailto:support@cerebrum.health?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 md:p-12">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl" />
                  <div className="relative bg-red-500/10 border-2 border-red-500/30 rounded-full p-6">
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-gray-400 text-center mb-6">
                We're sorry for the inconvenience. An unexpected error occurred while processing your request.
              </p>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 bg-black/40 border border-red-500/20 rounded-xl p-4">
                  <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-sm text-gray-400 space-y-2">
                    <div>
                      <strong className="text-red-400">Error:</strong>
                      <pre className="mt-1 p-2 bg-black/60 rounded overflow-x-auto text-xs">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong className="text-red-400">Stack Trace:</strong>
                        <pre className="mt-1 p-2 bg-black/60 rounded overflow-x-auto text-xs max-h-40 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </motion.button>
              </div>

              {/* Report Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleReport}
                className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/5 border border-white/20 text-gray-400 hover:text-white font-medium rounded-xl transition-all duration-200"
              >
                <Mail className="w-5 h-5" />
                Report this error
              </motion.button>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-500 mt-6">
                If this error persists, please contact our support team
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
