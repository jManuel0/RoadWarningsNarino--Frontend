// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Error en la aplicación
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Algo salió mal
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {this.state.error?.message || "Error desconocido"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw size={20} />
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
