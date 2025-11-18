import { useEffect, useCallback, useState } from "react";
import { useAlertStore } from "@/stores/alertStore";
import { alertApi } from "@/api/alertApi";
import { analyticsApi } from "@/api/analyticsApi";
import type { AnalyticsDashboard } from "@/types/Analytics";
import Dashboard from "@/components/Dashboard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BarChart3 } from "lucide-react";

export default function Statistics() {
  const { alerts, loading, error, setAlerts, setLoading, setError } =
    useAlertStore();
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(
    null
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [alertsData, dashboard] = await Promise.all([
        alertApi.getAlerts(),
        analyticsApi.getDashboard(),
      ]);

      setAlerts(alertsData);
      setDashboardData(dashboard);
    } catch (err) {
      console.error(err);
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setAlerts, setError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <BarChart3
              className="text-blue-600 dark:text-blue-400"
              size={32}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Estadísticas y Reportes
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Análisis detallado de alertas viales
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            );
          }

          if (error) {
            return (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                {error}
              </div>
            );
          }

          return (
            <Dashboard alerts={alerts} analyticsDashboard={dashboardData} />
          );
        })()}
      </div>
    </div>
  );
}
