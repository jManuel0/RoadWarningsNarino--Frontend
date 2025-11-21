// src/pages/AdminAlertsPage.tsx
import { useEffect, useState } from "react";
import { alertApi } from "@/api/alertApi";
import { Alert } from "@/types/Alert";
import { Trash2, RefreshCw, AlertTriangle, User } from "lucide-react";
import { notificationService } from "@/utils/notifications";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertApi.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Error cargando alertas:", error);
      notificationService.error("Error al cargar alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleDelete = async (alert: Alert) => {
    const confirmMessage = `¿Estás seguro de eliminar esta alerta?

ID: ${alert.id}
Título: ${alert.title}
Usuario: ${alert.username || "Desconocido"}
Creada: ${new Date(alert.createdAt).toLocaleString()}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(alert.id);
      await alertApi.deleteAlert(alert.id);
      setAlerts(alerts.filter((a) => a.id !== alert.id));
      notificationService.success("Alerta eliminada correctamente");
    } catch (error: unknown) {
      console.error("Error eliminando alerta:", error);
      const err = error as Error;

      // Mensajes de error más específicos
      if (err.message?.includes("403") || err.message?.includes("Forbidden")) {
        notificationService.error(
          "No tienes permisos para eliminar esta alerta. " +
            "Solo el creador o un administrador pueden eliminarla."
        );
      } else if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        notificationService.error("Debes iniciar sesión para eliminar alertas");
      } else if (err.message?.includes("404")) {
        notificationService.error("La alerta ya no existe");
        // Removerla de la lista local
        setAlerts(alerts.filter((a) => a.id !== alert.id));
      } else {
        notificationService.error(
          "Error al eliminar la alerta. " +
            "Intenta eliminarla desde Railway o contacta al administrador del backend."
        );
      }
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando alertas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className="text-red-600 dark:text-red-500"
                size={32}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Administrar Alertas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {alerts.length} alertas
                </p>
              </div>
            </div>

            <button
              onClick={loadAlerts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay alertas en el sistema
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Información de la alerta */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{alert.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === "CRITICA"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : alert.severity === "ALTA"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : alert.severity === "MEDIA"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : alert.status === "RESOLVED"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {alert.title}
                    </h3>

                    {alert.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {alert.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Tipo:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {alert.type}
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Ubicación:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {alert.location || "Sin ubicación"}
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Coordenadas:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {alert.latitude.toFixed(6)},{" "}
                          {alert.longitude.toFixed(6)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Usuario:
                        </span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">
                          {alert.username || "Desconocido"} (ID:{" "}
                          {alert.userId || "N/A"})
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Creada:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>

                      {alert.updatedAt && (
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Actualizada:
                          </span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {formatDate(alert.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información adicional */}
                    {(alert.upvotes > 0 || alert.downvotes > 0) && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          👍 {alert.upvotes || 0}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          👎 {alert.downvotes || 0}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón de eliminar */}
                  <button
                    onClick={() => handleDelete(alert)}
                    disabled={deleting === alert.id}
                    className="ml-4 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Eliminar alerta"
                  >
                    {deleting === alert.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
