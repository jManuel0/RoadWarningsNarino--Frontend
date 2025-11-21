// src/pages/DebugPage.tsx
import { useEffect, useState } from "react";
import { API_BASE } from "@/api/baseUrl";
import { alertApi } from "@/api/alertApi";

export default function DebugPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setApiUrl(API_BASE);
    setEnvVars({
      VITE_API_URL: import.meta.env.VITE_API_URL || "NO CONFIGURADA",
      MODE: import.meta.env.MODE,
      DEV: String(import.meta.env.DEV),
      PROD: String(import.meta.env.PROD),
    });
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`${API_BASE}/alert`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult({
        success: true,
        data: data,
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testWithAlertApi = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const alerts = await alertApi.getAlerts();
      setTestResult({
        success: true,
        data: alerts,
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🔍 Página de Diagnóstico
        </h1>

        {/* Variables de Entorno */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Variables de Entorno
          </h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {key}:
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* URL de la API */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            URL de la API
          </h2>
          <div className="font-mono text-sm">
            <span className="font-bold text-blue-600 dark:text-blue-400">
              API_BASE:
            </span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {apiUrl}
            </span>
          </div>
          <div className="mt-4">
            <a
              href={`${apiUrl}/alert`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Abrir {apiUrl}/alert en nueva pestaña →
            </a>
          </div>
        </div>

        {/* Pruebas de Conexión */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Pruebas de Conexión
          </h2>

          <div className="flex gap-4 mb-4">
            <button
              onClick={testApiConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Probando..." : "Probar con Fetch"}
            </button>

            <button
              onClick={testWithAlertApi}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Probando..." : "Probar con alertApi"}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg ${
                testResult.success
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  testResult.success
                    ? "text-green-800 dark:text-green-400"
                    : "text-red-800 dark:text-red-400"
                }`}
              >
                {testResult.success ? "✅ Éxito" : "❌ Error"}
              </h3>

              {testResult.success ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Alertas recibidas:{" "}
                    {Array.isArray(testResult.data)
                      ? testResult.data.length
                      : "N/A"}
                  </p>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                      Ver datos completos
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-96">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-400">
                  {testResult.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Información del Navegador */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información del Navegador
          </h2>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>User Agent:</strong> {navigator.userAgent}
            </div>
            <div>
              <strong>Online:</strong> {navigator.onLine ? "Sí" : "No"}
            </div>
            <div>
              <strong>URL actual:</strong> {window.location.href}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
