// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeout: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.log("Error logged:", errorData);

    // Example: Send to backend
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
    });

    this.props.onReset?.();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails, retryCount } = this.state;
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <AlertTriangle
                  className="text-red-600 dark:text-red-400"
                  size={32}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Error en la aplicación
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Algo salió mal. Por favor, intenta una de las opciones
                  siguientes.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Mensaje de error:
              </p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {error?.message || "Error desconocido"}
              </p>

              {retryCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Intentos de recuperación: {retryCount}
                </p>
              )}
            </div>

            {isDevelopment && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {showDetails ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {showDetails ? "Ocultar" : "Mostrar"} detalles técnicos
                </button>

                {showDetails && (
                  <div className="mt-2 bg-gray-900 dark:bg-black p-4 rounded-lg overflow-auto max-h-64">
                    <pre className="text-xs text-green-400 font-mono">
                      {error?.stack}
                      {"\n\n"}
                      {errorInfo?.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw size={20} />
                Reintentar
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <RefreshCw size={20} />
                Recargar
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Home size={20} />
                Ir al Inicio
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Si el problema persiste, contacta al soporte técnico
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
