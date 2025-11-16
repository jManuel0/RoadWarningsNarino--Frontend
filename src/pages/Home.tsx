// src/pages/Home.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useAlertStore } from "@/stores/alertStore";
import { alertApi } from "@/api/alertApi";
import MapView from "@/components/MapView";
import NotificationBell from "@/components/NotificationBell";
import AlertCard from "@/components/AlertCard";
import MapSearchBar from "@/components/MapSearchBar";
import AdvancedFilters from "@/components/AdvancedFilters";
import { Alert, AlertStatus, AlertSeverity } from "@/types/Alert";
import { MapPin, AlertTriangle, RefreshCw, X } from "lucide-react";
import { notificationService } from "@/utils/notifications";

export default function Home() {
  const {
    alerts,
    loading,
    error,
    setAlerts,
    updateAlert,
    removeAlert,
    setLoading,
    setError,
  } = useAlertStore();

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loadAlerts = useCallback(
    async (showNotification = false) => {
      try {
        setLoading(true);

        try {
          const data = await alertApi.getAlerts();
          setAlerts(data);
          setError(null);
        } catch (apiError) {
          // Si el API falla, usar datos de ejemplo
          console.warn("Backend no disponible, usando datos de ejemplo:", apiError);

          const mockAlerts: Alert[] = [
            {
              id: 1,
              type: "DERRUMBE" as any,
              title: "Derrumbe en vía Pasto-Tumaco",
              description: "Deslizamiento de tierra bloquea carril",
              latitude: 1.2136,
              longitude: -77.2811,
              location: "Vía Pasto - Tumaco Km 45",
              municipality: "Pasto",
              severity: AlertSeverity.CRITICA,
              status: AlertStatus.ACTIVE,
              timestamp: new Date().toISOString(),
              username: "Usuario Nariño",
              upvotes: 32,
              downvotes: 1,
            },
            {
              id: 2,
              type: "ACCIDENTE" as any,
              title: "Accidente en Panamericana",
              description: "Colisión entre dos vehículos",
              latitude: 1.195,
              longitude: -77.2767,
              location: "Panamericana Sector Catambuco",
              municipality: "Pasto",
              severity: AlertSeverity.ALTA,
              status: AlertStatus.ACTIVE,
              timestamp: new Date().toISOString(),
              username: "Usuario Nariño",
              upvotes: 18,
              downvotes: 0,
            },
            {
              id: 3,
              type: "CIERRE_VIAL" as any,
              title: "Cierre por mantenimiento",
              description: "Trabajos de pavimentación en curso",
              latitude: 1.2294,
              longitude: -77.2736,
              location: "Avenida Panamericana Norte",
              municipality: "Pasto",
              severity: AlertSeverity.MEDIA,
              status: AlertStatus.ACTIVE,
              timestamp: new Date().toISOString(),
              username: "Usuario Nariño",
              upvotes: 12,
              downvotes: 2,
            },
            {
              id: 4,
              type: "INUNDACION" as any,
              title: "Inundación en vía a Ipiales",
              description: "Agua acumulada por fuertes lluvias",
              latitude: 0.8249,
              longitude: -77.6444,
              location: "Vía Pasto - Ipiales Km 78",
              municipality: "Ipiales",
              severity: AlertSeverity.ALTA,
              status: AlertStatus.ACTIVE,
              timestamp: new Date().toISOString(),
              username: "Usuario Nariño",
              upvotes: 25,
              downvotes: 1,
            },
            {
              id: 5,
              type: "MANTENIMIENTO" as any,
              title: "Obras en puente Guáitara",
              description: "Mantenimiento de infraestructura vial",
              latitude: 1.0833,
              longitude: -77.6167,
              location: "Puente Río Guáitara",
              municipality: "Túquerres",
              severity: AlertSeverity.MEDIA,
              status: AlertStatus.ACTIVE,
              timestamp: new Date().toISOString(),
              username: "Usuario Nariño",
              upvotes: 8,
              downvotes: 0,
            },
            {
              id: 6,
              type: "DERRUMBE" as any,
              title: "Caída de rocas en vía",
              description: "Rocas en la calzada, precaución",
              latitude: 1.6667,
              longitude: -78.75,
              location: "Vía Tumaco - Pasto Km 120",
              municipality: "Tumaco",
              severity: AlertSeverity.ALTA,
              status: AlertStatus.ACTIVE,
              timestamp: new Date().toISOString(),
              username: "Usuario Nariño",
              upvotes: 15,
              downvotes: 0,
            },
          ];

          setAlerts(mockAlerts);
          setError("Modo demo - Backend no disponible");
        }

        if (showNotification) {
          notificationService.success("Alertas actualizadas");
        }
      } catch (err) {
        console.error("Error crítico:", err);
        setError("Error al cargar alertas");
        notificationService.error("No se pudieron cargar las alertas");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [setLoading, setAlerts, setError]
  );

  // Permiso de notificaciones
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Cargar alertas al inicio + polling
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => loadAlerts(), 30000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Manejo del modal de detalle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClickOutside = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      if (!inside) handleCloseModal();
    };

    if (selectedAlert) {
      if (!dialog.open) dialog.showModal();
      dialog.addEventListener("click", handleClickOutside);
    } else if (dialog.open) {
      dialog.close();
    }

    return () => {
      dialog.removeEventListener("click", handleClickOutside);
    };
  }, [selectedAlert]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAlerts(true);
  };

  const handleStatusChange = async (id: number, status: AlertStatus) => {
    try {
      await alertApi.updateAlertStatus(id, status);
      updateAlert(id, { status });
      notificationService.success(
        `Alerta marcada como ${
          status === AlertStatus.RESOLVED ? "resuelta" : "en progreso"
        }`
      );
    } catch (err) {
      console.error("Error al actualizar alerta:", err);
      notificationService.error("No se pudo actualizar el estado de la alerta");
    }
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("¿Estás seguro de eliminar esta alerta?");
    if (!ok) return;

    try {
      await alertApi.deleteAlert(id);
      removeAlert(id);
      notificationService.success("Alerta eliminada correctamente");
      if (selectedAlert?.id === id) {
        setSelectedAlert(null);
      }
    } catch (err) {
      console.error("Error al eliminar alerta:", err);
      notificationService.error("No se pudo eliminar la alerta");
    }
  };

  const handleSearch = (filtered: Alert[]) => {
    setFilteredAlerts(filtered);
    setIsFiltered(true);
  };

  const handleResetSearch = () => {
    setFilteredAlerts([]);
    setIsFiltered(false);
  };

  const handleCloseModal = () => setSelectedAlert(null);

  // Derivados locales
  const activeAlerts = alerts.filter((a) => a.status === AlertStatus.ACTIVE);

  const criticalAlerts = alerts.filter(
    (a) =>
      a.status === AlertStatus.ACTIVE &&
      a.severity === AlertSeverity.CRITICA
  );

  const displayAlerts = isFiltered ? filteredAlerts : activeAlerts;

  const getEmptyAlertsMessage = () =>
    isFiltered
      ? "No se encontraron alertas con los filtros aplicados"
      : "No hay alertas activas";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className="text-red-600 dark:text-red-500"
                size={32}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Alertas Viales
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pasto, Nariño - Colombia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Actualizar alertas"
                aria-label="Actualizar alertas"
              >
                <RefreshCw
                  size={20}
                  className={`${
                    isRefreshing ? "animate-spin" : ""
                  } text-gray-700 dark:text-gray-200`}
                />
              </button>

              <NotificationBell
                alerts={activeAlerts}
                onAlertClick={setSelectedAlert}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Activas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertas Activas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {activeAlerts.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <MapPin
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Críticas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertas Críticas
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                  {criticalAlerts.length}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <AlertTriangle
                  className="text-red-600 dark:text-red-500"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Alertas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {alerts.length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <MapPin
                  className="text-green-600 dark:text-green-500"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa + búsqueda */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <MapSearchBar
                  alerts={activeAlerts}
                  onSearch={handleSearch}
                  onReset={handleResetSearch}
                />
              </div>
              <AdvancedFilters
                alerts={activeAlerts}
                onFilterChange={handleSearch}
                onReset={handleResetSearch}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Mapa de Alertas
                </h2>
                {isFiltered && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {displayAlerts.length} de {activeAlerts.length} alertas
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                  {error}
                </div>
              ) : (
                <MapView alerts={displayAlerts} />
              )}
            </div>
          </div>

          {/* Lista de alertas */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Alertas Recientes
                </h2>
                {isFiltered && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Filtradas
                  </span>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {displayAlerts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {getEmptyAlertsMessage()}
                  </p>
                ) : (
                  displayAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal detalle alerta */}
      <dialog
        ref={dialogRef}
        aria-labelledby="modal-title"
        className="backdrop:bg-black backdrop:bg-opacity-50 bg-transparent p-4 max-w-2xl w-full rounded-lg open:flex open:flex-col"
      >
        {selectedAlert && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3
                id="modal-title"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {selectedAlert.type.replace("_", " ")}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            <AlertCard
              alert={selectedAlert}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          </div>
        )}
      </dialog>
    </div>
  );
}
